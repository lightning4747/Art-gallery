import React, { useEffect, useState } from 'react';
import { motion, useTransform, MotionValue } from 'framer-motion';
import { IMAGES } from '../data/gallery';
import styles from '../styles/GalleryImage.module.css';

interface GalleryImageProps {
  src: string;
  index: number;
  activeIndex: number;
  offsetX: MotionValue<number>; // slot-space: 0=settled, ±1=adjacent slot
  onClick?: () => void;
}

const GalleryImage: React.FC<GalleryImageProps> = ({
  src, index, activeIndex, offsetX, onClick,
}) => {
  const [size, setSize] = useState({
    w: typeof window !== 'undefined' ? window.innerWidth  : 1920,
    h: typeof window !== 'undefined' ? window.innerHeight : 1080,
  });

  useEffect(() => {
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const total = IMAGES.length;
  let relPos = index - activeIndex;
  if (relPos > total / 2) relPos -= total;
  if (relPos < -total / 2) relPos += total;

  // Clamp: only render prev (-1), active (0), next (1). Others are invisible.
  const isVisible = Math.abs(relPos) <= 1;

  // Slot dimensions
  const slotW = size.w * 0.38;
  const slotH = size.h * 0.30;

  // offsetX is in slot-space. relPos is this image's slot.
  // totalOffset = how far this image is from screen center, in slots.
  // We map slot-space → px directly — no intermediate spring.

  const px = useTransform(offsetX, v => (relPos + v) * slotW);
  const py = useTransform(offsetX, v => (relPos + v) * slotH);

  const scale = useTransform(offsetX, v => {
    // Distance from center in slot-space
    const dist = Math.abs(relPos + v);
    // 1.0 at center, 0.28 at ±1 slot — smooth curve
    return 1 - Math.min(dist, 1) * 0.72;
  });

  const opacity = useTransform(offsetX, v => {
    const dist = Math.abs(relPos + v);
    return 1 - Math.min(dist, 1) * 0.55;
  });

  const rotate = useTransform(offsetX, v => {
    // Subtle tilt: leans with the drag direction
    const dist = relPos + v;
    return dist * -2; // ±2° max
  });

  if (!isVisible) return null;

  const isActive = relPos === 0;

  return (
    <motion.div
      className={`${styles.wrapper} ${isActive ? styles.active : styles.flanking}`}
      style={{
        x: px,
        y: py,
        scale,
        rotate,
        opacity,
        zIndex: isActive ? 10 : 5,
        translateX: '-50%',
        translateY: '-50%',
      }}
      onClick={!isActive ? onClick : undefined}
    >
      <img
        src={src}
        className={styles.image}
        alt={`gallery-${index}`}
        draggable={false}
      />
      {!isActive && <div className={styles.overlay} />}
    </motion.div>
  );
};

export default GalleryImage;