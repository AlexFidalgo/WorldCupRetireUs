import { useEffect, useState } from "react";

type ImageSlideshowProps = {
  images: string[];
};

type Phase = "showing" | "blank";

export function ImageSlideshow({ images }: ImageSlideshowProps) {
  const [current, setCurrent] = useState(0);
  const [phase, setPhase] = useState<Phase>("showing");
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (images.length === 0) return;

    if (phase === "showing") {
      const showTimer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => setPhase("blank"), 400);
      }, 40_000);
      return () => clearTimeout(showTimer);
    }

    if (phase === "blank") {
      const blankTimer = setTimeout(() => {
        setCurrent((c) => (c + 1) % images.length);
        setPhase("showing");
        setVisible(true);
      }, 80_000);
      return () => clearTimeout(blankTimer);
    }
  }, [phase, images.length]);

  if (images.length === 0 || phase === "blank") return null;

  return (
    <div className="pt-4">
      <img
        src={images[current]}
        alt=""
        className={`w-full rounded-xl transition-opacity duration-400 ${
          visible ? "opacity-100" : "opacity-0"
        }`}
      />
    </div>
  );
}
