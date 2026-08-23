import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef } from "react";
import type { GalleryPiece } from "../data/gallery";
import { Placeholder } from "./Placeholder";

/**
 * Full-size viewer for gallery pieces. Keyboard-driven (Esc / arrows), focus is
 * trapped to the dialog while open, and background scroll is locked.
 */
export function GalleryLightbox({
  pieces,
  activeIndex,
  onClose,
  onNavigate,
}: {
  pieces: GalleryPiece[];
  activeIndex: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}) {
  const closeRef = useRef<HTMLButtonElement>(null);
  const isOpen = activeIndex !== null;
  const piece = isOpen ? pieces[activeIndex] : null;

  const goRelative = useCallback(
    (delta: number) => {
      if (activeIndex === null) return;
      onNavigate((activeIndex + delta + pieces.length) % pieces.length);
    },
    [activeIndex, onNavigate, pieces.length],
  );

  useEffect(() => {
    if (!isOpen) return;

    const previouslyFocused = document.activeElement as HTMLElement | null;
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowRight") goRelative(1);
      if (event.key === "ArrowLeft") goRelative(-1);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = overflow;
      previouslyFocused?.focus();
    };
  }, [isOpen, onClose, goRelative]);

  return (
    <AnimatePresence>
      {piece ? (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label={`${piece.title} — full size`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="fixed inset-0 z-[90] flex items-center justify-center bg-bg/92 p-4 backdrop-blur-xl sm:p-8"
          onClick={onClose}
        >
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close viewer"
            className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full border border-line text-ink transition-colors hover:border-accent hover:text-accent sm:right-8 sm:top-8"
          >
            <svg
              aria-hidden
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              className="h-5 w-5"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>

          {pieces.length > 1 ? (
            <>
              <ArrowButton side="left" onClick={() => goRelative(-1)} />
              <ArrowButton side="right" onClick={() => goRelative(1)} />
            </>
          ) : null}

          <motion.figure
            key={piece.id}
            initial={{ opacity: 0, scale: 0.96, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(event) => event.stopPropagation()}
            className="flex max-h-full w-full max-w-4xl flex-col"
          >
            <div className="min-h-0 flex-1 overflow-hidden rounded-xl">
              {piece.src ? (
                <img
                  src={piece.src}
                  alt={piece.alt}
                  className="mx-auto max-h-[70vh] w-auto max-w-full rounded-xl object-contain"
                />
              ) : (
                <Placeholder label={piece.alt} aspect="landscape" className="max-h-[70vh]" />
              )}
            </div>

            <figcaption className="mt-5 shrink-0">
              <h3 className="font-display text-xl font-semibold">{piece.title}</h3>
              <p className="mt-1.5 text-sm text-muted">{piece.caption}</p>
              <ul className="mt-3 flex flex-wrap gap-2">
                {piece.tools.map((tool) => (
                  <li
                    key={tool}
                    className="rounded-md border border-line px-2 py-0.5 font-mono text-[10px] text-muted"
                  >
                    {tool}
                  </li>
                ))}
              </ul>
            </figcaption>
          </motion.figure>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

function ArrowButton({ side, onClick }: { side: "left" | "right"; onClick: () => void }) {
  return (
    <button
      type="button"
      aria-label={side === "left" ? "Previous piece" : "Next piece"}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      className={`absolute top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full border border-line bg-bg/60 text-ink transition-colors hover:border-accent hover:text-accent ${
        side === "left" ? "left-3 sm:left-8" : "right-3 sm:right-8"
      }`}
    >
      <svg
        aria-hidden
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={`h-5 w-5 ${side === "right" ? "rotate-180" : ""}`}
      >
        <path d="M15 18l-6-6 6-6" />
      </svg>
    </button>
  );
}
