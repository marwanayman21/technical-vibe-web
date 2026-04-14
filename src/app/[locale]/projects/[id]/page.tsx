import {getTranslations, setRequestLocale} from 'next-intl/server';
import {getPortfolioItem} from '@/lib/firestore';
import styles from './projects.module.css';
import Link from 'next/link';
import ParticlesBg from '@/components/ParticlesBg/ParticlesBg';
import {notFound} from 'next/navigation';

export default async function ProjectPage({
  params
}: {
  params: Promise<{id: string, locale: string}>
}) {
  const {id, locale} = await params;
  setRequestLocale(locale);

  const project = await getPortfolioItem(id);
  if (!project) {
    notFound();
  }

  const t = await getTranslations('ProjectDetails');
  const isAr = locale === 'ar';

  const title = (isAr && project.titleAr) ? project.titleAr : project.title;
  const description = (isAr && project.descriptionAr) ? project.descriptionAr : project.description;

  return (
    <div className={styles.page}>
      <ParticlesBg />
      <div className={styles.container}>
        <Link href={`/${locale}`} className={styles.backBtn}>
          {isAr ? '←' : '←'} {t('back')}
        </Link>

        <header className={styles.header}>
          <h1 className={styles.title}>{title}</h1>
          <div className={styles.tags}>
            {project.tags.map(tag => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>
        </header>

        <div className={styles.mainImageWrapper}>
          <img 
            src={project.imageUrl} 
            alt={title} 
            className={styles.mainImage}
          />
        </div>

        <div className={styles.contentGrid}>
          <div className={styles.mainContent}>
            <h2 className={styles.sectionTitle}>{t('about')}</h2>
            <p className={styles.description}>{description}</p>
          </div>

          <aside className={styles.sidebar}>
            <div className={styles.sidebarSection}>
              <h3 className={styles.sectionTitle}>{t('technologies')}</h3>
              <div className={styles.tags} style={{justifyContent: 'flex-start'}}>
                {project.tags.map(tag => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
              </div>
              {project.link && (
                <a 
                  href={project.link} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className={styles.demoBtn}
                >
                  {t('viewDemo')}
                </a>
              )}
            </div>
          </aside>
        </div>

        {project.galleryImages && project.galleryImages.length > 0 && (
          <section className={styles.gallery}>
            <h2 className={styles.sectionTitle}>{t('gallery')}</h2>
            <div className={styles.galleryGrid}>
              {project.galleryImages.map((img, i) => (
                <div key={i} className={styles.galleryItem}>
                  <img src={img} alt={`${title} gallery ${i}`} className={styles.galleryImg} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
