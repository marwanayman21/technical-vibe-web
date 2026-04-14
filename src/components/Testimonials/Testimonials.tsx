'use client';

import {useState} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import ScrollReveal from '@/components/ScrollReveal/ScrollReveal';
import styles from './Testimonials.module.css';

interface Testimonial {
  id: string;
  name: string;
  message: string;
  rating: number;
}

interface TestimonialsProps {
  badge: string;
  title: string;
  subtitle: string;
  items: Testimonial[];
  submitText: string;
  formTitle: string;
  placeholderName: string;
  placeholderMsg: string;
}

export default function Testimonials({
  badge, title, subtitle, items, submitText, formTitle, placeholderName, placeholderMsg
}: TestimonialsProps) {
  const [form, setForm] = useState({name: '', message: '', rating: 5});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/testimonials', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setSubmitted(true);
        setForm({name: '', message: '', rating: 5});
        setTimeout(() => setSubmitted(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="testimonials" className={styles.section}>
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
                whileHover={{y: -10}}
                transition={{duration: 0.3}}
              >
                <div className={styles.rating}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} className={i < item.rating ? styles.starFilled : styles.starEmpty}>★</span>
                  ))}
                </div>
                <p className={styles.message}>"{item.message}"</p>
                <div className={styles.author}>
                  <div className={styles.avatar}>{item.name[0]}</div>
                  <div>
                    <h4 className={styles.name}>{item.name}</h4>
                  </div>
                </div>
              </motion.div>
            </ScrollReveal>
          ))}
        </div>

        {/* Submission Form */}
        <div className={styles.formSection}>
          <ScrollReveal>
            <div className={styles.formCard}>
              <h3 className={styles.formTitle}>{formTitle}</h3>
              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.ratingPicker}>
                  {[1, 2, 3, 4, 5].map((num) => (
                    <button
                      key={num}
                      type="button"
                      className={`${styles.starBtn} ${form.rating >= num ? styles.starBtnActive : ''}`}
                      onClick={() => setForm({...form, rating: num})}
                    >
                      ★
                    </button>
                  ))}
                </div>
                <div className={styles.inputGroup}>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({...form, name: e.target.value})}
                    placeholder={placeholderName}
                    className={styles.input}
                    required
                  />
                  <textarea
                    value={form.message}
                    onChange={(e) => setForm({...form, message: e.target.value})}
                    placeholder={placeholderMsg}
                    className={styles.textarea}
                    rows={3}
                    required
                  />
                </div>
                <button type="submit" disabled={submitting} className={styles.submitBtn}>
                  {submitting ? '...' : submitted ? '✅ Thank you!' : submitText}
                </button>
              </form>
            </div>
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}
