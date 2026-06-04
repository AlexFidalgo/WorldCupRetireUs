import { useEffect, useState } from "react";

type ImageSlideshowProps = {
  images: string[];
};

type Phase = "showing" | "blank";

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function ImageSlideshow({ images }: ImageSlideshowProps) {
  const [queue] = useState<string[]>(() => shuffle(images));
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState<Phase>("showing");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (queue.length === 0) return;

    if (phase === "showing") {
      const showTimer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => setPhase("blank"), 400);
      }, 40_000);
      return () => clearTimeout(showTimer);
    }

    if (phase === "blank") {
      const blankTimer = setTimeout(() => {
        setCurrent((c) => (c + 1) % queue.length);
        setPhase("showing");
        setVisible(true);
      }, 80_000);
      return () => clearTimeout(blankTimer);
    }
  }, [phase, queue.length]);

  if (queue.length === 0 || phase === "blank") return null;

  return (
    <div className="pt-4">
      <img
        src={queue[current]}
        alt=""
        className={`w-full rounded-xl transition-opacity duration-400 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
