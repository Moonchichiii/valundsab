const connection = navigator.connection;
const constrained =
  connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || "");

if (!constrained) {
  const prefetched = new Set();
  const timers = new WeakMap();

  const cancel = (link) => {
    clearTimeout(timers.get(link));
    timers.delete(link);
  };

  const schedule = (link) => {
    const url = new URL(link.href, window.location.href);

    if (
      url.origin !== window.location.origin ||
      url.pathname === window.location.pathname ||
      prefetched.has(url.href)
    ) {
      return;
    }

    cancel(link);
    timers.set(
      link,
      window.setTimeout(() => {
        const hint = document.createElement("link");
        hint.rel = "prefetch";
        hint.as = "document";
        hint.href = url.href;
        document.head.append(hint);
        prefetched.add(url.href);
        timers.delete(link);
      }, 120),
    );
  };

  for (const link of document.querySelectorAll('a[href^="/"]')) {
    link.addEventListener("pointerenter", () => schedule(link), {
      passive: true,
    });
    link.addEventListener("pointerleave", () => cancel(link), {
      passive: true,
    });
    link.addEventListener("focus", () => schedule(link));
    link.addEventListener("blur", () => cancel(link));
  }
}
