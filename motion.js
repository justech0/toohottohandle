/* Too Hot To Handle — Isınıyoruz
   0.6s kırmızı alttan dolmaya başlar · dolum geçtikçe HOT'un harfleri alttan ısınıp dalgalanır ve beyaza döner
   2.5s logo yerine oturur (TOO HOT / TO HANDLE) · 3.8s metin ve Instagram. Sonra HOT yavaşça akar. */
(function () {
  "use strict";
  var root = document.documentElement, body = document.body;
  var scene = document.getElementById("scene"), stage = document.getElementById("stage");
  var flood = document.getElementById("flood"), belowR = document.getElementById("below-r");
  var hot = document.getElementById("hot"), aboveR = document.getElementById("above-r");
  var copy = document.getElementById("copy"), slogan = document.getElementById("slogan");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var audio = document.getElementById("audio");

  var HOTX = 544, HOTY = 71, HS = 382 / 688.6;
  var HOT_BOX = [544, 71, 745.8 * HS, 382];          // logonun içindeki HOT
  var LOCK_BOX = [62, 64, 1206, 858];                 // TOO HOT / TO HANDLE

  /* --- HOT dalgası: logonun kendi ölçüleri */
  var A = 22.8, K = (2 * Math.PI) / 277.5, P = 4.79, BAND = 140;
  var subs = [];
  hot.getAttribute("d").split("M").forEach(function (c) {
    c = c.replace(/Z/gi, "").trim(); if (!c) return;
    var n = c.split(/[\s,]+/).map(Number), pts = [], dense = [];
    for (var i = 0; i + 1 < n.length; i += 2) pts.push([n[i], n[i + 1]]);
    for (var j = 0; j < pts.length; j++) {
      var a = pts[j], b = pts[(j + 1) % pts.length], st = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / 5));
      for (var s = 0; s < st; s++) dense.push(a[0] + (b[0] - a[0]) * s / st, a[1] + (b[1] - a[1]) * s / st);
    }
    subs.push(dense);
  });
  function drawHot(lineLogoY, phase) {             // lineLogoY: dolum çizgisi (logo birimi); altı ısınır
    var out = "";
    for (var s = 0; s < subs.length; s++) {
      var p = subs[s]; out += "M";
      for (var i = 0; i < p.length; i += 2) {
        var y = p[i + 1], ky = K * (y < 104 ? 104 : y) + P, h = (y - lineLogoY) / BAND;   // T'nin üst çubuğu eğilmesin
        h = 1;   // logo hep kendi şeklinde
        out += (i ? " " : "") + (p[i] + A * (h * Math.sin(ky + phase) - Math.sin(ky))).toFixed(1) + " " + y.toFixed(1);
      }
      out += "Z";
    }
    hot.setAttribute("d", out);
  }

  /* --- kamera: bir kutuyu ekrandaki bir alana sığdır */
  function fit(box, sx, sy, sw, sh) {
    var k = Math.min(sw / box[2], sh / box[3]);
    return { k: k, cx: box[0] + box[2] / 2, cy: box[1] + box[3] / 2, sx: sx + sw / 2, sy: sy + sh / 2 };
  }
  function cams(W, H) {
    var startW = Math.min(W * 0.62, 560), startH = Math.min(H * 0.44, 520);
    var a = fit(HOT_BOX, (W - startW) / 2, H * 0.46 - startH / 2, startW, startH);
    var copyH = copy.offsetHeight + parseFloat(getComputedStyle(copy).bottom) + 28;
    var top = Math.max(64, H * 0.09), pad = Math.max(22, W * 0.07);
    var bw = Math.min(W - pad * 2, 1100), bh = Math.max(120, H - top - copyH);
    var b = fit(LOCK_BOX, (W - bw) / 2, top, bw, bh);
    return [a, b];
  }
  function cam(c, W, H) {                           // görünüm kutusu
    var vw = W / c.k, vh = H / c.k;
    return [c.cx - c.sx / c.k, c.cy - c.sy / c.k, vw, vh];
  }
  function mixCam(a, b, t) {
    return { k: Math.exp(Math.log(a.k) + (Math.log(b.k) - Math.log(a.k)) * t), cx: a.cx + (b.cx - a.cx) * t, cy: a.cy + (b.cy - a.cy) * t, sx: a.sx + (b.sx - a.sx) * t, sy: a.sy + (b.sy - a.sy) * t };
  }

  function clamp(t) { return t < 0 ? 0 : t > 1 ? 1 : t; }
  function eio(t) { return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
  function span(t, a, b) { return clamp((t - a) / (b - a)); }

  var t0 = null, last = 0, paused = false;
  function render(t, dt) {
    var W = window.innerWidth, H = window.innerHeight;
    var mid = H * 0.5;                                    // dalga ekranın yarısında durur
    var pad = Math.max(22, W * 0.07), bw = Math.min(W - pad * 2, 700);
    var k = Math.min(bw / LOCK_BOX[2], (H * 0.48) / LOCK_BOX[3]);
    var c = { k: k, cx: LOCK_BOX[0] + LOCK_BOX[2] / 2, cy: 493, sx: W / 2, sy: mid - 9 };   // 493 = iki satırın arası
    var vb = cam(c, W, H);
    stage.setAttribute("viewBox", vb.map(function (v) { return v.toFixed(2); }).join(" "));
    var fl = eio(span(t, 0, 0.9));                        // kırmızı hemen yükselir
    var L = H + 18 - (H + 18 - mid) * fl;
    flood.style.setProperty("--fy", L.toFixed(1) + "px");
    var yUser = vb[1] + (L - 9) / k;                  // dalganın ortası
    belowR.setAttribute("y", yUser.toFixed(1));
    aboveR.setAttribute("y", (yUser - 5000).toFixed(1));
    var bt = (audio && !audio.paused) ? audio.currentTime : t;
    var beat = ((bt - 0.08) / 0.62) % 1; if (beat < 0) beat += 1;
    drawHot(-1e9, 0.14 * Math.exp(-beat * 5) * fl);
    slogan.style.top = ((916 - vb[1]) * k + Math.max(16, H * 0.025)).toFixed(1) + "px";   // TO HANDLE'ın hemen altı
    if (t > 0.5) scene.classList.add("lit");
    if (t > 1.2) scene.classList.add("done");
  }

  if (reduce) {
    var still = function () { render(10, 0); };
    still(); window.addEventListener("resize", still);
  } else {
    var frame = function (now) {
      if (t0 === null) { t0 = now; last = now; }
      var dt = Math.min(0.05, (now - last) / 1000); last = now;
      render((now - t0) / 1000, dt);
      if (!document.hidden) requestAnimationFrame(frame); else paused = true;
    };
    requestAnimationFrame(frame);
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden && paused) { paused = false; last = performance.now(); requestAnimationFrame(frame); }
    });
  }

  /* --- Instagram / Yol tarifi: şube seçimi */
  var picks = Array.prototype.slice.call(document.querySelectorAll(".pick"));
  function closeAll(except) {
    picks.forEach(function (p) { if (p === except) return; p.querySelector(".branches").hidden = true; p.querySelector(".cta__btn").setAttribute("aria-expanded", "false"); });
  }
  picks.forEach(function (p) {
    var btn = p.querySelector(".cta__btn"), list = p.querySelector(".branches");
    btn.addEventListener("click", function (e) {
      e.stopPropagation(); closeAll(p);
      var o = list.hidden; list.hidden = !o; btn.setAttribute("aria-expanded", o ? "true" : "false");
      if (o) list.querySelector("a").focus({ preventScroll: true });
    });
  });
  document.addEventListener("click", function (e) { if (!e.target.closest(".pick")) closeAll(null); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeAll(null); });

  /* --- ses */
  var sb = document.getElementById("sound"), fadeT = 0;
  var TARGET_VOL = 0.7;

  function fade(to, done) {
    clearInterval(fadeT);
    fadeT = setInterval(function () {
      var up = to > audio.volume, v = audio.volume + (up ? 0.05 : -0.05);
      if ((up && v >= to) || (!up && v <= to)) { audio.volume = to; clearInterval(fadeT); if (done) done(); }
      else audio.volume = Math.max(0, Math.min(1, v));
    }, 40);
  }

  function startSound(instant) {
    audio.volume = TARGET_VOL;
    var p = audio.play();
    if (p && p.then) {
      p.then(function () {
        audio.volume = TARGET_VOL;
      }).catch(waitForGesture);
    }
  }

  function waitForGesture() {                      // tarayıcı kısıtlarsa ilk dokunuşta/etkileşimde başlar
    var go = function () {
      ["pointerdown", "keydown", "touchstart", "wheel", "click"].forEach(function (ev) { window.removeEventListener(ev, go, true); });
      if (sb.getAttribute("aria-pressed") === "true" && audio.paused) {
        startSound(true);
      }
    };
    ["pointerdown", "keydown", "touchstart", "wheel", "click"].forEach(function (ev) { window.addEventListener(ev, go, true); });
  }

  // Sayfa açılır açılmaz doğrudan sesli başlat
  startSound(true);

  sb.addEventListener("click", function () {
    var on = sb.getAttribute("aria-pressed") !== "true";
    sb.setAttribute("aria-pressed", on ? "true" : "false");
    sb.setAttribute("aria-label", on ? "Sesi kapat" : "Sesi aç");
    if (on) startSound(true);
    else fade(0, function () { audio.pause(); });
  });
})();
