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
(function () {
  // Μην τρέχει δυο φορές αν το συμπεριλάβεις σε πολλές σελίδες
  if (window.__dropdownPatched) return;
  window.__dropdownPatched = true;

  // Κάνε το dropdown ορατό όταν το <li> έχει .open
  if (!document.getElementById("dropdown-open-style")) {
    const style = document.createElement("style");
    style.id = "dropdown-open-style";
    style.textContent =
      "nav .has-submenu.open > .drop-down { display: block !important; }";
    document.head.appendChild(style);
  }

  // Αν overlay «τρώει» taps στο Safari
  const blk = document.querySelector(".black-layer");
  if (blk) blk.style.pointerEvents = "none";
  const mly = document.querySelector(".menu-layer");
  if (mly) mly.style.pointerEvents = "none";

  function getTopAnchorFrom(target) {
    const a = target.closest("a");
    if (!a) return null;
    const li = a.closest(".has-submenu");
    if (!li) return null;
    if (a.parentElement !== li) return null; // αποκλείουμε τα links ΜΕΣΑ στο dropdown
    return a;
  }
  function getLIFromAnchor(a) {
    return a ? a.parentElement : null;
  }

  function closeAll() {
    document.querySelectorAll("nav .has-submenu.open").forEach((li) => {
      li.classList.remove("open");
      const a = li.querySelector(":scope > a") || li.querySelector("a");
      if (a) a.setAttribute("aria-expanded", "false");
    });
  }
  function toggle(li) {
    const willOpen = !li.classList.contains("open");
    closeAll();
    if (willOpen) {
      li.classList.add("open");
      const a = li.querySelector(":scope > a") || li.querySelector("a");
      if (a) a.setAttribute("aria-expanded", "true");
    }
  }

  // --- Handlers που καλύπτουν Safari ---
  function onTriggerTouchStart(e) {
    const a = getTopAnchorFrom(e.target);
    if (!a) return;
    // Κόβουμε από ΝΩΡΙΣ την ψευδο-πλοήγηση του href="#"
    e.preventDefault();
  }
  function onTriggerClick(e) {
    const a = getTopAnchorFrom(e.target);
    if (!a) return;
    e.preventDefault();
    e.stopPropagation();
    toggle(getLIFromAnchor(a));
  }

  // Tap/Click σε link ΜΕΣΑ στο dropdown -> κλείσε και άσε την πλοήγηση
  function onDropdownClick(e) {
    const link = e.target.closest("nav .has-submenu .drop-down a");
    if (link) closeAll();
  }

  // Tap/Click ΕΚΤΟΣ -> κλείσε (χρησιμοποιούμε ΚΑΙ touchstart ΚΑΙ click για Safari)
  function onOutsideTouchStart(e) {
    if (!e.target.closest("nav .has-submenu")) closeAll();
  }
  function onOutsideClick(e) {
    if (!e.target.closest("nav .has-submenu")) closeAll();
  }

  // Esc / αλλαγές μεγέθους
  function onKeyDown(e) {
    if (e.key === "Escape") closeAll();
  }
  function onResize() {
    closeAll();
  }

  // — Δηλώσεις listeners —
  // Trigger: πιάνουμε ΚΑΙ touchstart (Safari) ΚΑΙ click
  document.addEventListener("touchstart", onTriggerTouchStart, {
    passive: false,
    capture: true,
  });
  document.addEventListener("click", onTriggerClick, {
    passive: false,
    capture: true,
  });

  // Μέσα στο dropdown
  document.addEventListener("click", onDropdownClick, { capture: true });

  // Έξω από το dropdown: κλείσιμο (και εδώ ΚΑΙ touchstart ΚΑΙ click)
  document.addEventListener("touchstart", onOutsideTouchStart, {
    passive: true,
  });
  document.addEventListener("click", onOutsideClick, { passive: true });

  // Esc / orientation / resize
  document.addEventListener("keydown", onKeyDown);
  window.addEventListener("orientationchange", onResize, { passive: true });
  window.addEventListener("resize", onResize, { passive: true });

  // ARIA hints (προαιρετικά)
  document.querySelectorAll("nav .has-submenu").forEach((li) => {
    const a = li.querySelector(":scope > a") || li.querySelector("a");
    if (a) {
      a.setAttribute("aria-haspopup", "true");
      a.setAttribute("aria-expanded", "false");
    }
  });
})();

//dropdown appear all languages
document.addEventListener("DOMContentLoaded", () => {
  const submenu = document.querySelector("li.has-submenu");
  if (!submenu) return;

  const trigger = submenu.querySelector("a");
  const dropdown = submenu.querySelector(".drop-down");

  // ασφαλιστικά
  if (!trigger || !dropdown) return;

  // όταν πατάς το MENU
  trigger.addEventListener("click", (e) => {
    e.preventDefault(); // σταματά το # να "πηδάει" τη σελίδα
    submenu.classList.toggle("open");
  });

  // κλείσιμο αν πατήσεις έξω
  document.addEventListener("click", (e) => {
    if (!submenu.contains(e.target)) {
      submenu.classList.remove("open");
    }
  });
});
