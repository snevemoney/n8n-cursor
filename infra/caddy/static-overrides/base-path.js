window.BASE_PATH = '/n8n/';
(function () {
	var base = '/n8n';

	function decodeFully(value) {
		var d = String(value == null ? '' : value);
		for (var i = 0; i < 3; i++) {
			try {
				var next = decodeURIComponent(d);
				if (next === d) break;
				d = next;
			} catch (e) {
				break;
			}
		}
		return d.replace(/\/{2,}/g, '/');
	}

	function normalizeAppPath(raw) {
		var d = decodeFully(raw);
		if (!d) return d;

		if (/^https?:\/\//i.test(d)) {
			try {
				var abs = new URL(d);
				if (abs.origin === location.origin) {
					d = abs.pathname + abs.search + abs.hash;
				} else {
					return d;
				}
			} catch (e) {
				return d;
			}
		}

		while (d === base || d === base + '/') {
			d = '/home/workflows';
		}
		while (d.indexOf(base + '/') === 0) {
			d = d.slice(base.length) || '/';
		}
		if (d === '/' || d === '/home' || d === '/home/') {
			d = '/home/workflows';
		}
		return d;
	}

	function fixUrlString(href) {
		try {
			var u = new URL(href, location.origin);
			var path = u.pathname.replace(/\/{2,}/g, '/');
			var changed = path !== u.pathname;
			u.pathname = path;

			if (
				u.pathname === base ||
				u.pathname === base + '/' ||
				u.pathname === base + '/home' ||
				u.pathname === base + '/home/'
			) {
				u.pathname = base + '/home/workflows';
				changed = true;
			}

			if (u.searchParams.has('redirect')) {
				var current = u.searchParams.get('redirect');
				var fixed = normalizeAppPath(current);
				if (fixed && fixed !== current) {
					u.searchParams.set('redirect', fixed);
					changed = true;
				}
			}

			return changed ? u.pathname + u.search + u.hash : null;
		} catch (e) {
			return null;
		}
	}

	function applyLocationFix(forceReload) {
		var fixed = fixUrlString(location.href);
		if (!fixed) return;
		if (forceReload) {
			location.replace(fixed);
		} else {
			history.replaceState(null, '', fixed);
		}
	}

	// Initial load (before Vue boots)
	try {
		var initial = fixUrlString(location.href);
		if (initial) {
			// Pathname normalization should reload; query-only can replaceState.
			if (initial.split('?')[0] !== location.pathname) {
				location.replace(initial);
				return;
			}
			history.replaceState(null, '', initial);
		}
	} catch (e) {}

	// n8n often client-navigates to /signin?redirect=/n8n/... after boot.
	// Patch history so those redirects stay app-relative.
	try {
		var origPush = history.pushState.bind(history);
		var origReplace = history.replaceState.bind(history);

		function wrap(orig) {
			return function (state, title, url) {
				if (typeof url === 'string') {
					var fixed = fixUrlString(url);
					if (fixed) url = fixed;
				}
				var ret = orig(state, title, url);
				applyLocationFix(false);
				return ret;
			};
		}

		history.pushState = wrap(origPush);
		history.replaceState = wrap(origReplace);
		window.addEventListener('popstate', function () {
			applyLocationFix(false);
		});
	} catch (e) {}
})();
