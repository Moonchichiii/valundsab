const root = document.querySelector("[data-consent]");
const KEY = "valunds-consent";

if (root) {
  initialize();
}

function initialize() {
  const purposes = (window.__valundsConsentConfig || {}).optionalPurposes || [];
  const settings = root.querySelector(".consent-settings");
  const statusText = root.querySelector("[data-consent-status]");
  const withdraw = root.querySelector("[data-consent-withdraw]");
  const list = root.querySelector("[data-consent-purposes]");
  const launcher = root.querySelector(".cookie-launcher");
  const allowed = new Map();
  const queued = new Map();

  window.valundsConsent = {
    isAllowed: (id) => allowed.get(id) === true,
    onAllow(id, callback) {
      if (allowed.get(id)) {
        callback();
      } else {
        queued.set(id, (queued.get(id) || []).concat(callback));
      }
    },
  };

  function read() {
    try {
      const record = JSON.parse(localStorage.getItem(KEY));
      if (
        record &&
        record.v === 1 &&
        ["accepted", "rejected", "custom"].includes(record.choice) &&
        typeof record.p === "object"
      ) {
        return record;
      }
      localStorage.removeItem(KEY);
    } catch {
      try {
        localStorage.removeItem(KEY);
      } catch {
        return null;
      }
    }
    return null;
  }

  function apply(map) {
    for (const purpose of purposes) {
      const ok = Boolean(map && map[purpose.id]);
      allowed.set(purpose.id, ok);
      const input = list.querySelector('[data-purpose="' + purpose.id + '"]');
      if (input) {
        input.checked = ok;
      }
      if (ok) {
        for (const callback of queued.get(purpose.id) || []) {
          callback();
        }
        queued.delete(purpose.id);
      }
    }
  }

  function setState(state) {
    root.dataset.consentState = state;
    if (withdraw) {
      withdraw.hidden = state === "pending" || state === "necessary";
    }
    if (statusText && state !== "necessary") {
      statusText.textContent = {
        pending: "Inget val har gjorts ännu. Valfria funktioner är av.",
        accepted: "Valfria kakor har godkänts. Du kan ändra valet här.",
        rejected: "Valfria kakor har avvisats. Du kan ändra valet här.",
        custom: "Du har gjort ett anpassat val. Du kan ändra det här.",
      }[state];
    }
  }

  function decide(choice, map) {
    try {
      localStorage.setItem(
        KEY,
        JSON.stringify({ v: 1, choice, p: map, t: Date.now() }),
      );
    } catch {
      setState("pending");
      return;
    }
    apply(map);
    setState(choice);
  }

  if (purposes.length) {
    root.dataset.consentRequired = "";
    const banner = root.querySelector(".consent-banner");
    if (banner) {
      banner.hidden = false;
    }
    for (const purpose of purposes) {
      const item = document.createElement("li");
      item.className = "consent-settings__category";
      item.innerHTML =
        '<div><h3></h3> <span class="label">Valfri</span><p class="consent-copy"></p></div><label class="consent-switch"><input type="checkbox" aria-label="" data-purpose=""><span class="consent-switch__thumb"></span></label>';
      item.querySelector("h3").textContent = purpose.label;
      item.querySelector("p").textContent = purpose.description || "";
      const input = item.querySelector("input");
      input.dataset.purpose = purpose.id;
      input.setAttribute("aria-label", purpose.label);
      list.append(item);
    }
    const record = read();
    apply(record && record.p);
    setState(record ? record.choice : "pending");
  } else {
    setState("necessary");
  }

  root.addEventListener("click", (event) => {
    const button = event.target.closest("[data-consent-action]");
    if (!button) {
      return;
    }
    const action = button.dataset.consentAction;
    const map = {};
    if (action === "withdraw") {
      try {
        localStorage.removeItem(KEY);
      } catch {
        hide();
      }
      apply(null);
      setState("pending");
      hide();
      return;
    }
    for (const purpose of purposes) {
      const input = list.querySelector('[data-purpose="' + purpose.id + '"]');
      map[purpose.id] =
        action === "accept" ||
        (action === "save" && Boolean(input && input.checked));
    }
    decide(action === "save" ? "custom" : action + "ed", map);
    if (action === "save") {
      hide();
    }
  });

  if (window.__vcBase) {
    return;
  }

  const native = typeof settings.showPopover === "function";

  function hide() {
    if (native) {
      settings.hidePopover();
    } else {
      delete settings.dataset.open;
      launcher.setAttribute("aria-expanded", "false");
      launcher.focus();
    }
  }

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
