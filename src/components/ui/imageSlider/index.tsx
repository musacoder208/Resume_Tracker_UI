import { useEffect, useState, useRef, useCallback } from 'react';
import type { JSX, ReactNode } from 'react';
import clsx from 'clsx';

export interface SlideData {
  key: string | number;
  image: ReactNode;
  text?: ReactNode;
}

interface ImageSliderProps {
  slides: SlideData[];
  /** Time image stays fully visible before next transition (ms) */
  interval?: number;
  /** Image slide transition duration (ms) */
  duration?: number;
  /** Delay before text animates in after image lands (ms) */
  textDelay?: number;
  className?: string;
  /** Static content always rendered on top (e.g. buttons) */
  overlay?: ReactNode;
}

export function ImageSlider({
  slides,
  interval = 5000,
  duration = 1000,
  textDelay = 300,
  className,
  overlay,
}: ImageSliderProps): JSX.Element {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [prevIndex, setPrevIndex] = useState<number | null>(null);
  const [animating, setAnimating] = useState(false);
  const [textVisible, setTextVisible] = useState(true);
  const timerRef = useRef<number | null>(null);
  const textTimerRef = useRef<number | null>(null);

  const count = slides.length;

  const advance = useCallback((): void => {
    if (count <= 1) return;

    // Hide text immediately when transition starts
    setTextVisible(false);

    setPrevIndex(currentIndex);
    setCurrentIndex((prev) => (prev + 1) % count);
    setAnimating(false);

    requestAnimationFrame(() => {
      setAnimating(true);
    });

    // After image transition completes, show text with delay
    textTimerRef.current = window.setTimeout(() => {
      setPrevIndex(null);
      setTextVisible(true);
    }, duration + textDelay);
  }, [currentIndex, count, duration, textDelay]);

  useEffect(() => {
    if (count <= 1) return;

    // Total cycle: image transition + text delay + text visible time
    timerRef.current = window.setInterval(advance, interval);
    return () => {
      if (timerRef.current != null) clearInterval(timerRef.current);
    };
  }, [advance, interval, count]);

  // Cleanup text timer
  useEffect(() => {
    return () => {
      if (textTimerRef.current != null) clearTimeout(textTimerRef.current);
    };
  }, []);

  if (count === 0) return <div className={clsx('absolute inset-0', className)} />;

  if (count === 1) {
    return (
      <div className={clsx('absolute inset-0', className)}>
        {slides[0].image}
        {slides[0].text != null && (
          <div className="slider-text-enter">{slides[0].text}</div>
        )}
        {overlay}
      </div>
    );
  }

  const durationStyle = `${duration}ms`;

  return (
    <div className={clsx('absolute inset-0 overflow-hidden', className)}>
      {/* Previous image — slides out */}
      {prevIndex != null && (
        <div
          className={clsx('absolute inset-0 z-[1]', animating ? '-translate-x-full' : 'translate-x-0')}
          style={{ transition: `transform ${durationStyle} ease` }}
        >
          {slides[prevIndex].image}
        </div>
      )}

      {/* Current image — slides in */}
      <div
        className={clsx(
          'absolute inset-0 z-[2]',
          prevIndex != null ? (animating ? 'translate-x-0' : 'translate-x-full') : 'translate-x-0'
        )}
        style={{ transition: prevIndex != null ? `transform ${durationStyle} ease` : 'none' }}
      >
        {slides[currentIndex].image}
      </div>

      {/* Text layer — fades up after image lands */}
      {slides[currentIndex].text != null && (
        <div
          key={slides[currentIndex].key}
          className={clsx('absolute inset-0 z-[3]', textVisible ? 'slider-text-enter' : 'opacity-0')}
        >
          {slides[currentIndex].text}
        </div>
      )}

      {/* Static overlay always on top */}
      {overlay != null && <div className="absolute inset-0 z-[4]">{overlay}</div>}
    </div>
  );
}
