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

// tap to close
document.addEventListener("click", (e) => {
  const dd = e.target.closest(".dropdown");
  document.querySelectorAll(".dropdown.open").forEach((el) => {
    if (el !== dd) el.classList.remove("open");
  });
  if (dd) dd.classList.toggle("open");
});
