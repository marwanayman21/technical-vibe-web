'use client';

import {motion} from 'framer-motion';
import styles from './Hero.module.css';

interface HeroProps {
  titleText: string;
  subtitleText: string;
  ctaText: string;
  ctaSecondaryText: string;
  brandingName?: string;
}

export default function Hero({titleText, subtitleText, ctaText, ctaSecondaryText, brandingName}: Readonly<HeroProps>) {
  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({behavior: 'smooth'});
  };

  return (
    <section className={styles.heroSection}>
      <motion.div
        initial={{opacity: 0, y: 30}}
        animate={{opacity: 1, y: 0}}
        transition={{duration: 0.8, ease: "easeOut"}}
        style={{textAlign: 'center', position: 'relative', zIndex: 1}}
      >
        <h1 className={styles.title}>
          {titleText} <br/>
          <motion.span 
            className={styles.highlight}
            initial={{opacity: 0, scale: 0.8}}
            animate={{opacity: 1, scale: 1}}
            transition={{duration: 0.8, delay: 0.3}}
          >
            {brandingName || 'Technical Vibe'}
          </motion.span>
        </h1>
        
        <motion.p 
          className={styles.subtitle}
          initial={{opacity: 0}}
          animate={{opacity: 1}}
          transition={{duration: 0.8, delay: 0.6}}
        >
          {subtitleText}
        </motion.p>

        <motion.div 
          className={styles.ctaContainer}
          initial={{opacity: 0, y: 20}}
          animate={{opacity: 1, y: 0}}
          transition={{duration: 0.8, delay: 0.9}}
        >
          <motion.button
            className={styles.primaryBtn}
            whileHover={{scale: 1.05}}
            whileTap={{scale: 0.95}}
            onClick={() => scrollTo('portfolio')}
          >
            {ctaText}
          </motion.button>
          <motion.button
            className={styles.secondaryBtn}
            whileHover={{scale: 1.05}}
            whileTap={{scale: 0.95}}
            onClick={() => scrollTo('contact')}
          >
            {ctaSecondaryText}
          </motion.button>
        </motion.div>
      </motion.div>

      {/* Floating decoration elements */}
      <motion.div
        className={styles.floatingOrb1}
        animate={{y: [0, -20, 0], x: [0, 10, 0]}}
        transition={{duration: 6, repeat: Infinity, ease: "easeInOut"}}
      />
      <motion.div
        className={styles.floatingOrb2}
        animate={{y: [0, 15, 0], x: [0, -15, 0]}}
        transition={{duration: 8, repeat: Infinity, ease: "easeInOut"}}
      />
    </section>
  );
}
