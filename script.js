// ===== Fade-in (IntersectionObserver με fallback) =====
(function () {
  const addVisible = (el) => el.classList.add("fade-in--visible");
  const nodes = () => document.querySelectorAll(".fade-in");

  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            addVisible(e.target);
            io.unobserve(e.target);
          }
        });
      },
      { rootMargin: "0px 0px -150px 0px", threshold: 0.01 }
    );

    nodes().forEach((n) => io.observe(n));

    // Αν προστεθούν δυναμικά .fade-in
    const mo = new MutationObserver(() => {
      nodes().forEach((n) => io.observe(n));
    });
    mo.observe(document.documentElement, { childList: true, subtree: true });
  } else {
    // Fallback με scroll
    const isInView = (el) => {
      const r = el.getBoundingClientRect();
      const vh =
        (window.innerHeight || document.documentElement.clientHeight) - 150;
      return r.bottom > 0 && r.top < vh;
    };
    const onScroll = () => nodes().forEach((n) => isInView(n) && addVisible(n));
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
  }
})();

// ===== Back-to-top button =====
(function () {
  const btn = document.querySelector(".to-top");
  if (!btn) return;

  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      if (window.scrollY > 800) btn.classList.add("show");
      else btn.classList.remove("show");
      ticking = false;
    });
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  btn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
})();

// ===== MOBILE NAV (hamburger + submenu tap) =====
(function () {
  const nav = document.querySelector("nav");
  const toggleBtn = document.getElementById("menuToggle");
  const menu = document.getElementById("primaryMenu");
  if (!nav || !toggleBtn || !menu) return;

  const dropBtns = menu.querySelectorAll(".dropbtn");

  // Άνοιγμα/κλείσιμο κύριου μενού (mobile)
  function toggleMenu(force) {
    const willOpen =
      typeof force === "boolean" ? force : !nav.classList.contains("open");
    nav.classList.toggle("open", willOpen);
    document.body.classList.toggle("no-scroll", willOpen);
    toggleBtn.setAttribute("aria-expanded", String(willOpen));
  }

  // Burger click
  toggleBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Κλείσιμο όταν πατάς κάποιο link
  menu.addEventListener("click", (e) => {
    const t = e.target;
    if (t.tagName === "A") {
      toggleMenu(false);
      // κλείσε και ανοιχτά submenus
      menu
        .querySelectorAll(".dropdown.open")
        .forEach((d) => d.classList.remove("open"));
      dropBtns.forEach((btn) => btn.setAttribute("aria-expanded", "false"));
    }
  });

  // Tap έξω για κλείσιμο (και κλείσε submenus)
  document.addEventListener("click", (e) => {
    if (!nav.contains(e.target)) {
      toggleMenu(false);
      menu
        .querySelectorAll(".dropdown.open")
        .forEach((d) => d.classList.remove("open"));
      dropBtns.forEach((btn) => btn.setAttribute("aria-expanded", "false"));
    }
  });

  // ESC για κλείσιμο
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      toggleMenu(false);
      menu
        .querySelectorAll(".dropdown.open")
        .forEach((d) => d.classList.remove("open"));
      dropBtns.forEach((btn) => btn.setAttribute("aria-expanded", "false"));
      toggleBtn.focus();
    }
  });

  // Submenu “MENU” με tap ΜΟΝΟ σε mobile (≤900px)
  dropBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      if (window.matchMedia("(max-width: 900px)").matches) {
        e.preventDefault();
        e.stopPropagation();
        const parent = btn.closest(".dropdown");
        const willOpen = !parent.classList.contains("open");
        // κλείσε άλλα submenus (optional one-at-a-time)
        menu.querySelectorAll(".dropdown.open").forEach((d) => {
          if (d !== parent) d.classList.remove("open");
        });
        parent.classList.toggle("open", willOpen);
        btn.setAttribute("aria-expanded", String(willOpen));
      }
    });
  });
})();
