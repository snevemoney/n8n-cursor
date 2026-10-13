"""mcp_oauth new logic only: well-known URL candidates, WWW-Authenticate parsing, discovery fallback, offline re-auth status/plan.
No network, no browser, no login. HTTP is stubbed; token env is a temp file."""
import importlib.util, os, tempfile, unittest, urllib.error
from pathlib import Path

spec = importlib.util.spec_from_file_location("mcp_oauth_t", Path(__file__).with_name("mcp_oauth.py"))
o = importlib.util.module_from_spec(spec)
spec.loader.exec_module(o)


class WellKnown(unittest.TestCase):
    def test_path_insert_form_first_then_append(self):
        self.assertEqual(o.well_known_urls("https://evenslouis.ca/n8n/mcp-server/http", "oauth-protected-resource"),
                         ["https://evenslouis.ca/.well-known/oauth-protected-resource/n8n/mcp-server/http",
                          "https://evenslouis.ca/n8n/mcp-server/http/.well-known/oauth-protected-resource"])

    def test_root_resource_has_one_candidate(self):
        self.assertEqual(o.well_known_urls("https://mcp.hostinger.com", "oauth-authorization-server"),
                         ["https://mcp.hostinger.com/.well-known/oauth-authorization-server"])
        self.assertEqual(o.well_known_urls("https://mcp.hostinger.com/", "x"), ["https://mcp.hostinger.com/.well-known/x"])

    def test_www_authenticate(self):
        h = 'Bearer realm="mcp", resource_metadata="https://evenslouis.ca/.well-known/oauth-protected-resource/n8n/mcp-server/http", error="invalid_token"'
        self.assertEqual(o.resource_metadata_from_header(h), "https://evenslouis.ca/.well-known/oauth-protected-resource/n8n/mcp-server/http")
        self.assertEqual(o.resource_metadata_from_header("Bearer"), "")
        self.assertEqual(o.resource_metadata_from_header('Bearer resource_metadata="http://insecure/x"'), "")  # https only


class DiscoverFallback(unittest.TestCase):
    def test_tries_candidates_until_one_answers(self):
        calls = []

        def fake(url, **k):
            calls.append(url)
            if url.endswith("/n8n/mcp-server/http") and "/.well-known/oauth-protected-resource/n8n" in url:
                raise urllib.error.HTTPError(url, 404, "nf", {}, None)
            if "oauth-protected-resource" in url:
                return {"resource": "https://evenslouis.ca/n8n/mcp-server/http", "authorization_servers": ["https://evenslouis.ca/n8n"]}
            return {"issuer": "https://evenslouis.ca/n8n", "authorization_endpoint": "https://evenslouis.ca/n8n/a",
                    "token_endpoint": "https://evenslouis.ca/n8n/t", "registration_endpoint": "https://evenslouis.ca/n8n/r"}
        o._http_json = fake
        meta = o.discover("https://evenslouis.ca/n8n/mcp-server/http")
        self.assertEqual(meta["token_endpoint"], "https://evenslouis.ca/n8n/t")
        self.assertEqual(len([c for c in calls if "protected-resource" in c]), 2)

    def test_all_404_raises_a_clear_error(self):
        def fake(url, **k):
            raise urllib.error.HTTPError(url, 404, "nf", {}, None)
        o._http_json = fake
        with self.assertRaises(RuntimeError) as cm:
            o.discover("https://evenslouis.ca/n8n/mcp-server/http")
        self.assertIn("protected resource", str(cm.exception))


class ReauthStatus(unittest.TestCase):
    def setUp(self):
        self.d = tempfile.mkdtemp()
        o.ENV_PATH = Path(self.d) / ".env.mcp"
        for k in ("N8N_MCP_ACCESS_TOKEN", "N8N_MCP_REFRESH_TOKEN", "N8N_MCP_CLIENT_ID", "N8N_MCP_EXPIRES_AT"):
            os.environ.pop(k, None)

    def write(self, **kv):
        o.ENV_PATH.write_text("".join(f"{k}={v}\n" for k, v in kv.items()))

    def test_n8n_as_found_needs_a_login_not_a_refresh(self):
        self.write(N8N_MCP_ACCESS_TOKEN="aaaa", N8N_MCP_REFRESH_TOKEN="rrrr")
        st = o.reauth_status("n8n")
        self.assertTrue(st["needs_login"])
        self.assertFalse(st["can_refresh"])
        self.assertEqual((st["has_access"], st["has_refresh"], st["has_client_id"]), (True, True, False))
        self.assertIn("client", st["reason"])

    def test_refreshable_when_client_and_refresh_present(self):
        self.write(N8N_MCP_ACCESS_TOKEN="a", N8N_MCP_REFRESH_TOKEN="r", N8N_MCP_CLIENT_ID="c", N8N_MCP_EXPIRES_AT="1")
        st = o.reauth_status("n8n")
        self.assertTrue(st["can_refresh"])
        self.assertFalse(st["needs_login"])

    def test_nothing_stored(self):
        st = o.reauth_status("n8n")
        self.assertTrue(st["needs_login"])
        self.assertFalse(st["has_access"])

    def test_unknown_server(self):
        self.assertEqual(o.reauth_status("nope")["reason"], "unknown server")

    def test_status_and_plan_never_contain_token_values(self):
        self.write(N8N_MCP_ACCESS_TOKEN="SECRETACCESS123", N8N_MCP_REFRESH_TOKEN="SECRETREFRESH456")
        blob = repr(o.reauth_status("n8n")) + o.reauth_plan("n8n")
        self.assertNotIn("SECRET", blob)

    def test_plan_names_the_approval_and_no_run_by_default(self):
        self.write(N8N_MCP_ACCESS_TOKEN="a", N8N_MCP_REFRESH_TOKEN="r")
        plan = o.reauth_plan("n8n")
        self.assertIn("Evens", plan)
        self.assertIn("browser", plan)
        self.assertIn("N8N_MCP_CLIENT_ID", plan)
        self.assertIn("mcp_oauth.py login n8n", plan)


if __name__ == "__main__":
    unittest.main()
