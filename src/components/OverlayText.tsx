import React from 'react';
import { motion } from 'framer-motion';
import styles from '../styles/OverlayText.module.css';

interface OverlayTextProps {
  id: string;
  number: string;
  title: string;
  themeText: string;
}

const OverlayText: React.FC<OverlayTextProps> = ({ id, number, title, themeText }) => {
  return (
    <motion.div
      key={id}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, delay: 0.3 }}
    >
      <div className={styles.topRight}>
        <span className={styles.themeText}>{themeText}</span>
      </div>

      <div className={styles.bottomLeft}>
        <div className={styles.caption}>
          <span className={styles.number}>{number}</span>
          <h1 className={styles.title}>{title}</h1>
        </div>
      </div>
    </motion.div>
  );
};

export default OverlayText;