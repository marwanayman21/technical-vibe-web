'use client';

import {motion, useInView} from 'framer-motion';
import {useRef, ReactNode} from 'react';

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
  className?: string;
}

export default function ScrollReveal({
  children,
  delay = 0,
  direction = 'up',
  className,
}: ScrollRevealProps) {
  const ref = useRef(null);
  const isInView = useInView(ref, {once: true, margin: '-80px'});

  const directionMap = {
    up: {y: 60, x: 0},
    down: {y: -60, x: 0},
    left: {y: 0, x: 60},
    right: {y: 0, x: -60},
  };

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{
        opacity: 0,
        x: directionMap[direction].x,
        y: directionMap[direction].y,
      }}
      animate={isInView ? {opacity: 1, x: 0, y: 0} : {}}
      transition={{
        duration: 0.7,
        delay,
        ease: [0.21, 0.47, 0.32, 0.98],
      }}
    >
      {children}
    </motion.div>
  );
}
