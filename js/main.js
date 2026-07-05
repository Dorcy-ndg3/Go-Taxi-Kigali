/* Go cabs&Taxi Kigali — shared behaviour */
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

  /* Current year in footer */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
