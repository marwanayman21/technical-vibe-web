'use client';

import ScrollReveal from '@/components/ScrollReveal/ScrollReveal';
import {motion} from 'framer-motion';
import styles from './Portfolio.module.css';

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  tags: string[];
}

interface PortfolioProps {
  badge: string;
  title: string;
  subtitle: string;
  viewProjectText: string;
  items: PortfolioItem[];
}

export default function Portfolio({badge, title, subtitle, viewProjectText, items}: PortfolioProps) {
  return (
    <section id="portfolio" className={styles.section}>
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
            <ScrollReveal key={item.id} delay={0.1 * index}>
              <motion.div
                className={styles.card}
                whileHover={{y: -6}}
                transition={{duration: 0.3}}
              >
                <div className={styles.imageWrapper}>
                  <div
                    className={styles.image}
                    style={{
                      backgroundImage: item.imageUrl ? `url(${item.imageUrl})` : undefined,
                      backgroundColor: item.imageUrl ? undefined : '#1a1a2e',
                    }}
                  >
                    {!item.imageUrl && (
                      <span className={styles.placeholder}>📁</span>
                    )}
                  </div>
                  <div className={styles.overlay}>
                    <a
                      href={item.link || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.viewBtn}
                    >
                      {viewProjectText} →
                    </a>
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <h3 className={styles.cardTitle}>{item.title}</h3>
                  <p className={styles.cardDesc}>{item.description}</p>
                  <div className={styles.tags}>
                    {item.tags.map((tag) => (
                      <span key={tag} className={styles.tag}>{tag}</span>
                    ))}
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
}
