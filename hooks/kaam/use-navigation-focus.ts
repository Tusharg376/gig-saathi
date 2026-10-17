import { useEffect } from "react";

export function useNavigationFocus(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open || !window.matchMedia("(max-width: 760px)").matches) return;
    const menu = document.getElementById("worker-navigation");
    const previous = document.activeElement as HTMLElement | null;
    const controls = () =>
      Array.from(
        menu?.querySelectorAll<HTMLElement>("button:not(:disabled), a[href]") || [],
      ).filter((el) => el.getClientRects().length);
    controls()[0]?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
      }
      if (event.key !== "Tab") return;
      const elements = controls();
      const first = elements[0];
      const last = elements.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      previous?.focus();
    };
  }, [open, onClose]);
}
