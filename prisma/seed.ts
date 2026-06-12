import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...\n');

  // 1. Create admin user
  const hashedPassword = await bcrypt.hash(process.env.ADMIN_PASSWORD || 'admin123', 12);
  await prisma.user.upsert({
    where: { email: process.env.ADMIN_EMAIL || 'admin@technicalvibe.com' },
    update: {},
    create: {
      email: process.env.ADMIN_EMAIL || 'admin@technicalvibe.com',
      hashedPassword,
      name: 'Admin',
      role: 'admin',
    },
  });
  console.log('✓ Admin user created');

  // 2. Seed services (from existing migrateServices.mjs)
  const services = [
    { icon: '🌐', titleEn: 'Web Development', titleAr: 'تطوير المواقع', descEn: 'Responsive web apps.', descAr: 'مواقع متجاوبة.' },
    { icon: '📱', titleEn: 'Mobile Apps', titleAr: 'تطبيقات الموبايل', descEn: 'iOS & Android.', descAr: 'أندرويد وأيفون.' },
    { icon: '🎨', titleEn: 'UI/UX', titleAr: 'التصميم', descEn: 'Beautiful interfaces.', descAr: 'واجهات جميلة.' },
    { icon: '⚙️', titleEn: 'Backend', titleAr: 'البرمجة الخلفية', descEn: 'Robust APIs.', descAr: 'أنظمة قوية.' },
    { icon: '💡', titleEn: 'Consulting', titleAr: 'الاستشارات', descEn: 'Expert advice.', descAr: 'استشارات خبيرة.' },
    { icon: '🛡️', titleEn: 'Maintenance', titleAr: 'الصيانة', descEn: '24/7 Support.', descAr: 'دعم فني.' },
  ];

  for (let i = 0; i < services.length; i++) {
    await prisma.serviceItem.upsert({
      where: { id: `service-${i + 1}` },
      update: {},
      create: { id: `service-${i + 1}`, ...services[i], order: i + 1 },
    });
  }
  console.log('✓ Services seeded');

  // 3. Seed default site content
  await prisma.siteContent.upsert({
    where: { id: 'hero' },
    update: {},
    create: {
      id: 'hero',
      hero: {
        title: 'Welcome to',
        titleAr: 'مرحباً بكم في',
        subtitle: 'We craft cutting-edge digital experiences — from stunning websites to powerful mobile applications. Your vision, our code.',
        subtitleAr: 'نصنع تجارب رقمية متطورة — من مواقع مذهلة إلى تطبيقات موبايل قوية. رؤيتك، كودنا.',
        cta: 'Explore Our Work',
        ctaAr: 'استكشف أعمالنا',
        ctaSecondary: 'Get In Touch',
        ctaSecondaryAr: 'تواصل معنا',
      },
    },
  });

  await prisma.siteContent.upsert({
    where: { id: 'about' },
    update: {},
    create: {
      id: 'about',
      about: {
        badge: 'Who We Are',
        badgeAr: 'من نحن',
        title: 'Building the Future, One Line of Code at a Time',
        titleAr: 'نبني المستقبل، سطر كود في كل مرة',
        description: 'Technical Vibe is a passionate software development company dedicated to transforming ideas into powerful digital solutions.',
        descriptionAr: 'تيكنيكال فايب شركة تطوير شغوفة مكرسة لتحويل الأفكار إلى حلول رقمية قوية.',
        description2: 'With a team of skilled developers and designers, we combine creativity with technical expertise.',
        description2Ar: 'مع فريق من المطورين والمصممين المهرة، نجمع بين الإبداع والخبرة التقنية.',
      },
    },
  });

  await prisma.siteContent.upsert({
    where: { id: 'services' },
    update: {},
    create: {
      id: 'services',
      services: {
        badge: 'What We Do',
        badgeAr: 'ما نفعله',
        title: 'Our Services',
        titleAr: 'خدماتنا',
        subtitle: 'We offer a comprehensive range of software development services.',
        subtitleAr: 'نقدم مجموعة شاملة من خدمات تطوير البرمجيات.',
      },
    },
  });

  await prisma.siteContent.upsert({
    where: { id: 'contact' },
    update: {},
    create: {
      id: 'contact',
      contact: {
        badge: 'Get In Touch',
        badgeAr: 'تواصل معنا',
        title: "Let's Build Something Amazing Together",
        titleAr: 'لنبني شيئاً مذهلاً معاً',
        subtitle: 'Have a project in mind? We would love to hear about it.',
        subtitleAr: 'هل لديك مشروع في ذهنك؟ نحب أن نسمع عنه.',
      },
    },
  });

  await prisma.siteContent.upsert({
    where: { id: 'footer' },
    update: {},
    create: {
      id: 'footer',
      footer: {
        description: 'Transforming ideas into powerful digital solutions.',
        descriptionAr: 'تحويل الأفكار إلى حلول رقمية قوية.',
        rights: 'All rights reserved.',
        rightsAr: 'جميع الحقوق محفوظة.',
      },
    },
  });
  console.log('✓ Site content seeded');

  // 4. Seed default site settings
  await prisma.siteSettings.upsert({
    where: { id: 'general' },
    update: {},
    create: {
      id: 'general',
      general: {
        phone: '+20 123 456 7890',
        email: 'info@technicalvibe.com',
        location: 'Cairo, Egypt',
        locationValue: 'Cairo, Egypt',
        siteNameEn: 'Technical Vibe',
        siteNameAr: 'تيكنيكال فايب',
      },
      stats: {
        yearsExp: 5,
        projects: 120,
        clients: 80,
        technologies: 30,
      },
      socials: {
        facebook: '',
        linkedin: '',
        github: '',
        instagram: '',
        whatsapp: '',
      },
    },
  });
  console.log('✓ Site settings seeded');

  console.log('\nSeeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
