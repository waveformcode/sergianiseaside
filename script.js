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
    // Αν βάλεις αργότερα δυναμικά .fade-in στοιχεία:
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

// dropdown
// === Dropdown for .has-submenu (works on tap, closes on outside tap) ===
(function () {
  // Inject a tiny style so we beat your CSS display:none/hover rules
  if (!document.getElementById("dropdown-open-style")) {
    const style = document.createElement("style");
    style.id = "dropdown-open-style";
    style.textContent =
      "nav .has-submenu.open > .drop-down { display: block !important; }";
    document.head.appendChild(style);
  }

  function closeAll() {
    document.querySelectorAll("nav .has-submenu.open").forEach((li) => {
      li.classList.remove("open");
      const a = li.querySelector("a");
      if (a) a.setAttribute("aria-expanded", "false");
    });
  }

  // Return the top-level trigger <a> if target is that; else null.
  function getTriggerAnchor(target) {
    const a = target.closest("a");
    if (!a) return null;
    const li = a.closest(".has-submenu");
    if (!li) return null;
    // ensure it's the direct child anchor of the .has-submenu (not a dropdown link)
    if (a.parentElement !== li) return null;
    return a;
  }

  function toggleFromAnchor(a) {
    const li = a.parentElement; // since a.parentElement === .has-submenu
    const willOpen = !li.classList.contains("open");
    closeAll();
    if (willOpen) {
      li.classList.add("open");
      a.setAttribute("aria-expanded", "true");
    }
  }

  // Prevent the fake navigation of href="#"
  document.addEventListener(
    "pointerdown",
    function (e) {
      const a = getTriggerAnchor(e.target);
      if (a) e.preventDefault();
    },
    { passive: false }
  );

  // Toggle on click/tap of the trigger
  document.addEventListener(
    "click",
    function (e) {
      const a = getTriggerAnchor(e.target);
      if (a) {
        e.preventDefault();
        e.stopPropagation();
        toggleFromAnchor(a);
        return;
      }
      // Click on any dropdown item -> close
      if (e.target.closest("nav .has-submenu .drop-down a")) {
        closeAll();
        return;
      }
      // Click outside any submenu -> close
      if (!e.target.closest("nav .has-submenu")) {
        closeAll();
      }
    },
    { passive: false }
  );

  // Esc & window changes -> close
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeAll();
  });
  window.addEventListener("orientationchange", closeAll, { passive: true });
  window.addEventListener("resize", closeAll, { passive: true });
})();
