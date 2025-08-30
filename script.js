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

// ===== i18n (UI) + Wines render =====
(async function () {
  // Κάνε την setLocale global ΠΡΙΝ από fetch ώστε να δουλεύουν τα κουμπιά πάντα
  window.setLocale = function (lng) {
    localStorage.setItem("locale", lng);
    location.reload();
  };

  const locale = localStorage.getItem("locale") || "en";
  document.documentElement.setAttribute("lang", locale);

  // --- UI i18n (relative paths! μην βάζεις αρχικό / σε GitHub Pages) ---
  try {
    const i18n = await (await fetch(`lang/${locale}.json`)).json();
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const key = el.getAttribute("data-i18n");
      if (i18n[key]) el.textContent = i18n[key];
    });
  } catch (e) {
    console.warn("i18n load failed:", e);
  }

  // --- Wines data render ---
  try {
    const data = await (await fetch("data/wines.json")).json();
    if (!Array.isArray(data.categories) || !Array.isArray(data.items)) {
      console.error("wines.json: wrong shape");
      return;
    }

    data.categories.forEach((cat) => {
      // ΠΡΟΣΟΧΗ: το id "champagnes–white/rose" έχει en–dash (–). Πρέπει να ταιριάζει ακριβώς με το HTML.
      const section = document.getElementById(cat.id);
      if (!section) return;

      const h2 = section.querySelector("h2.header");
      if (h2) h2.textContent = cat.title?.[locale] || cat.title?.en || "";

      const ul = section.querySelector("ul.menu-list");
      if (!ul) return;

      const items = data.items.filter((i) => i.cat === cat.id);
      ul.innerHTML = items
        .map((i) => {
          const name = i.name?.[locale] || i.name?.en || "";
          const price = (i.price ?? "").toString().trim();
          const priceClass = price ? "price" : "price empty";
          return `
<li class="menu-row">
  <span class="menu-item">${name}</span>
  <span class="${priceClass}">${price}</span>
</li>`;
        })
        .join("");
    });
  } catch (e) {
    console.error("wines load failed:", e);
  }
})();
