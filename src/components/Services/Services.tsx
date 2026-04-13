'use client';

import ScrollReveal from '@/components/ScrollReveal/ScrollReveal';
import {motion} from 'framer-motion';
import styles from './Services.module.css';

interface ServiceItem {
  icon: string;
  title: string;
  description: string;
}

interface ServicesProps {
  badge: string;
  title: string;
  subtitle: string;
  items: ServiceItem[];
}

export default function Services({badge, title, subtitle, items}: ServicesProps) {
  return (
    <section id="services" className={styles.section}>
      <div className={styles.container}>
        <ScrollReveal>
          <span className={styles.badge}>{badge}</span>
        </ScrollReveal>
        <ScrollReveal delay={0.1}>
          <h2 className={styles.title}>{title}</h2>
        </ScrollReveal>
        <ScrollReveal delay={0.15}>
          <p className={styles.subtitle}>{subtitle}</p>
        </ScrollReveal>

        <div className={styles.grid}>
          {items.map((item, index) => (
            <ScrollReveal key={index} delay={0.1 * index}>
              <motion.div
                className={styles.card}
                whileHover={{y: -8, transition: {duration: 0.3}}}
              >
                <div className={styles.iconWrapper}>
                  <span className={styles.icon}>{item.icon}</span>
                </div>
                <h3 className={styles.cardTitle}>{item.title}</h3>
                <p className={styles.cardDesc}>{item.description}</p>
                <div className={styles.cardGlow}></div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
