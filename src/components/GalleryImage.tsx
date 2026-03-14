import React, { useEffect, useState } from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';
import styles from '../styles/GalleryImage.module.css';
import { IMAGES } from '../data/gallery';

interface GalleryImageProps {
  id: string;
  src: string;
  index: number;
  activeIndex: number;
  dragX: MotionValue<number>;
  transition: any;
  onClick?: () => void;
}

const GalleryImage: React.FC<GalleryImageProps> = ({
  src,
  index,
  activeIndex,
  dragX,
  transition,
  onClick,
}) => {
  const [windowSize, setWindowSize] = useState({ 
    w: typeof window !== 'undefined' ? window.innerWidth : 1920,
    h: typeof window !== 'undefined' ? window.innerHeight : 1080
  });

  useEffect(() => {
    const handleResize = () => setWindowSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine logical position relative to the current active index (allowing for wrapping)
  const total = IMAGES.length;
  const getRelativePosition = (i: number, active: number) => {
    let diff = i - active;
    if (diff > total / 2) diff -= total;
    if (diff < -total / 2) diff += total;
    return diff;
  };

  const relPos = getRelativePosition(index, activeIndex);

  // Layout Constants
  const xMult = windowSize.w * 0.35;
  const yMult = windowSize.h * 0.15;
  
  // Drag sensitivity
  const dragRange = windowSize.w * 0.6;

  // Horizontal movement
  const x = useTransform(
    dragX,
    [-dragRange, 0, dragRange],
    [
      (relPos - 1) * xMult,
      relPos * xMult,
      (relPos + 1) * xMult
    ]
  );

  // Vertical movement
  const y = useTransform(
    dragX,
    [-dragRange, 0, dragRange],
    [
      relPos === 1 ? 0 : (relPos - 1) * yMult,
      relPos * yMult,
      relPos === -1 ? 0 : (relPos + 1) * yMult
    ]
  );

  // Scale
  const scale = useTransform(
    dragX,
    [-dragRange, 0, dragRange],
    [
      relPos === 1 ? 1 : 0.7,
      relPos === 0 ? 1 : 0.7,
      relPos === -1 ? 1 : 0.7
    ]
  );

  // Opacity
  const opacity = useTransform(
    dragX,
    [-dragRange, 0, dragRange],
    [
      relPos === 1 ? 1 : 0.65,
      relPos === 0 ? 1 : 0.65,
      relPos === -1 ? 1 : 0.65
    ]
  );

  const isActive = relPos === 0;

  return (
    <motion.div
      className={`${styles.wrapper} ${isActive ? styles.active : styles.flanking}`}
      style={{
        x,
        y,
        scale,
        opacity,
        zIndex: isActive ? 10 : 5,
        translateX: "-50%",
        translateY: "-50%",
      }}
      transition={transition}
      onClick={!isActive ? onClick : undefined}
    >
      <img
        src={src}
        className={styles.image}
        alt={`gallery-${index}`}
        loading="lazy"
      />
      {!isActive && <div className={styles.overlay} />}
    </motion.div>
  );
};

export default GalleryImage;