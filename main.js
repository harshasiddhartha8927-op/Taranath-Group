document.addEventListener("DOMContentLoaded", () => {
  const body = document.body;
  const header = document.querySelector("[data-header]");
  const menuToggle = document.querySelector("[data-menu-toggle]");
  const mobileMenu = document.querySelector("[data-mobile-menu]");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  requestAnimationFrame(() => {
    body.classList.add("is-loaded");
  });

  const updateHeader = () => {
    if (!header) return;
    header.classList.toggle("scrolled", window.scrollY > 60);
  };

  updateHeader();
  window.addEventListener("scroll", updateHeader, { passive: true });

  const closeMenu = () => {
    if (!menuToggle || !mobileMenu) return;
    menuToggle.classList.remove("is-active");
    menuToggle.setAttribute("aria-expanded", "false");
    mobileMenu.classList.remove("is-open");
    header?.classList.remove("menu-active");
    body.classList.remove("menu-open");
  };

  if (menuToggle && mobileMenu) {
    menuToggle.addEventListener("click", () => {
      const willOpen = !mobileMenu.classList.contains("is-open");
      menuToggle.classList.toggle("is-active", willOpen);
      menuToggle.setAttribute("aria-expanded", String(willOpen));
      mobileMenu.classList.toggle("is-open", willOpen);
      header?.classList.toggle("menu-active", willOpen);
      body.classList.toggle("menu-open", willOpen);
    });
  }

  const updateActiveLinks = () => {
    const currentFile = window.location.pathname.split("/").pop() || "index.html";
    const currentHash = window.location.hash;

    document.querySelectorAll(".nav-links a, .mobile-menu a, .nav-cta").forEach((link) => {
      const linkUrl = new URL(link.getAttribute("href"), window.location.href);
      const linkFile = linkUrl.pathname.split("/").pop() || "index.html";
      const linkHash = linkUrl.hash;
      let active = false;

      if (currentFile === linkFile) {
        if (linkFile === "verticals.html") {
          active = Boolean(currentHash && linkHash && currentHash === linkHash);
        } else {
          active = true;
        }
      }

      if (currentFile === "services.html" && link.textContent.trim() === "Our Businesses") {
        active = true;
      }

      link.classList.toggle("active", active);
    });
  };

  updateActiveLinks();
  window.addEventListener("hashchange", updateActiveLinks);

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("in-view");
      revealObserver.unobserve(entry.target);
    });
  }, { threshold: 0.15 });

  document.querySelectorAll(".stagger-group").forEach((group) => {
    group.querySelectorAll(".reveal").forEach((item, index) => {
      item.style.transitionDelay = `${index * 120}ms`;
    });
  });

  document.querySelectorAll(".reveal, [data-timeline]").forEach((item) => {
    revealObserver.observe(item);
  });

  const animateCounter = (counter) => {
    const target = Number(counter.dataset.target || "0");
    const duration = 1600;
    const start = performance.now();

    const tick = (now) => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = Math.round(target * eased);
      counter.textContent = value.toLocaleString("en-IN");

      if (progress < 1) {
        requestAnimationFrame(tick);
      }
    };

    requestAnimationFrame(tick);
  };

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting || entry.target.dataset.counted === "true") return;
      entry.target.dataset.counted = "true";
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    });
  }, { threshold: 0.4 });

  document.querySelectorAll("[data-counter]").forEach((counter) => {
    counterObserver.observe(counter);
  });

  const contactForm = document.querySelector("[data-contact-form]");
  const toast = document.querySelector("[data-toast]");
  let toastTimer;

  const showToast = () => {
    if (!toast) return;
    window.clearTimeout(toastTimer);
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 3600);
  };

  if (contactForm) {
    const requiredFields = Array.from(contactForm.querySelectorAll("[required]"));

    requiredFields.forEach((field) => {
      field.addEventListener("input", () => {
        field.closest(".form-field")?.classList.remove("has-error");
      });

      field.addEventListener("change", () => {
        field.closest(".form-field")?.classList.remove("has-error");
      });
    });

    contactForm.addEventListener("submit", (event) => {
      event.preventDefault();
      let isValid = true;

      requiredFields.forEach((field) => {
        const fieldWrap = field.closest(".form-field");
        const fieldValid = field.checkValidity() && field.value.trim() !== "";
        fieldWrap?.classList.toggle("has-error", !fieldValid);
        if (!fieldValid) isValid = false;
      });

      if (!isValid) {
        const firstError = contactForm.querySelector(".has-error input, .has-error select, .has-error textarea");
        firstError?.focus();
        return;
      }

      contactForm.reset();
      showToast();
    });
  }

  document.querySelectorAll("a[href]").forEach((link) => {
    link.addEventListener("click", (event) => {
      const href = link.getAttribute("href");
      if (!href || href === "#" || href.startsWith("mailto:") || href.startsWith("tel:")) return;
      if (link.target === "_blank" || link.hasAttribute("download")) return;

      const url = new URL(href, window.location.href);
      const sameOrigin = url.origin === window.location.origin;
      const currentPath = window.location.pathname;
      const samePageHash = sameOrigin && url.pathname === currentPath && url.hash;

      closeMenu();

      if (!sameOrigin || samePageHash) return;

      event.preventDefault();
      body.classList.add("page-leaving");
      window.setTimeout(() => {
        window.location.href = url.href;
      }, 300);
    });
  });

  if (window.gsap && window.ScrollTrigger && !reduceMotion) {
    window.gsap.registerPlugin(window.ScrollTrigger);
    window.gsap.utils.toArray(".service-panel, .deep-panel").forEach((panel) => {
      window.gsap.fromTo(panel, {
        opacity: 0,
        y: 50
      }, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "power3.out",
        scrollTrigger: {
          trigger: panel,
          start: "top 85%",
          once: true
        }
      });
    });
  }
});
