window.BASE_PATH = '/n8n/';
(function () {
	try {
		var base = '/n8n';
		var path = location.pathname.replace(/\/{2,}/g, '/');
		if (path !== location.pathname) {
			location.replace(path + location.search + location.hash);
			return;
		}
		if (
			path === base ||
			path === base + '/' ||
			path === base + '/home' ||
			path === base + '/home/'
		) {
			location.replace(base + '/home/workflows');
			return;
		}

		var u = new URL(location.href);
		var r = u.searchParams.get('redirect');
		if (!r) return;

		var d = r;
		for (var i = 0; i < 3; i++) {
			try {
				var next = decodeURIComponent(d);
				if (next === d) break;
				d = next;
			} catch (e) {
				break;
			}
		}
		d = String(d).replace(/\/{2,}/g, '/');

		if (/^https?:\/\//i.test(d)) {
			try {
				var abs = new URL(d);
				if (abs.origin === location.origin) {
					d = abs.pathname + abs.search + abs.hash;
				}
			} catch (e) {}
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

		if (d !== r) {
			u.searchParams.set('redirect', d);
			history.replaceState(null, '', u.pathname + u.search + u.hash);
		}
	} catch (e) {}
})();
