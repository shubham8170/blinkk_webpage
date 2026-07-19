(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

  /* Hero background video */
  var heroBgVideo = document.getElementById("heroBgVideo");
  if (heroBgVideo && reduceMotion) {
    heroBgVideo.pause();
    heroBgVideo.removeAttribute("autoplay");
  }

  /* Rotating hero headline */
  var heroHeading = document.getElementById("heroHeading");
  if (heroHeading && !reduceMotion) {
    var headlineSlides = heroHeading.querySelectorAll(".headline-slide");
    if (headlineSlides.length > 1) {
      var activeSlide = 0;
      setInterval(function () {
        headlineSlides[activeSlide].classList.remove("is-active");
        activeSlide = (activeSlide + 1) % headlineSlides.length;
        headlineSlides[activeSlide].classList.add("is-active");
      }, 4500);
    }
  }

  /* Footer year */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* Theme toggle */
  var themeToggle = document.getElementById("themeToggle");
  var storedTheme = localStorage.getItem("blink-theme");
  if (storedTheme) document.documentElement.setAttribute("data-theme", storedTheme);

  function currentIsDark() {
    var attr = document.documentElement.getAttribute("data-theme");
    if (attr) return attr === "dark";
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  }
  function syncThemeButton() {
    var isDark = currentIsDark();
    themeToggle.setAttribute("aria-pressed", String(isDark));
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light theme" : "Switch to dark theme");
  }
  if (themeToggle) {
    syncThemeButton();
    themeToggle.addEventListener("click", function () {
      var next = currentIsDark() ? "light" : "dark";
      document.documentElement.setAttribute("data-theme", next);
      localStorage.setItem("blink-theme", next);
      syncThemeButton();
    });
  }

  /* Sticky header shadow */
  var header = document.getElementById("siteHeader");
  function onScrollHeader() {
    if (window.scrollY > 8) header.classList.add("scrolled");
    else header.classList.remove("scrolled");
  }
  window.addEventListener("scroll", onScrollHeader, { passive: true });
  onScrollHeader();

  /* Mobile nav */
  var navToggle = document.getElementById("navToggle");
  var mainNav = document.getElementById("mainNav");
  function closeNav() {
    mainNav.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }
  function toggleNav() {
    var isOpen = mainNav.classList.toggle("open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
    navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
  }
  if (navToggle) {
    navToggle.addEventListener("click", toggleNav);
    mainNav.querySelectorAll("a").forEach(function (link) {
      link.addEventListener("click", closeNav);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closeNav();
    });
  }

  /* Active nav link on scroll */
  var navLinks = document.querySelectorAll(".nav-link");
  var sections = Array.prototype.map.call(navLinks, function (link) {
    var id = link.getAttribute("href");
    return id && id.charAt(0) === "#" ? document.querySelector(id) : null;
  });
  function setActiveNav() {
    var scrollPos = window.scrollY + 120;
    var activeIndex = -1;
    var bestOffset = -Infinity;
    sections.forEach(function (sec, i) {
      if (sec && sec.offsetTop <= scrollPos && sec.offsetTop > bestOffset) {
        bestOffset = sec.offsetTop;
        activeIndex = i;
      }
    });
    navLinks.forEach(function (link, i) {
      link.classList.toggle("active", i === activeIndex);
    });
  }
  window.addEventListener("scroll", setActiveNav, { passive: true });
  setActiveNav();

  /* Scroll reveal */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in-view");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in-view"); });
  }

  /* Stat counters */
  var statNums = document.querySelectorAll(".stat-num");
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-count"));
    if (reduceMotion) { el.textContent = target; return; }
    var start = 0;
    var duration = 1400;
    var startTime = null;
    function step(ts) {
      if (!startTime) startTime = ts;
      var progress = Math.min((ts - startTime) / duration, 1);
      var eased = 1 - Math.pow(1 - progress, 3);
      var value = start + (target - start) * eased;
      el.textContent = target % 1 !== 0 ? value.toFixed(1) : Math.floor(value);
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target % 1 !== 0 ? target.toFixed(1) : target;
    }
    requestAnimationFrame(step);
  }
  if ("IntersectionObserver" in window) {
    var statIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          statIo.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    statNums.forEach(function (el) { statIo.observe(el); });
  }

  /* Hero cursor spotlight */
  var heroSection = document.querySelector(".hero");
  var heroSpotlight = document.getElementById("heroSpotlight");
  if (heroSection && heroSpotlight && canHover && !reduceMotion) {
    heroSection.addEventListener("mousemove", function (e) {
      var rect = heroSection.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      heroSpotlight.style.setProperty("--mx", x + "%");
      heroSpotlight.style.setProperty("--my", y + "%");
    });
  }

  /* Product card 3D tilt */
  var tiltCards = document.querySelectorAll(".tilt-card");
  if (canHover && !reduceMotion) {
    tiltCards.forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var rect = card.getBoundingClientRect();
        var x = (e.clientX - rect.left) / rect.width - 0.5;
        var y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = "perspective(900px) rotateY(" + (x * 10) + "deg) rotateX(" + (y * -10) + "deg) translateY(-4px)";
      });
      card.addEventListener("mouseleave", function () {
        card.style.transform = "perspective(900px) rotateY(0deg) rotateX(0deg) translateY(0)";
      });
    });
  }

  /* Frame tabs filter */
  var tabs = document.querySelectorAll(".tab");
  var frameCards = document.querySelectorAll(".frame-card");
  tabs.forEach(function (tab) {
    tab.addEventListener("click", function () {
      tabs.forEach(function (t) { t.classList.remove("active"); t.setAttribute("aria-selected", "false"); });
      tab.classList.add("active");
      tab.setAttribute("aria-selected", "true");
      var filter = tab.getAttribute("data-filter");
      frameCards.forEach(function (card) {
        var show = filter === "all" || card.getAttribute("data-cat") === filter;
        card.classList.toggle("hidden-card", !show);
      });
    });
  });

  /* Testimonial carousel */
  var track = document.getElementById("testimonialTrack");
  var dotsWrap = document.getElementById("carouselDots");
  var prevBtn = document.getElementById("prevSlide");
  var nextBtn = document.getElementById("nextSlide");
  if (track) {
    var slides = track.children;
    var slideCount = slides.length;
    var index = 0;
    var autoplayId = null;

    for (var i = 0; i < slideCount; i++) {
      var dot = document.createElement("button");
      dot.type = "button";
      dot.setAttribute("aria-label", "Go to testimonial " + (i + 1));
      if (i === 0) dot.classList.add("active");
      (function (idx) {
        dot.addEventListener("click", function () { goTo(idx); });
      })(i);
      dotsWrap.appendChild(dot);
    }
    var dots = dotsWrap.querySelectorAll("button");

    function render() {
      track.style.transform = "translateX(-" + (index * 100) + "%)";
      dots.forEach(function (d, i) { d.classList.toggle("active", i === index); });
    }
    function goTo(i) { index = (i + slideCount) % slideCount; render(); }
    function next() { goTo(index + 1); }
    function prev() { goTo(index - 1); }

    if (nextBtn) nextBtn.addEventListener("click", function () { next(); restartAutoplay(); });
    if (prevBtn) prevBtn.addEventListener("click", function () { prev(); restartAutoplay(); });

    function startAutoplay() {
      if (reduceMotion) return;
      autoplayId = setInterval(next, 6000);
    }
    function stopAutoplay() { if (autoplayId) clearInterval(autoplayId); }
    function restartAutoplay() { stopAutoplay(); startAutoplay(); }

    var carouselWrap = document.getElementById("testimonialCarousel");
    carouselWrap.addEventListener("mouseenter", stopAutoplay);
    carouselWrap.addEventListener("mouseleave", startAutoplay);
    carouselWrap.addEventListener("focusin", stopAutoplay);
    carouselWrap.addEventListener("focusout", startAutoplay);

    render();
    startAutoplay();
  }

  /* Booking form validation */
  var bookingForm = document.getElementById("bookingForm");
  if (bookingForm) {
    bookingForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var valid = true;
      var fullName = document.getElementById("fullName");
      var phone = document.getElementById("phone");

      var nameField = fullName.closest(".form-field");
      if (!fullName.value.trim()) {
        nameField.classList.add("invalid");
        valid = false;
      } else {
        nameField.classList.remove("invalid");
      }

      var phoneField = phone.closest(".form-field");
      if (!/^[0-9]{10}$/.test(phone.value.trim())) {
        phoneField.classList.add("invalid");
        valid = false;
      } else {
        phoneField.classList.remove("invalid");
      }

      if (!bookingForm.checkValidity()) {
        valid = false;
      }

      var successMsg = document.getElementById("formSuccess");
      if (valid) {
        var service = document.getElementById("service").value;
        var store = document.getElementById("store").value;
        var date = document.getElementById("date").value;
        var time = document.getElementById("time").value;

        var subject = "Eye Test Booking — " + fullName.value.trim();
        var body = [
          "New booking request from the Blinkk website:",
          "",
          "Name: " + fullName.value.trim(),
          "Phone: " + phone.value.trim(),
          "Service: " + service,
          "Preferred store: " + store,
          "Preferred date: " + date,
          "Preferred time: " + time
        ].join("\n");

        var mailtoUrl = "mailto:blinkkopticals@gmail.com"
          + "?subject=" + encodeURIComponent(subject)
          + "&body=" + encodeURIComponent(body);

        window.location.href = mailtoUrl;

        successMsg.classList.add("show");
        bookingForm.reset();
        setTimeout(function () { successMsg.classList.remove("show"); }, 6000);
      } else {
        successMsg.classList.remove("show");
      }
    });
  }

  /* Newsletter form */
  var newsletterForm = document.getElementById("newsletterForm");
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
      e.preventDefault();
      var email = document.getElementById("newsletterEmail");
      var successMsg = document.getElementById("newsletterSuccess");
      if (email.value.trim() && email.checkValidity()) {
        successMsg.classList.add("show");
        newsletterForm.reset();
        setTimeout(function () { successMsg.classList.remove("show"); }, 5000);
      }
    });
  }

  /* Back to top */
  var backToTop = document.getElementById("backToTop");
  window.addEventListener("scroll", function () {
    backToTop.classList.toggle("show", window.scrollY > 600);
  }, { passive: true });
  backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: reduceMotion ? "auto" : "smooth" });
  });
})();
