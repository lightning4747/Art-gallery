import React from 'react';
import { motion } from 'framer-motion';
import styles from '../styles/ProgressBar.module.css';

interface ProgressBarProps {
  current: number;
  total: number;
  transition: any;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, total, transition }) => {
  return (
    <div className={styles.container}>
      <div className={styles.barWrapper}>
        <motion.div
          className={styles.bar}
          initial={false}
          animate={{ width: `${((current + 1) / total) * 100}%` }}
          transition={transition}
          style={{ backgroundColor: 'var(--c-ivory)' }}
        />
      </div>
      <span className={styles.counter}>
        {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </span>
    </div>
  );
};

export default ProgressBar;