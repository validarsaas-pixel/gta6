const BLOCKED_KEYS = new Set(["F12", "PrintScreen"]);

function shouldBlockShortcut(event) {
  const key = event.key.toUpperCase();
  const ctrlOrMeta = event.ctrlKey || event.metaKey;

  if (BLOCKED_KEYS.has(event.key)) {
    return true;
  }

  if (ctrlOrMeta && event.shiftKey && ["I", "J", "C", "S"].includes(key)) {
    return true;
  }

  if (ctrlOrMeta && ["U", "P"].includes(key)) {
    return true;
  }

  return false;
}

export function setupPageProtection() {
  const root = document.documentElement;

  const blockEvent = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  const handleKeydown = (event) => {
    if (!shouldBlockShortcut(event)) {
      return;
    }

    if (event.key === "PrintScreen") {
      navigator.clipboard?.writeText("");
    }

    blockEvent(event);
  };

  const handleVisibility = () => {
    root.classList.toggle("page-protected", document.visibilityState !== "visible");
  };

  const handleBeforePrint = () => {
    root.classList.add("page-protected");
  };

  const handleAfterPrint = () => {
    root.classList.remove("page-protected");
  };

  document.addEventListener("contextmenu", blockEvent);
  document.addEventListener("copy", blockEvent);
  document.addEventListener("cut", blockEvent);
  document.addEventListener("dragstart", blockEvent);
  document.addEventListener("selectstart", blockEvent);
  window.addEventListener("keydown", handleKeydown, true);
  document.addEventListener("visibilitychange", handleVisibility);
  window.addEventListener("beforeprint", handleBeforePrint);
  window.addEventListener("afterprint", handleAfterPrint);

  return () => {
    document.removeEventListener("contextmenu", blockEvent);
    document.removeEventListener("copy", blockEvent);
    document.removeEventListener("cut", blockEvent);
    document.removeEventListener("dragstart", blockEvent);
    document.removeEventListener("selectstart", blockEvent);
    window.removeEventListener("keydown", handleKeydown, true);
    document.removeEventListener("visibilitychange", handleVisibility);
    window.removeEventListener("beforeprint", handleBeforePrint);
    window.removeEventListener("afterprint", handleAfterPrint);
    root.classList.remove("page-protected");
  };
}
