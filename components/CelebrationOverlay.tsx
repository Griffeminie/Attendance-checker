"use client";

import { useEffect, useRef } from "react";
import confetti from "canvas-confetti";

const CONFETTI_COLORS = ["#2563eb", "#16a34a", "#f59e0b", "#ec4899"];

export default function CelebrationOverlay({
  onDismiss,
}: {
  onDismiss: () => void;
}) {
  const firedRef = useRef(false);

  useEffect(() => {
    if (firedRef.current) return;
    firedRef.current = true;

    confetti({
      particleCount: 150,
      spread: 100,
      origin: { y: 0.5 },
      colors: CONFETTI_COLORS,
    });

    const durationMs = 2500;
    const endTime = Date.now() + durationMs;

    (function frame() {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 60,
        origin: { x: 0 },
        colors: CONFETTI_COLORS,
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 60,
        origin: { x: 1 },
        colors: CONFETTI_COLORS,
      });
      if (Date.now() < endTime) {
        requestAnimationFrame(frame);
      }
    })();
  }, []);

  return (
    <div className="celebration-backdrop fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/50 p-4">
      <div className="celebration-panel flex flex-col items-center gap-3 rounded-3xl bg-white px-10 py-12 text-center shadow-2xl">
        <span className="text-6xl">🎉</span>
        <h2 className="text-3xl font-bold text-slate-800">Congrats!</h2>
        <p className="text-lg font-medium text-slate-600">
          You finished the internship!
        </p>
        <button
          onClick={onDismiss}
          className="mt-4 rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
        >
          Nice!
        </button>
      </div>
    </div>
  );
}