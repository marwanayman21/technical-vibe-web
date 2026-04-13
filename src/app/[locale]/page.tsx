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
  const heroData = {
    title: siteContent?.hero?.title || tHero('title'),
    subtitle: siteContent?.hero?.subtitle || tHero('subtitle'),
    cta: siteContent?.hero?.cta || tHero('cta'),
    ctaSecondary: siteContent?.hero?.ctaSecondary || tHero('ctaSecondary'),
  };

  const aboutData = {
    badge: siteContent?.about?.badge || tAbout('badge'),
    title: siteContent?.about?.title || tAbout('title'),
    description: siteContent?.about?.description || tAbout('description'),
    description2: siteContent?.about?.description2 || tAbout('description2'),
  };

  const servicesData = {
    badge: siteContent?.services?.badge || tServices('badge'),
    title: siteContent?.services?.title || tServices('title'),
    subtitle: siteContent?.services?.subtitle || tServices('subtitle'),
  };

  const contactData = {
    badge: siteContent?.contact?.badge || tContact('badge'),
    title: siteContent?.contact?.title || tContact('title'),
    subtitle: siteContent?.contact?.subtitle || tContact('subtitle'),
  };

  const footerData = {
    description: siteContent?.footer?.description || tFooter('description'),
    rights: siteContent?.footer?.rights || tFooter('rights'),
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
        viewProjectText={tPortfolio('viewProject')}
        items={portfolioItems}
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
      />

      <Testimonials
        badge={tTestimonials('badge')}
        title={tTestimonials('title')}
        subtitle={tTestimonials('subtitle')}
        items={testimonials}
        submitText={tTestimonials('submit')}
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
      />
    </main>
  );
}
