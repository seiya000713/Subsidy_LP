// ===== Animations =====
(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // --- Mark elements for scroll reveal ---
  var revealGroups = [
    [".eyebrow"],
    [".section-title"],
    [".service-card", ".case-card", ".stat"],
    [".partner-list li"],
    [".cta-inner h2", ".cta-inner p", ".cta-inner .btn"],
  ];

  document.querySelectorAll(
    ".eyebrow, .section-title, .service-card, .case-card, .stat, " +
    ".partner-list li, .cta-inner h2, .cta-inner p, .cta-inner .btn"
  ).forEach(function (el) {
    el.classList.add("reveal");
  });

  // Stagger within each grid
  [".service-grid", ".case-grid", ".stat-grid", ".partner-list"].forEach(function (sel) {
    var parent = document.querySelector(sel);
    if (!parent) return;
    Array.prototype.slice.call(parent.children).forEach(function (child, i) {
      if (child.classList.contains("reveal")) {
        child.setAttribute("data-delay", String((i % 4) + 1));
      }
    });
  });

  // --- IntersectionObserver reveal ---
  if (reduce || !("IntersectionObserver" in window)) {
    document.querySelectorAll(".reveal").forEach(function (el) {
      el.classList.add("is-visible");
    });
  } else {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            io.unobserve(entry.target);
            if (entry.target.classList.contains("stat")) {
              countUp(entry.target.querySelector(".stat-num"));
            }
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    document.querySelectorAll(".reveal").forEach(function (el) {
      io.observe(el);
    });
  }

  // --- Count-up for stats ---
  function countUp(el) {
    if (!el || reduce) return;
    var unitSpan = el.querySelector(".unit");
    var unit = unitSpan ? unitSpan.outerHTML : "";
    // leading number text (before unit)
    var raw = (el.textContent || "").replace(unitSpan ? unitSpan.textContent : "", "");
    var hasComma = raw.indexOf(",") !== -1;
    var decimals = (raw.split(".")[1] || "").length;
    var target = parseFloat(raw.replace(/,/g, ""));
    if (isNaN(target)) return;

    var dur = 1400;
    var start = null;

    function fmt(n) {
      var s = decimals > 0 ? n.toFixed(decimals) : String(Math.round(n));
      if (hasComma) {
        var parts = s.split(".");
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
        s = parts.join(".");
      }
      return s;
    }

    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.innerHTML = fmt(target * eased) + unit;
      if (p < 1) requestAnimationFrame(step);
      else el.innerHTML = fmt(target) + unit;
    }
    el.innerHTML = fmt(0) + unit;
    requestAnimationFrame(step);
  }

  // --- Contact form ---
  var form = document.getElementById("contactForm");
  if (form) {
    var status = document.getElementById("formStatus");
    var emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    var setStatus = function (msg, cls) {
      if (!status) return;
      status.textContent = msg;
      status.className = "form-status" + (cls ? " " + cls : "");
    };

    var validate = function () {
      var ok = true;
      var fields = form.querySelectorAll("input, select, textarea");
      Array.prototype.forEach.call(fields, function (el) {
        el.classList.remove("invalid");
        if (el.type === "checkbox") {
          if (el.required && !el.checked) ok = false;
          return;
        }
        var v = (el.value || "").trim();
        var bad = (el.required && !v) ||
                  (el.type === "email" && v && !emailRe.test(v));
        if (bad) { el.classList.add("invalid"); ok = false; }
      });
      return ok;
    };

    // Clear invalid state on input
    form.addEventListener("input", function (e) {
      if (e.target.classList) e.target.classList.remove("invalid");
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validate()) {
        setStatus("未入力・不正な項目があります。ご確認ください。", "err");
        var firstBad = form.querySelector(".invalid");
        if (firstBad) firstBad.focus();
        return;
      }
      var btn = form.querySelector(".submit-btn");
      if (btn) { btn.disabled = true; btn.textContent = "送信中…"; }
      setStatus("", "");

      // NOTE: No backend wired yet. Replace this block with a real
      // fetch() POST to your form endpoint (e.g. Formspree / API).
      setTimeout(function () {
        form.reset();
        if (btn) { btn.disabled = false; btn.innerHTML = '送信する　<span class="arrow">→</span>'; }
        setStatus("送信ありがとうございます。2営業日以内にご連絡いたします。", "ok");
      }, 700);
    });
  }

  // --- Header scroll state ---
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      if (window.scrollY > 20) header.classList.add("scrolled");
      else header.classList.remove("scrolled");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }
})();
