'use client';

import ScrollReveal from '@/components/ScrollReveal/ScrollReveal';
import CountUp from '@/components/CountUp/CountUp';
import styles from './About.module.css';

interface AboutProps {
  badge: string;
  title: string;
  description: string;
  description2: string;
  yearsExp: number;
  projects: number;
  clients: number;
  technologies: number;
  yearsExpLabel: string;
  projectsLabel: string;
  clientsLabel: string;
  technologiesLabel: string;
}

export default function About({
  badge, title, description, description2,
  yearsExp, projects, clients, technologies,
  yearsExpLabel, projectsLabel, clientsLabel, technologiesLabel
}: AboutProps) {
  return (
    <section id="about" className={styles.section}>
      <div className={styles.container}>
        <ScrollReveal>
          <span className={styles.badge}>{badge}</span>
        </ScrollReveal>

        <ScrollReveal delay={0.1}>
          <h2 className={styles.title}>{title}</h2>
        </ScrollReveal>

        <div className={styles.content}>
          <ScrollReveal delay={0.2} direction="left">
            <div className={styles.textBlock}>
              <p className={styles.description}>{description}</p>
              <p className={styles.description}>{description2}</p>
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.3} direction="right">
            <div className={styles.visual}>
              <div className={styles.codeBlock}>
                <div className={styles.codeHeader}>
                  <span className={styles.dot} style={{background: '#ff5f57'}}></span>
                  <span className={styles.dot} style={{background: '#febc2e'}}></span>
                  <span className={styles.dot} style={{background: '#28c840'}}></span>
                </div>
                <pre className={styles.code}>
{`const technicalVibe = {
  passion: "∞",
  coffee: "☕☕☕",
  code: () => "amazing stuff",
  motto: "Build. Innovate. Repeat."
};`}
                </pre>
              </div>
            </div>
          </ScrollReveal>
        </div>

        <div className={styles.stats}>
          <CountUp end={yearsExp} label={yearsExpLabel} />
          <CountUp end={projects} label={projectsLabel} />
          <CountUp end={clients} label={clientsLabel} />
          <CountUp end={technologies} label={technologiesLabel} />
        </div>
      </div>
    </section>
  );
}
