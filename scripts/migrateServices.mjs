import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc } from "firebase/firestore";
import * as dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const services = [
  { icon: '🌐', titleEn: 'Web Development', titleAr: 'تطوير المواقع', descEn: 'Responsive web apps.', descAr: 'مواقع متجاوبة.' },
  { icon: '📱', titleEn: 'Mobile Apps', titleAr: 'تطبيقات الموبايل', descEn: 'iOS & Android.', descAr: 'أندرويد وأيفون.' },
  { icon: '🎨', titleEn: 'UI/UX', titleAr: 'التصميم', descEn: 'Beautiful interfaces.', descAr: 'واجهات جميلة.' },
  { icon: '⚙️', titleEn: 'Backend', titleAr: 'البرمجة الخلفية', descEn: 'Robust APIs.', descAr: 'أنظمة قوية.' },
  { icon: '💡', titleEn: 'Consulting', titleAr: 'الاستشارات', descEn: 'Expert advice.', descAr: 'استشارات خبيرة.' },
  { icon: '🛡️', titleEn: 'Maintenance', titleAr: 'الصيانة', descEn: '24/7 Support.', descAr: 'دعم فني.' }
];

async function migrate() {
  for (const s of services) {
    const ref = doc(collection(db, 'services'));
    await setDoc(ref, { ...s, order: Date.now() });
    console.log(`Migrated: ${s.titleEn}`);
  }
}

migrate();
