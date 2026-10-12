/* One geodesic orb. Voice energy talks. Action energy delegates. Same host. */
(function (global) {
  "use strict";

  function norm(v) {
    const m = Math.hypot(v[0], v[1], v[2]) || 1;
    return [v[0] / m, v[1] / m, v[2] / m];
  }

  function mid(a, b) {
    return norm([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]);
  }

  function icosahedron() {
    const t = (1 + Math.sqrt(5)) / 2;
    const raw = [
      [-1, t, 0], [1, t, 0], [-1, -t, 0], [1, -t, 0],
      [0, -1, t], [0, 1, t], [0, -1, -t], [0, 1, -t],
      [t, 0, -1], [t, 0, 1], [-t, 0, -1], [-t, 0, 1],
    ];
    const verts = raw.map(norm);
    const faces = [
      [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
      [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
      [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
      [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
    ];
    return { verts, faces };
  }

  function subdivide(mesh, rounds) {
    let { verts, faces } = mesh;
    for (let r = 0; r < rounds; r++) {
      const key = {};
      const next = [];
      const point = (i) => verts[i];
      const split = (a, b) => {
        const id = a < b ? a + ":" + b : b + ":" + a;
        if (key[id] != null) return key[id];
        const i = verts.length;
        verts = verts.concat([mid(point(a), point(b))]);
        key[id] = i;
        return i;
      };
      faces.forEach((f) => {
        const a = f[0], b = f[1], c = f[2];
        const ab = split(a, b), bc = split(b, c), ca = split(c, a);
        next.push([a, ab, ca], [b, bc, ab], [c, ca, bc], [ab, bc, ca]);
      });
      faces = next;
    }
    return { verts, faces };
  }

  function edgesFromFaces(faces) {
    const seen = {};
    const edges = [];
    faces.forEach((f) => {
      [[0, 1], [1, 2], [2, 0]].forEach((pair) => {
        const a = f[pair[0]], b = f[pair[1]];
        const id = a < b ? a + ":" + b : b + ":" + a;
        if (seen[id]) return;
        seen[id] = true;
        edges.push([a, b]);
      });
    });
    return edges;
  }

  function JarvisOrb(canvas) {
    this.canvas = canvas;
    this.voice = 0;
    this.action = 0;
    this._voice = 0;
    this._action = 0;
    this._spin = 0;
    this._tumble = 0;
    this._last = 0;
    this._cssW = 0;
    this._cssH = 0;
    this._raf = 0;
    const mesh = subdivide(icosahedron(), 2);
    this.verts = mesh.verts;
    this.edges = edgesFromFaces(mesh.faces);
    this.seed = this.verts.map((_, i) => (i * 17) % 97 / 97);
  }

  JarvisOrb.prototype.setEnergy = function (voice, action) {
    this.voice = Math.max(0, Math.min(1, Number(voice) || 0));
    this.action = Math.max(0, Math.min(1, Number(action) || 0));
  };

  JarvisOrb.prototype.resize = function () {
    const canvas = this.canvas;
    const dpr = window.devicePixelRatio || 1;
    const w = canvas.clientWidth || 280;
    const h = canvas.clientHeight || 280;
    if (w === this._cssW && h === this._cssH && dpr === this._dpr && canvas.width) return;
    this._cssW = w;
    this._cssH = h;
    this._dpr = dpr;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
  };

  JarvisOrb.prototype.draw = function (now) {
    const canvas = this.canvas;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    this.resize();
    const w = canvas.width, h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const t = (now || 0) / 1000;
    const dt = this._last ? Math.min(0.05, Math.max(0, t - this._last)) : 0.016;
    this._last = t;
    const riseV = this.voice > this._voice;
    const riseA = this.action > this._action;
    this._voice += (this.voice - this._voice) * (1 - Math.exp(-dt * (riseV ? 18 : 8)));
    this._action += (this.action - this._action) * (1 - Math.exp(-dt * (riseA ? 16 : 7)));
    const voice = this._voice;
    const action = this._action;
    // Original talk/think rates, integrated so an energy change does not jump the angle.
    this._spin += dt * (0.28 + voice * 1.4 + action * 0.55);
    this._tumble += dt * (0.12 + action * 0.9);
    const cy = Math.cos(this._spin), sy = Math.sin(this._spin);
    const cx = Math.cos(this._tumble), sx = Math.sin(this._tumble);
    const scale = Math.min(w, h) * 0.38;
    const n = this.verts.length;
    if (!this._proj || this._proj.length !== n) {
      this._proj = new Array(n);
      this._byZ = new Array(n);
      for (let i = 0; i < n; i++) this._proj[i] = { x: 0, y: 0, z: 0, i: i };
    }
    const projected = this._proj;
    for (let i = 0; i < n; i++) {
      const v = this.verts[i];
      let x = v[0], y = v[1], z = v[2];
      const y2 = y * cx - z * sx;
      const z2 = y * sx + z * cx;
      const x3 = x * cy + z2 * sy;
      const z3 = -x * sy + z2 * cy;
      const pulse = 1 + voice * 0.22 * Math.sin(t * 14 + i * 0.35) + action * 0.16 * Math.sin(t * 7 + this.seed[i] * 12);
      const p = projected[i];
      p.x = w / 2 + x3 * scale * pulse;
      p.y = h / 2 + y2 * scale * pulse;
      p.z = z3;
      p.i = i;
    }
    const byZ = this._byZ;
    for (let i = 0; i < n; i++) byZ[i] = projected[i];
    byZ.sort((a, b) => a.z - b.z);
    ctx.lineWidth = Math.max(1, (window.devicePixelRatio || 1) * 0.7);
    this.edges.forEach((e) => {
      const a = projected[e[0]], b = projected[e[1]];
      const depth = (a.z + b.z) * 0.5;
      const alpha = 0.08 + (depth + 1) * 0.12 + voice * 0.1 + action * 0.08;
      const r = Math.round(210 + voice * 20 - action * 40);
      const g = Math.round(230 + voice * 25 - action * 80);
      const bl = Math.round(220 - voice * 40 - action * 90);
      ctx.strokeStyle = "rgba(" + r + "," + g + "," + bl + "," + Math.max(0.05, Math.min(0.45, alpha)) + ")";
      ctx.beginPath();
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
      ctx.stroke();
    });
    byZ.forEach((p) => {
      const depth = (p.z + 1.2) / 2.2;
      const mix = voice / (voice + action + 0.0001);
      const vr = 61, vg = 255, vb = 106;
      const ar = 224, ag = 162, ab = 74;
      const ir = 236, ig = 244, ib = 248;
      const r = Math.round(ir + (vr - ir) * voice * mix + (ar - ir) * action * (1 - mix * 0.35));
      const g = Math.round(ig + (vg - ig) * voice * mix + (ag - ig) * action * (1 - mix * 0.35));
      const b = Math.round(ib + (vb - ib) * voice * mix + (ab - ib) * action * (1 - mix * 0.35));
      const radius = (1.4 + depth * 2.1 + voice * 1.8 + action * 1.2) * (window.devicePixelRatio || 1);
      ctx.fillStyle = "rgba(" + r + "," + g + "," + b + "," + (0.35 + depth * 0.55) + ")";
      ctx.beginPath();
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();
    });
  };

  JarvisOrb.prototype.start = function () {
    const self = this;
    self.resize();
    const tick = (now) => {
      self.draw(now);
      self._raf = requestAnimationFrame(tick);
    };
    self._raf = requestAnimationFrame(tick);
    window.addEventListener("resize", () => self.resize());
  };

  global.JarvisOrb = JarvisOrb;
})(window);
