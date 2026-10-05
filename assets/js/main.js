/* ==========================================================================
   GLACIER SKATING — main.js
   Snow, reveals, counters, tilt, parallax, open-status.
   ========================================================================== */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var isFinePointer = window.matchMedia("(pointer: fine)").matches;

  /* ---------- entrance ---------- */
  window.addEventListener("load", function () {
    document.body.classList.add("is-loaded");
  });
  /* fallback in case load already fired (deferred script) */
  if (document.readyState === "complete") {
    document.body.classList.add("is-loaded");
  } else {
    setTimeout(function () {
      document.body.classList.add("is-loaded");
    }, 1200);
  }

  /* ---------- snow canvas ---------- */
  (function snow() {
    var canvas = document.getElementById("snow");
    if (!canvas || prefersReduced) return;

    var ctx = canvas.getContext("2d");
    var hero = document.getElementById("hero");
    var flakes = [];
    var running = true;
    var W, H;

    function resize() {
      W = canvas.width = hero.offsetWidth;
      H = canvas.height = hero.offsetHeight;
    }

    function spawn(n) {
      flakes = [];
      for (var i = 0; i < n; i++) {
        flakes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: 0.8 + Math.random() * 2.1,
          vy: 0.35 + Math.random() * 0.85,
          drift: 0.2 + Math.random() * 0.6,
          phase: Math.random() * Math.PI * 2,
          o: 0.25 + Math.random() * 0.6
        });
      }
    }

    resize();
    spawn(W < 700 ? 45 : 90);

    var t = 0;
    function frame() {
      if (running) {
        t += 0.008;
        ctx.clearRect(0, 0, W, H);
        for (var i = 0; i < flakes.length; i++) {
          var f = flakes[i];
          f.y += f.vy;
          f.x += Math.sin(t * 2 + f.phase) * f.drift * 0.4;
          if (f.y > H + 4) { f.y = -4; f.x = Math.random() * W; }
          if (f.x > W + 4) f.x = -4;
          if (f.x < -4) f.x = W + 4;
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
          ctx.fillStyle = "rgba(233, 242, 248, " + f.o + ")";
          ctx.fill();
        }
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);

    /* pause when hero off-screen or tab hidden */
    new IntersectionObserver(function (entries) {
      running = entries[0].isIntersecting && !document.hidden;
    }, { threshold: 0 }).observe(hero);

    document.addEventListener("visibilitychange", function () {
      running = !document.hidden;
    });

    window.addEventListener("resize", function () {
      resize();
      spawn(W < 700 ? 45 : 90);
    });
  })();

  /* ---------- marquee ---------- */
  (function marquee() {
    var track = document.querySelector(".marquee__track");
    if (!track) return;

    var PX_PER_SEC = 65.6; /* scroll speed; loop duration scales with group width */
    var t;

    /* The keyframe slides the track by exactly -50%, so each half of the
       track must be at least as wide as the strip itself — any narrower and
       blank space scrolls through at the loop point. Duplicate whole groups
       until that holds, keeping both halves identical. */
    function fill() {
      var strip = track.parentElement;
      var stripWidth = strip.getBoundingClientRect().width;

      while (track.scrollWidth > 0 && track.scrollWidth / 2 < stripWidth) {
        var groups = Array.prototype.slice.call(track.children);
        groups.forEach(function (group) {
          track.appendChild(group.cloneNode(true));
        });
      }

      /* more groups = longer half, so stretch the duration to keep the
         scroll speed the same at every viewport width */
      track.style.animationDuration =
        Math.round(track.scrollWidth / 2 / PX_PER_SEC) + "s";
    }

    fill();
    window.addEventListener("load", fill);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fill);
    window.addEventListener("resize", function () {
      clearTimeout(t);
      t = setTimeout(fill, 200);
    });
  })();

  /* ---------- scroll reveals ---------- */
  (function reveals() {
    var els = document.querySelectorAll("[data-reveal]");
    if (!("IntersectionObserver" in window) || prefersReduced) {
      els.forEach(function (el) { el.classList.add("in-view"); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- animated counters ---------- */
  (function counters() {
    var nums = document.querySelectorAll("[data-count]");
    if (!nums.length) return;

    function animate(el) {
      var target = parseInt(el.getAttribute("data-count"), 10) || 0;
      var prefix = el.getAttribute("data-prefix") || "";
      var suffix = el.getAttribute("data-suffix") || "";
      if (prefersReduced) {
        el.innerHTML = prefix + target.toLocaleString("en-GB") + suffix;
        return;
      }
      var dur = 1600;
      var start = null;
      function step(ts) {
        if (!start) start = ts;
        var p = Math.min((ts - start) / dur, 1);
        var eased = 1 - Math.pow(1 - p, 3); /* easeOutCubic */
        el.innerHTML = prefix + Math.round(target * eased).toLocaleString("en-GB") + suffix;
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animate(entry.target);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    nums.forEach(function (el) { io.observe(el); });
  })();

  /* ---------- navbar ---------- */
  (function navbar() {
    var nav = document.getElementById("nav");
    var links = document.querySelectorAll(".nav__links a");
    var sections = document.querySelectorAll("section[id]");

    function onScroll() {
      nav.classList.toggle("nav--scrolled", window.scrollY > 24);
    }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    /* active section highlighting */
    if ("IntersectionObserver" in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            links.forEach(function (a) {
              a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id);
            });
          }
        });
      }, { rootMargin: "-45% 0px -50% 0px" });
      sections.forEach(function (s) { io.observe(s); });
    }
  })();

  /* ---------- mobile menu ---------- */
  (function mobileMenu() {
    var burger = document.getElementById("navBurger");
    var menu = document.getElementById("mobileMenu");

    function toggle(open) {
      document.body.classList.toggle("menu-open", open);
      burger.setAttribute("aria-expanded", String(open));
      burger.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      menu.setAttribute("aria-hidden", String(!open));
      document.body.style.overflow = open ? "hidden" : "";
    }

    burger.addEventListener("click", function () {
      toggle(!document.body.classList.contains("menu-open"));
    });

    menu.querySelectorAll("a").forEach(function (a) {
      a.addEventListener("click", function () { toggle(false); });
    });

    window.addEventListener("keydown", function (e) {
      if (e.key === "Escape") toggle(false);
    });
  })();

  /* ---------- opening hours ---------- */
  (function openStatus() {
    /* minutes since midnight: [open, close] per weekday (0 = Sunday) */
    var hours = {
      0: [540, 1080],  /* 09:00 – 18:00 */
      1: [600, 1200],  /* 10:00 – 20:00 */
      2: [600, 1200],
      3: [600, 1200],
      4: [600, 1200],
      5: [600, 1320],  /* 10:00 – 22:00 */
      6: [540, 1320]   /* 09:00 – 22:00 */
    };

    function fmt(mins) {
      var h = Math.floor(mins / 60), m = mins % 60;
      return h.toString().padStart(2, "0") + ":" + m.toString().padStart(2, "0");
    }

    var now = new Date();
    var day = now.getDay();
    var today = hours[day];

    /* highlight today's row */
    var row = document.querySelector('#hoursTable tr[data-day="' + day + '"]');
    if (row) row.classList.add("is-today");

    /* mobile menu hours line */
    var menuHours = document.getElementById("menuHours");
    if (menuHours) menuHours.textContent = fmt(today[0]) + " – " + fmt(today[1]);
  })();

  /* ---------- hero parallax + collage parallax ---------- */
  (function parallax() {
    if (prefersReduced) return;
    var heroImg = document.querySelector(".hero__bg img");
    var items = document.querySelectorAll("[data-parallax]");
    var ticking = false;

    function update() {
      ticking = false;
      var sy = window.scrollY;

      if (heroImg && sy < window.innerHeight * 1.2) {
        heroImg.style.transform = "scale(1.08) translateY(" + sy * 0.22 + "px)";
      }

      items.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom > 0 && r.top < window.innerHeight) {
          var speed = parseFloat(el.getAttribute("data-parallax")) || 0;
          var mid = (r.top + r.height / 2) - window.innerHeight / 2;
          el.style.transform = "translateY(" + (-mid * speed).toFixed(1) + "px)";
        }
      });
    }

    window.addEventListener("scroll", function () {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }, { passive: true });
  })();

  /* ---------- 3D tilt cards ---------- */
  (function tilt() {
    if (prefersReduced || !isFinePointer) return;
    var cards = document.querySelectorAll("[data-tilt]");

    cards.forEach(function (card) {
      var hover = false;
      card.addEventListener("mouseenter", function () { hover = true; });
      card.addEventListener("mousemove", function (e) {
        if (!hover) return;
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width - 0.5;
        var py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform =
          "perspective(900px) rotateX(" + (-py * 6).toFixed(2) + "deg) rotateY(" +
          (px * 8).toFixed(2) + "deg)";
      });
      card.addEventListener("mouseleave", function () {
        hover = false;
        card.style.transform = "";
      });
    });
  })();

  /* ---------- lessons: weekday / weekend pricing toggle ---------- */
  (function lessonToggle() {
    var seg = document.querySelector(".seg");
    if (!seg) return;

    var pill = seg.querySelector(".seg__pill");
    var btns = Array.prototype.slice.call(seg.querySelectorAll(".seg__btn"));

    /* size the thumb from the live button so any label width works */
    function movePill() {
      var active = seg.querySelector(".seg__btn.is-active") || btns[0];
      pill.style.width = active.offsetWidth + "px";
      pill.style.transform = "translateX(" + active.offsetLeft + "px)";
    }

    btns.forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (btn.classList.contains("is-active")) return;
        var target = btn.getAttribute("data-tab");

        btns.forEach(function (b) {
          var on = b === btn;
          b.classList.toggle("is-active", on);
          b.setAttribute("aria-pressed", String(on));
        });
        movePill();

        document.querySelectorAll(".lesson-panel").forEach(function (p) {
          var on = p.getAttribute("data-panel") === target;
          p.classList.toggle("is-active", on);
          p.setAttribute("aria-hidden", String(!on));
        });

        document.querySelectorAll(".lessons__note").forEach(function (n) {
          n.classList.toggle("is-active", n.getAttribute("data-note") === target);
        });
      });
    });

    movePill();
    seg.classList.add("seg--ready");
    window.addEventListener("resize", movePill);
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(movePill);
  })();
})();
