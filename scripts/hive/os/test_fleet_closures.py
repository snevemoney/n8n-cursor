"""Fleet closure projection. Does not publish, send, or touch a calendar."""
from __future__ import annotations

import importlib.util
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]


def _load(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    assert spec and spec.loader
    mod = importlib.util.module_from_spec(spec)
    spec.loader.exec_module(mod)
    return mod


fc = _load("fleet_closures", Path(__file__).with_name("fleet-closures.py"))
vc = _load("vault_config", Path(__file__).with_name("vault-config.py"))
ohb = _load("outer_heaven_brief", Path(__file__).with_name("outer-heaven-brief.py"))
ps = _load("product_state", ROOT / "scripts/hive/product-state.py")

ENG14 = (
    "Forge",
    "Watchdog",
    "Consultant",
    "HITL Operator",
)


class ProjectionTests(unittest.TestCase):
    def test_eng14_is_the_same_sentence_on_four_desks(self) -> None:
        lines = []
        for name in ENG14:
            match = [
                line
                for line in fc.render_for(name).splitlines()
                if line.startswith("- ENG-14:")
            ]
            self.assertEqual(len(match), 1, name)
            lines.append(match[0])
        self.assertEqual(len(set(lines)), 1)

    def test_irrelevant_desk_does_not_receive_eng14(self) -> None:
        text = fc.render_for("Librarian")
        self.assertNotIn("ENG-14", text)
        self.assertNotIn("Ironlane", text)
        self.assertIn("WAIT_EVENS is not an interrupt", text)

    def test_desks_are_not_flattened(self) -> None:
        forge = fc.render_for("Forge")
        hunter = fc.render_for("Lead Hunter", icp="none")
        self.assertNotIn("generic worker", forge.lower())
        self.assertNotIn("NO_ACTION until OPERATOR_FOCUS", forge)
        self.assertIn("NO_ACTION", hunter)
        self.assertNotIn("ENG-14", hunter)

    def test_researcher_adopted_zero_is_durable(self) -> None:
        self.assertEqual(fc.researcher_adopted(), 0)
        text = fc.render_for("Researcher")
        self.assertIn("Durable adopted count: 0", text)
        self.assertTrue(fc.RESEARCHER_ADOPTION.is_file())

    def test_creative_trace_missing_is_unproven(self) -> None:
        self.assertEqual(fc.creative_trace_gaps(None), list(fc.TRACE_HOPS))
        self.assertEqual(fc.creative_trace_gaps({hop: "x" for hop in fc.TRACE_HOPS}), [])
        text = fc.render_for("Creative Studio")
        self.assertIn("UNPROVEN", text)
        self.assertIn("context_pack", text)

    def test_wait_evens_is_not_an_interrupt(self) -> None:
        self.assertFalse(fc.wait_evens_is_interrupt())

    def test_method_overclaims_are_not_adoption(self) -> None:
        outcome = {"adopted": True, "evidence": "docs/example.json"}
        self.assertFalse(fc.method_label_is_adopted("PREVIOUSLY_ADOPTED", outcome))
        self.assertFalse(fc.method_label_is_adopted("ADOPTED+NEEDS_VERIFICATION", outcome))
        self.assertFalse(fc.method_label_is_adopted("ADOPTED", None))
        self.assertFalse(fc.method_label_is_adopted("ADOPTED", {"adopted": True}))
        self.assertTrue(fc.method_label_is_adopted("ADOPTED", outcome))
        self.assertIn("adopted count is 0", fc.render_for("Product GTM"))
        self.assertIn("PENDING_PRODUCT_PROOF", fc.render_for("Product GTM"))
        self.assertIn("unproven", fc.render_for("Wealth Manager"))
        self.assertFalse(fc.product_proof_is_market_proof())
        self.assertFalse(fc.invented_metric_allowed())

    def test_calendar_recommendation_does_not_mutate(self) -> None:
        text = fc.render_for("Day Planner")
        self.assertIn("REVERT", text)
        self.assertIn("31rh68um8bvm16hjpnqdtca228", text)
        self.assertIn("4khr058oops9c9l4bfblr4jj34", text)
        self.assertIn("does not change the live calendar", text)
        self.assertFalse(fc.calendar_mutate_allowed())

    def test_vault_mutation_needs_evens(self) -> None:
        self.assertFalse(vc.mutation_authorized("Big Boss", None))
        self.assertFalse(
            vc.mutation_authorized(
                "Publishing Engine",
                {"source": "Big Boss", "job_id": "none", "dated": "2026-09-23"},
            )
        )
        self.assertFalse(
            vc.mutation_authorized(
                "Big Boss",
                {
                    "source": "evens",
                    "via": "Big Boss",
                    "job_id": "JOB",
                    "dated": "2026-09-23",
                },
            )
        )
        self.assertTrue(
            vc.mutation_authorized(
                "Publishing Engine",
                {"source": "evens", "job_id": "JOB", "dated": "2026-09-24"},
            )
        )

    def test_ironlane_stays_on_money_desk(self) -> None:
        self.assertIn("taste path", fc.render_for("Money Desk"))
        self.assertNotIn("Ironlane", fc.render_for("Product GTM"))

    def test_lead_hunter_stops_without_icp_on_clipengine(self) -> None:
        self.assertIsNotNone(fc.lead_hunter_decision("none"))
        self.assertIsNotNone(fc.lead_hunter_decision(""))
        self.assertIsNone(fc.lead_hunter_decision("a-real-icp"))
        gate = ps.can_act("Lead Hunter", "clipengine")
        self.assertEqual(gate["decision"], "IGNORE")
        self.assertIn("NO_ACTION", gate["reason"])

    def test_duplicate_routine_name_is_refused(self) -> None:
        keys = [
            "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa:GitHub PR opened",
            "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb:Other routine",
        ]
        dupes = keys + ["cccccccc-cccc-cccc-cccc-cccccccccccc:GitHub PR opened"]
        self.assertEqual(fc.duplicate_routine_names(dupes), ["GitHub PR opened"])
        self.assertTrue(
            fc.other_agent_has_routine(
                dupes, "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", "GitHub PR opened"
            )
        )
        self.assertFalse(
            fc.other_agent_has_routine(
                keys, "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", "GitHub PR opened"
            )
        )

    def test_sealed_gateway_does_not_start_a_child(self) -> None:
        self.assertIsNone(fc.gateway_endpoint({"data": "sealed", "sandSealedFile": "x"}))
        self.assertFalse(fc.child_executor_allowed({"data": "sealed"}))
        self.assertIsNotNone(
            fc.gateway_endpoint({"baseUrl": "http://127.0.0.1:9", "token": "t"})
        )

    def test_brief_keeps_the_closure_and_the_job_card(self) -> None:
        watchdog = ohb.build_brief(agent="Watchdog")
        markdown = watchdog["markdown"]
        self.assertIn("ENG-14: extract-pack diff is not live", markdown)
        self.assertIn("## Job card", markdown)
        self.assertLess(markdown.index("## Fleet closure"), markdown.index("## Job card"))
        librarian = ohb.build_brief(agent="Librarian")
        self.assertNotIn("ENG-14", librarian["markdown"])
        self.assertIn("WAIT_EVENS is not an interrupt", librarian["markdown"])


if __name__ == "__main__":
    unittest.main()
