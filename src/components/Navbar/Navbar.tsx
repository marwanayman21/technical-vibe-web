'use client';

import {useTranslations, useLocale} from 'next-intl';
import {usePathname, useRouter, Link} from '@/i18n/routing';
import {useState} from 'react';
import {motion, AnimatePresence} from 'framer-motion';
import styles from './Navbar.module.css';

export default function Navbar() {
  const t = useTranslations('Navigation');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLangToggle = () => {
    const nextLocale = locale === 'en' ? 'ar' : 'en';
    router.replace(pathname, {locale: nextLocale});
  };

  const navItems = [
    {label: t('home'), href: '/'},
    {label: t('about'), href: '/#about'},
    {label: t('services'), href: '/#services'},
    {label: t('portfolio'), href: '/#portfolio'},
    {label: t('contact'), href: '/#contact'},
  ];

  return (
    <>
      <header className={styles.header}>
        <Link href="/" className={styles.logo}>
          <img src="/logo.png" alt="Technical Vibe Logo" className={styles.logoImg} />
          <span className={styles.brandName}>Technical Vibe</span>
        </Link>
        
        <nav className={styles.nav}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href as any} className={styles.navLink}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className={styles.actions}>
          <button onClick={handleLangToggle} className={styles.langBtn}>
            {locale === 'en' ? 'العربية' : 'En'}
          </button>
          <button
            className={styles.hamburger}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Menu"
          >
            <span className={`${styles.bar} ${mobileOpen ? styles.barOpen1 : ''}`}></span>
            <span className={`${styles.bar} ${mobileOpen ? styles.barOpen2 : ''}`}></span>
            <span className={`${styles.bar} ${mobileOpen ? styles.barOpen3 : ''}`}></span>
          </button>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{opacity: 0, y: -20}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -20}}
            transition={{duration: 0.3}}
          >
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href as any}
                className={styles.mobileLink}
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
