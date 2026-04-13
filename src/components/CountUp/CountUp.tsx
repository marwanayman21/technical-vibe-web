'use client';

import {motion, useInView} from 'framer-motion';
import {useRef} from 'react';
import styles from './CountUp.module.css';
import {useEffect, useState} from 'react';

interface CountUpProps {
  end: number;
  suffix?: string;
  label: string;
}

export default function CountUp({end, suffix = '+', label}: CountUpProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, {once: true});
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 2000;
    const step = end / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= end) {
        setCount(end);
        clearInterval(timer);
      } else {
        setCount(Math.floor(start));
      }
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, end]);

  return (
    <motion.div
      ref={ref}
      className={styles.stat}
      initial={{opacity: 0, y: 30}}
      animate={isInView ? {opacity: 1, y: 0} : {}}
      transition={{duration: 0.6}}
    >
      <span className={styles.number}>
        {count}{suffix}
      </span>
      <span className={styles.label}>{label}</span>
    </motion.div>
  );
}
