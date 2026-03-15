import React, { useState, useCallback, useRef, useEffect } from 'react';
import { useMotionValue, animate, MotionValue } from 'framer-motion';
import { IMAGES } from '../data/gallery';
import GalleryImage from './GalleryImage';
import ProgressBar from './ProgressBar';
import OverlayText from './OverlayText';
import { useKeyNav } from '../hooks/useKeyNav';
import styles from '../styles/Gallery.module.css';

// Cinematic viscous transition (No springs, pure professional control)
const LIQUID_TRANSITION = { 
  type: 'tween' as const, 
  duration: 0.6, 
  ease: [0.22, 1, 0.36, 1] 
};

type AnimateFunction = (mv: MotionValue<number>, target: number, opts: typeof LIQUID_TRANSITION) => { then: (cb: () => void) => void };

const animateTo = (mv: MotionValue<number>, target: number) =>
  (animate as unknown as AnimateFunction)(mv, target, LIQUID_TRANSITION);

const Gallery: React.FC = () => {
  const [index, setIndex] = useState(0);
  const isAnimating = useRef(false);
  const lastPulseTime = useRef(0);

  // Raw slot-space value (0 = centered)
  const offsetX = useMotionValue(0); 

  const paginate = useCallback((direction: 1 | -1) => {
    // Remove isAnimating guard to allow immediate follow-up inputs
    offsetX.stop();
    isAnimating.current = true;

    // Handover: compensate for coordinate shift
    const currentVal = offsetX.get();
    offsetX.set(currentVal + direction); 
    
    setIndex(prev => (prev + direction + IMAGES.length) % IMAGES.length);
    
    // Smooth, controlled glide
  animateTo(offsetX, 0).then(() => {
    isAnimating.current = false;
  });
    }, [offsetX]);

  useKeyNav(() => paginate(-1), () => paginate(1));

  const dragStart = useRef<number | null>(null);

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    dragStart.current = e.clientX;
    offsetX.stop();
    isAnimating.current = false;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
  }, [offsetX]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (dragStart.current === null) return;
    const delta = e.clientX - dragStart.current;
    const slotWidth = window.innerWidth * 0.38;
    // Clamp to ±0.99 so images never leave render range
    const move = Math.max(-0.99, Math.min(0.99, delta / slotWidth));
    offsetX.set(move);
  }, [offsetX]);
  
const onPointerUp = useCallback((e: React.PointerEvent) => {
  if (dragStart.current === null) return;
  const delta = e.clientX - dragStart.current;
  dragStart.current = null;

  const threshold = 80;
  if (delta < -threshold) paginate(1);
  else if (delta > threshold) paginate(-1);
  else animateTo(offsetX, 0);
}, [offsetX, paginate]);

  // Pulse Scroll Logic: Reduced interval for instant responsiveness
  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      const now = Date.now();
      // Reduced to 100ms to allow "no waiting time" between shifts
      const SHIFT_INTERVAL = 100; 

      if (now - lastPulseTime.current < SHIFT_INTERVAL) return;

      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      if (Math.abs(delta) < 10) return; 

      lastPulseTime.current = now;
      paginate(delta > 0 ? 1 : -1);
    };

    window.addEventListener('wheel', onWheel, { passive: true });
    return () => window.removeEventListener('wheel', onWheel);
  }, [paginate]);

  const activeImage = IMAGES[index];
  return (
    <main
      className={styles.viewport}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => { dragStart.current = null; animateTo(offsetX, 0); }}
      style={{ cursor: 'grab' }}
    >
      <div className="grain" />

      <div className={styles.glowContainer}>
        <div className={`${styles.glow} ${styles.glow1}`} />
        <div className={`${styles.glow} ${styles.glow2}`} />
        <div className={`${styles.glow} ${styles.glow3}`} />
        {Array.from({ length: 12 }, (_, i) => (
          <div key={i} className={`${styles.particle} ${styles[`particle${(i % 10) + 1}` as keyof typeof styles]}`} />
        ))}
      </div>

      <div className={styles.staticFrame}>
        <div className={`${styles.marker} ${styles.markerTL_H}`} />
        <div className={`${styles.marker} ${styles.markerTL_V}`} />
        <div className={`${styles.marker} ${styles.markerTR_H}`} />
        <div className={`${styles.marker} ${styles.markerTR_V}`} />
        <div className={`${styles.marker} ${styles.markerBL_H}`} />
        <div className={`${styles.marker} ${styles.markerBL_V}`} />
        <div className={`${styles.marker} ${styles.markerBR_H}`} />
        <div className={`${styles.marker} ${styles.markerBR_V}`} />
      </div>

      <div className={styles.galleryContainer}>
        {IMAGES.map((img, i) => (
          <GalleryImage
            key={img.id}
            src={img.src}
            index={i}
            activeIndex={index}
            offsetX={offsetX}
            onClick={() => {
              const total = IMAGES.length;
              let diff = i - index;
              if (diff > total / 2) diff -= total;
              if (diff < -total / 2) diff += total;
              if (diff !== 0) paginate(diff > 0 ? 1 : -1);
            }}
          />
        ))}
      </div>

      <OverlayText
        id={activeImage.id}
        number={activeImage.number}
        title={activeImage.title}
        themeText={activeImage.themeText}
      />

      <div className={styles.bottomNav}>
        <ProgressBar current={index} total={IMAGES.length} transition={LIQUID_TRANSITION} />
      </div>
    </main>
  );
};

export default Gallery;