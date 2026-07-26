const root = document.querySelector("[data-consent]");

if (root) {
  window.__vcBase = true;
  const settings = root.querySelector(".consent-settings");
  const launcher = root.querySelector(".cookie-launcher");
  const native = typeof settings.showPopover === "function";
  root.dataset.consentState = "necessary";

  const hide = () => {
    if (native) {
      settings.hidePopover();
    } else {
      delete settings.dataset.open;
      launcher.setAttribute("aria-expanded", "false");
      launcher.focus();
    }
  };

  if (native) {
    settings.addEventListener("toggle", (event) => {
      launcher.setAttribute("aria-expanded", String(event.newState === "open"));
    });
  } else {
    settings.setAttribute("tabindex", "-1");
    for (const button of root.querySelectorAll(
      '[popovertarget="cookie-settings"]',
    )) {
      button.addEventListener("click", () => {
        if (settings.dataset.open === "") {
          hide();
        } else {
          settings.dataset.open = "";
          launcher.setAttribute("aria-expanded", "true");
          settings.focus();
        }
      });
    }
    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && settings.dataset.open === "") {
        hide();
      }
    });
  }

  let base = window.scrollY;
  let last = base;
  let ticking = false;

  new window.MutationObserver(() => {
    base = window.scrollY;
    last = base;
    root.removeAttribute("data-collapsed");
  }).observe(root, {
    attributes: true,
    attributeFilter: ["data-consent-state"],
  });

  window.addEventListener("scroll", () => {
    if (ticking || root.dataset.consentState === "pending") {
      return;
    }
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      if (y < last) {
        root.removeAttribute("data-collapsed");
        base = y;
      } else if (y - base > 140) {
        root.setAttribute("data-collapsed", "");
      }
      last = y;
      ticking = false;
    });
  });
}
