'use client';

import ScrollReveal from '@/components/ScrollReveal/ScrollReveal';
import {motion} from 'framer-motion';
import styles from './Contact.module.css';
import {useState} from 'react';

interface ContactProps {
  badge: string;
  title: string;
  subtitle: string;
  namePlaceholder: string;
  emailPlaceholder: string;
  messagePlaceholder: string;
  sendText: string;
  phoneLabel: string;
  phoneValue: string;
  emailLabel: string;
  emailValue: string;
  locationLabel: string;
  locationValue: string;
}

export default function Contact({
  badge, title, subtitle,
  namePlaceholder, emailPlaceholder, messagePlaceholder, sendText,
  phoneLabel, phoneValue, emailLabel, emailValue, locationLabel, locationValue,
}: ContactProps) {
  const [formState, setFormState] = useState({name: '', email: '', message: ''});
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formState),
      });

      if (!res.ok) throw new Error('Failed to send message');

      setStatus('success');
      setFormState({name: '', email: '', message: ''});
      setTimeout(() => setStatus('idle'), 5000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  return (
    <section id="contact" className={styles.section}>
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

        <div className={styles.content}>
          <ScrollReveal delay={0.2} direction="left">
            <form className={styles.form} onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder={namePlaceholder}
                className={styles.input}
                value={formState.name}
                onChange={(e) => setFormState({...formState, name: e.target.value})}
                required
              />
              <input
                type="email"
                placeholder={emailPlaceholder}
                className={styles.input}
                value={formState.email}
                onChange={(e) => setFormState({...formState, email: e.target.value})}
                required
              />
              <textarea
                placeholder={messagePlaceholder}
                className={styles.textarea}
                rows={6}
                value={formState.message}
                onChange={(e) => setFormState({...formState, message: e.target.value})}
                required
              />
              <motion.button
                type="submit"
                className={`${styles.submitBtn} ${styles[status]}`}
                whileHover={{scale: 1.03}}
                whileTap={{scale: 0.97}}
                disabled={status === 'loading'}
              >
                {status === 'loading' ? '...' : status === 'success' ? '✓' : status === 'error' ? '!' : sendText}
              </motion.button>
              {status === 'success' && <p className={styles.statusSuccess}>Message sent! We'll get back to you soon.</p>}
              {status === 'error' && <p className={styles.statusError}>Something went wrong. Please try again.</p>}
            </form>
          </ScrollReveal>

          <ScrollReveal delay={0.3} direction="right">
            <div className={styles.info}>
              <div className={styles.infoCard}>
                <span className={styles.infoIcon}>📞</span>
                <div>
                  <h4 className={styles.infoLabel}>{phoneLabel}</h4>
                  <p className={styles.infoValue}>{phoneValue}</p>
                </div>
              </div>
              <div className={styles.infoCard}>
                <span className={styles.infoIcon}>✉️</span>
                <div>
                  <h4 className={styles.infoLabel}>{emailLabel}</h4>
                  <p className={styles.infoValue}>{emailValue}</p>
                </div>
              </div>
              <div className={styles.infoCard}>
                <span className={styles.infoIcon}>📍</span>
                <div>
                  <h4 className={styles.infoLabel}>{locationLabel}</h4>
                  <p className={styles.infoValue}>{locationValue}</p>
                </div>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
