import React, { useState, useCallback } from 'react';
import { motion, useMotionValue, animate } from 'framer-motion';
import { IMAGES } from '../data/gallery';
import GalleryImage from './GalleryImage';
import ProgressBar from './ProgressBar';
import OverlayText from './OverlayText';
import { useKeyNav } from '../hooks/useKeyNav';
import styles from '../styles/Gallery.module.css';

const smoothTransition = {
  type: 'tween',
  ease: [0.32, 0.72, 0, 1], // Custom cinematic easing
  duration: 0.7,
} as const;

const Gallery: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [windowSize, setWindowSize] = useState({ 
    w: typeof window !== 'undefined' ? window.innerWidth : 1920
  });

  React.useEffect(() => {
    const handleResize = () => setWindowSize({ w: window.innerWidth });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const xMult = windowSize.w * 0.35;
  
  // Motion value for horizontal drag distance
  const dragX = useMotionValue(0);

  const paginate = useCallback((newDirection: number) => {
    const currentX = dragX.get();
    setIndex((prevIndex) => (prevIndex + newDirection + IMAGES.length) % IMAGES.length);
    
    dragX.stop();
    dragX.set(currentX + newDirection * xMult);
    
    // Transition to the new center with smooth tween logic
    animate(dragX, 0 as any, {
      ...smoothTransition
    });
  }, [dragX, xMult]);

  useKeyNav(() => paginate(-1), () => paginate(1));

  const handleDragEnd = (_: any, info: any) => {
    const threshold = 120;
    if (info.offset.x < -threshold) {
      paginate(1);
    } else if (info.offset.x > threshold) {
      paginate(-1);
    } else {
      animate(dragX, 0 as any, { 
        ...smoothTransition,
        duration: 0.5 
      });
    }
  };

  // Scroll/Wheel Navigation
  React.useEffect(() => {
    let scrollTimeout: any;
    const handleWheel = (e: WheelEvent) => {
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      dragX.set(dragX.get() - delta * 0.4);
      
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const threshold = 100;
        const currentXValue = dragX.get();
        if (currentXValue < -threshold) {
          paginate(1);
        } else if (currentXValue > threshold) {
          paginate(-1);
        } else {
          animate(dragX, 0 as any, { ...smoothTransition, duration: 0.5 });
        }
      }, 100);
    };

    window.addEventListener('wheel', handleWheel, { passive: true });
    return () => {
      window.removeEventListener('wheel', handleWheel);
      clearTimeout(scrollTimeout);
    };
  }, [dragX, paginate]);

  const activeImage = IMAGES[index];

  return (
    <main className={styles.viewport}>
      <div className="grain" />
      
      {/* Radiant atmospheric background */}
      <div className={styles.glowContainer}>
        <div className={`${styles.glow} ${styles.glow1}`} />
        <div className={`${styles.glow} ${styles.glow2}`} />
        <div className={`${styles.glow} ${styles.glow3}`} />
        {/* Slow glowing particles */}
        <div className={`${styles.particle} ${styles.particle1}`} />
        <div className={`${styles.particle} ${styles.particle2}`} />
        <div className={`${styles.particle} ${styles.particle3}`} />
        <div className={`${styles.particle} ${styles.particle4}`} />
        <div className={`${styles.particle} ${styles.particle5}`} />
        <div className={`${styles.particle} ${styles.particle6}`} />
        <div className={`${styles.particle} ${styles.particle7}`} />
        <div className={`${styles.particle} ${styles.particle8}`} />
        <div className={`${styles.particle} ${styles.particle9}`} />
        <div className={`${styles.particle} ${styles.particle10}`} />
      </div>

      {/* Static Background Frame with Corner Brackets */}
      <div className={styles.staticFrame}>
        {/* Top Left */}
        <div className={`${styles.marker} ${styles.markerTL_H}`} />
        <div className={`${styles.marker} ${styles.markerTL_V}`} />
        
        {/* Top Right */}
        <div className={`${styles.marker} ${styles.markerTR_H}`} />
        <div className={`${styles.marker} ${styles.markerTR_V}`} />
        
        {/* Bottom Left */}
        <div className={`${styles.marker} ${styles.markerBL_H}`} />
        <div className={`${styles.marker} ${styles.markerBL_V}`} />
        
        {/* Bottom Right */}
        <div className={`${styles.marker} ${styles.markerBR_H}`} />
        <div className={`${styles.marker} ${styles.markerBR_V}`} />
      </div>

      <motion.div 
        className={styles.galleryContainer}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.4}
        onDrag={(_, info) => dragX.set(info.offset.x)}
        onDragEnd={handleDragEnd}
        style={{ cursor: 'grab' }}
        whileTap={{ cursor: 'grabbing' }}
      >
        {IMAGES.map((img, i) => (
          <GalleryImage
            key={img.id}
            id={img.id}
            src={img.src}
            index={i}
            activeIndex={index}
            dragX={dragX}
            transition={smoothTransition}
            onClick={() => {
              const diff = i - index;
              if (diff === 0) return;
              const total = IMAGES.length;
              let direction = diff;
              if (direction > total / 2) direction -= total;
              if (direction < -total / 2) direction += total;
              paginate(direction > 0 ? 1 : -1);
            }}
          />
        ))}
      </motion.div>

      <OverlayText
        id={activeImage.id}
        number={activeImage.number}
        title={activeImage.title}
        themeText={activeImage.themeText}
      />

      <div className={styles.bottomNav}>
        <ProgressBar
          current={index}
          total={IMAGES.length}
          transition={smoothTransition}
        />
      </div>
    </main>
  );
};
export default Gallery;