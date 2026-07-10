/* GoTaxi Kigali — shared behaviour */
(function () {
  "use strict";

  /* Sticky nav shade */
  var nav = document.querySelector(".nav");
  function onScroll() {
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 24);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* Mobile menu */
  var toggle = document.querySelector(".nav-toggle");
  var links = document.querySelector(".nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });
  }

  /* Scroll reveal */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var revealEls = document.querySelectorAll(".reveal");
  if (reduceMotion || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          io.unobserve(entry.target);
          /* clear the stagger delay once revealed so hover transitions stay instant */
          entry.target.addEventListener("transitionend", function clear() {
            entry.target.style.transitionDelay = "";
            entry.target.removeEventListener("transitionend", clear);
          });
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
    /* stagger siblings: each .reveal sharing a parent enters 70ms after the previous */
    var counters = [];
    var counts = [];
    revealEls.forEach(function (el) {
      var p = el.parentElement;
      var i = counters.indexOf(p);
      if (i === -1) { counters.push(p); counts.push(0); i = counters.length - 1; }
      el.style.transitionDelay = Math.min(counts[i] * 70, 420) + "ms";
      counts[i]++;
      io.observe(el);
    });
  }

  /* Cinematic hero: scrub the video into a framed, rounded, gold-edged panel
     as the visitor scrolls the first screen. Transform/opacity only (GPU),
     rAF-gated, and skipped entirely when reduced motion is requested. */
  var heroEl = document.querySelector(".hero");
  var heroMedia = heroEl && heroEl.querySelector(".hero-media");
  var heroContent = heroEl && heroEl.querySelector(".hero-content");
  if (heroEl && heroMedia && !reduceMotion) {
    var heroTicking = false;
    var clampHero = function (v) { return v < 0 ? 0 : v > 1 ? 1 : v; };
    var renderHero = function () {
      heroTicking = false;
      var h = heroEl.offsetHeight || window.innerHeight;
      var p = clampHero(window.scrollY / (h * 0.8));
      var e = p * (2 - p); /* easeOutQuad — quick, then settles */
      /* video pulls back into a clearly framed, floating card */
      heroMedia.style.transform =
        "translate3d(0," + (e * 46) + "px,0) scale(" + (1 - e * 0.26) + ")";
      heroMedia.style.borderRadius = (e * 48) + "px";
      heroMedia.style.borderColor = "rgba(233,200,126," + (e * 0.95) + ")";
      heroMedia.style.filter = "brightness(" + (1 - e * 0.16) + ")";
      /* elevation shadow + faint gold rim glow so the card lifts off the page */
      heroMedia.style.boxShadow =
        "0 " + (e * 48) + "px " + (e * 110) + "px rgba(0,0,0," + (e * 0.6) + "), " +
        "0 0 " + (e * 46) + "px rgba(212,175,97," + (e * 0.18) + ")";
      if (heroContent) {
        heroContent.style.transform =
          "translate3d(0," + (e * -64) + "px,0) scale(" + (1 - e * 0.05) + ")";
        heroContent.style.opacity = "" + clampHero(1 - e * 1.2);
      }
    };
    var onHeroScroll = function () {
      if (!heroTicking) { heroTicking = true; requestAnimationFrame(renderHero); }
    };
    window.addEventListener("scroll", onHeroScroll, { passive: true });
    window.addEventListener("resize", onHeroScroll, { passive: true });
    renderHero();
  }

  /* Tour filter (tours page) */
  var pills = document.querySelectorAll(".filter-pill");
  var tourCards = document.querySelectorAll("[data-category]");
  var countEl = document.querySelector(".filter-count");
  if (pills.length && tourCards.length) {
    pills.forEach(function (pill) {
      pill.addEventListener("click", function () {
        pills.forEach(function (p) { p.setAttribute("aria-pressed", "false"); });
        pill.setAttribute("aria-pressed", "true");
        var cat = pill.getAttribute("data-filter");
        var shown = 0;
        tourCards.forEach(function (card) {
          var match = cat === "all" || card.getAttribute("data-category") === cat;
          card.style.display = match ? "" : "none";
          if (match) shown++;
        });
        if (countEl) {
          countEl.textContent = shown + (shown === 1 ? " experience" : " experiences");
        }
      });
    });
  }

  /* Google Ads — "Click to call" conversion.
     Centralised: fires on ANY phone-number (tel:) link across the whole site —
     nav call block, mobile top-bar call button, hero "Call a Taxi Now",
     contact rows and footer. Doesn't block the call: gtag sends the ping via
     sendBeacon, so it completes as the dialer opens. */
  document.addEventListener("click", function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var tel = t.closest('a[href^="tel:"]');
    if (!tel) return;
    if (typeof window.gtag === "function") {
      window.gtag("event", "conversion", {
        send_to: "AW-18301209032/2PFBCL_31c0cEMiT2ZZE",
        value: 1.0,
        currency: "USD"
      });
    }
  }, false);

  /* Current year in footer */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
