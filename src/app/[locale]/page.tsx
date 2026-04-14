import {getTranslations} from 'next-intl/server';
import {setRequestLocale} from 'next-intl/server';
import Hero from '@/components/Hero/Hero';
import About from '@/components/About/About';
import Services from '@/components/Services/Services';
import Portfolio from '@/components/Portfolio/Portfolio';
import Contact from '@/components/Contact/Contact';
import Testimonials from '@/components/Testimonials/Testimonials';
import Footer from '@/components/Footer/Footer';
import ParticlesBg from '@/components/ParticlesBg/ParticlesBg';
import {getPortfolioItems, getSiteContent, getSiteSettings, getTestimonials, getServiceItems} from '@/lib/firestore';

export default async function HomePage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  setRequestLocale(locale);

  const tHero = await getTranslations('Hero');
  const tAbout = await getTranslations('About');
  const tServices = await getTranslations('Services');
  const tPortfolio = await getTranslations('Portfolio');
  const tContact = await getTranslations('Contact');
  const tTestimonials = await getTranslations('Testimonials');
  const tFooter = await getTranslations('Footer');
  const tNav = await getTranslations('Navigation');

  // Fetch all data from Firestore
  const [portfolioItems, siteContent, siteSettings, testimonials, dbServices] = await Promise.all([
    getPortfolioItems(),
    getSiteContent(),
    getSiteSettings(),
    getTestimonials(),
    getServiceItems()
  ]);

  // Merge Firestore content with translations (Firestore overrides translations)
  const isAr = locale === 'ar';

  const heroData = {
    title: (isAr ? siteContent?.hero?.titleAr : siteContent?.hero?.title) || siteContent?.hero?.title || tHero('title'),
    subtitle: (isAr ? siteContent?.hero?.subtitleAr : siteContent?.hero?.subtitle) || siteContent?.hero?.subtitle || tHero('subtitle'),
    cta: (isAr ? siteContent?.hero?.ctaAr : siteContent?.hero?.cta) || siteContent?.hero?.cta || tHero('cta'),
    ctaSecondary: (isAr ? siteContent?.hero?.ctaSecondaryAr : siteContent?.hero?.ctaSecondary) || siteContent?.hero?.ctaSecondary || tHero('ctaSecondary'),
  };

  const aboutData = {
    badge: (isAr ? siteContent?.about?.badgeAr : siteContent?.about?.badge) || siteContent?.about?.badge || tAbout('badge'),
    title: (isAr ? siteContent?.about?.titleAr : siteContent?.about?.title) || siteContent?.about?.title || tAbout('title'),
    description: (isAr ? siteContent?.about?.descriptionAr : siteContent?.about?.description) || siteContent?.about?.description || tAbout('description'),
    description2: (isAr ? siteContent?.about?.description2Ar : siteContent?.about?.description2) || siteContent?.about?.description2 || tAbout('description2'),
  };

  const servicesData = {
    badge: (isAr ? siteContent?.services?.badgeAr : siteContent?.services?.badge) || siteContent?.services?.badge || tServices('badge'),
    title: (isAr ? siteContent?.services?.titleAr : siteContent?.services?.title) || siteContent?.services?.title || tServices('title'),
    subtitle: (isAr ? siteContent?.services?.subtitleAr : siteContent?.services?.subtitle) || siteContent?.services?.subtitle || tServices('subtitle'),
  };

  const contactData = {
    badge: (isAr ? siteContent?.contact?.badgeAr : siteContent?.contact?.badge) || siteContent?.contact?.badge || tContact('badge'),
    title: (isAr ? siteContent?.contact?.titleAr : siteContent?.contact?.title) || siteContent?.contact?.title || tContact('title'),
    subtitle: (isAr ? siteContent?.contact?.subtitleAr : siteContent?.contact?.subtitle) || siteContent?.contact?.subtitle || tContact('subtitle'),
  };

  const footerData = {
    description: (isAr ? siteContent?.footer?.descriptionAr : siteContent?.footer?.description) || siteContent?.footer?.description || tFooter('description'),
    rights: (isAr ? siteContent?.footer?.rightsAr : siteContent?.footer?.rights) || siteContent?.footer?.rights || tFooter('rights'),
  };

  const settings = {
    phone: siteSettings?.general?.phone || '+20 123 456 7890',
    email: siteSettings?.general?.email || 'info@technicalvibe.com',
    location: siteSettings?.general?.location || tContact('locationValue'),
    stats: {
      yearsExp: siteSettings?.stats?.yearsExp || 5,
      projects: siteSettings?.stats?.projects || 120,
      clients: siteSettings?.stats?.clients || 80,
      technologies: siteSettings?.stats?.technologies || 30,
    }
  };

  const siteName = locale === 'ar' 
    ? (siteSettings?.general?.siteNameAr || 'تيكنيكال فايب')
    : (siteSettings?.general?.siteNameEn || 'Technical Vibe');
  const logoUrl = siteSettings?.general?.logoUrl || '/logo.png';

  const serviceItems = dbServices.map(s => ({
    icon: s.icon,
    title: locale === 'ar' ? s.titleAr : s.titleEn,
    description: locale === 'ar' ? s.descAr : s.descEn,
  }));

  const navLinks = [
    {label: tNav('home'), href: '/'},
    {label: tNav('about'), href: '/#about'},
    {label: tNav('services'), href: '/#services'},
    {label: tNav('portfolio'), href: '/#portfolio'},
    {label: tNav('contact'), href: '/#contact'},
  ];

  return (
    <main style={{position: 'relative', zIndex: 1}}>
      <ParticlesBg />

      <Hero
        titleText={heroData.title}
        subtitleText={heroData.subtitle}
        ctaText={heroData.cta}
        ctaSecondaryText={heroData.ctaSecondary}
        brandingName={siteName}
      />

      <About
        badge={aboutData.badge}
        title={aboutData.title}
        description={aboutData.description}
        description2={aboutData.description2}
        yearsExp={settings.stats.yearsExp}
        projects={settings.stats.projects}
        clients={settings.stats.clients}
        technologies={settings.stats.technologies}
        yearsExpLabel={tAbout('yearsExp')}
        projectsLabel={tAbout('projects')}
        clientsLabel={tAbout('clients')}
        technologiesLabel={tAbout('technologies')}
      />

      <Services
        badge={servicesData.badge}
        title={servicesData.title}
        subtitle={servicesData.subtitle}
        items={serviceItems}
      />

      <Portfolio
        badge={tPortfolio('badge')}
        title={tPortfolio('title')}
        subtitle={tPortfolio('subtitle')}
        tryDemoText={tPortfolio('tryDemo')}
        viewDetailsText={tPortfolio('viewDetails')}
        items={portfolioItems}
        locale={locale}
      />

      <Contact
        badge={contactData.badge}
        title={contactData.title}
        subtitle={contactData.subtitle}
        namePlaceholder={tContact('name')}
        emailPlaceholder={tContact('email')}
        messagePlaceholder={tContact('message')}
        sendText={tContact('send')}
        phoneLabel={tContact('phone')}
        phoneValue={settings.phone}
        emailLabel={tContact('emailLabel')}
        emailValue={settings.email}
        locationLabel={tContact('location')}
        locationValue={settings.location}
        whatsappValue={siteSettings?.socials?.whatsapp}
      />

      <Testimonials
        badge={tTestimonials('badge')}
        title={tTestimonials('title')}
        subtitle={tTestimonials('subtitle')}
        items={testimonials}
        submitText={tTestimonials('submit')}
        formTitle={tTestimonials('formTitle')}
        placeholderName={tTestimonials('placeholderName')}
        placeholderMsg={tTestimonials('placeholderMsg')}
      />

      <Footer
        description={footerData.description}
        quickLinksTitle={tFooter('quickLinks')}
        contactInfoTitle={tFooter('contactInfo')}
        followUsTitle={tFooter('followUs')}
        rights={footerData.rights}
        phoneValue={settings.phone}
        emailValue={settings.email}
        locationValue={settings.location}
        navLinks={navLinks}
        socials={siteSettings?.socials || {}}
        siteName={siteName}
        logoUrl={logoUrl}
      />
    </main>
  );
}
