type ModalController = {
  open(): void;
  close(): void;
};

export function createModal(
  overlay: HTMLElement,
  options: { onOpen?: () => void; onClose?: () => void } = {},
): ModalController {
  const open = (): void => {
    overlay.classList.add("open");
    document.body.style.overflow = "hidden";
    options.onOpen?.();
  };
  const close = (): void => {
    if (!overlay.classList.contains("open")) return;
    overlay.classList.remove("open");
    document.body.style.overflow = "";
    options.onClose?.();
  };

  overlay.addEventListener("click", (e) => {
    const target = e.target as HTMLElement | null;
    if (target === overlay || target?.closest("[data-close]")) close();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  return { open, close };
}
