import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore, collection, getDocs, doc, setDoc, deleteDoc, updateDoc, serverTimestamp } from "firebase/firestore";

// ... existing code ...

export async function updateSiteContent(section: string, data: any) {
  try {
    const app = getServerApp();
    if (!app) return false;
    const db = getFirestore(app);
    await setDoc(doc(db, 'siteContent', section), data, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating site content:', error);
    return false;
  }
}

export async function updateSiteSettings(section: string, data: any) {
  try {
    const app = getServerApp();
    if (!app) return false;
    const db = getFirestore(app);
    await setDoc(doc(db, 'siteSettings', section), data, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating site settings:', error);
    return false;
  }
}

export async function submitMessage(data: { name: string, email: string, message: string }) {
  try {
    const app = getServerApp();
    if (!app) return false;
    const db = getFirestore(app);
    const newMessageRef = doc(collection(db, 'messages'));
    await setDoc(newMessageRef, {
      ...data,
      createdAt: serverTimestamp(),
      read: false
    });
    return true;
  } catch (error) {
    console.error('Error submitting message:', error);
    return false;
  }
}

export async function toggleMessageRead(messageId: string, read: boolean) {
  try {
    const app = getServerApp();
    if (!app) return false;
    const db = getFirestore(app);
    await updateDoc(doc(db, 'messages', messageId), { read });
    return true;
  } catch (error) {
    console.error('Error toggling message read status:', error);
    return false;
  }
}

export async function deleteMessage(messageId: string) {
  try {
    const app = getServerApp();
    if (!app) return false;
    const db = getFirestore(app);
    await deleteDoc(doc(db, 'messages', messageId));
    return true;
  } catch (error) {
    console.error('Error deleting message:', error);
    return false;
  }
}

// Separate Firebase instance for server-side fetching
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getServerApp() {
  const appName = 'server-app';
  const existing = getApps().find(a => a.name === appName);
  if (existing) return existing;
  if (!firebaseConfig.apiKey) return null;
  return initializeApp(firebaseConfig, appName);
}

export interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  link: string;
  tags: string[];
  order?: number;
}

export interface Testimonial {
  id: string;
  name: string;
  message: string;
  rating: number;
  createdAt: any;
}

export interface ServiceItem {
  id: string;
  icon: string;
  titleEn: string;
  titleAr: string;
  descEn: string;
  descAr: string;
  order?: number;
}

export interface SiteContent {
  hero: { title: string; subtitle: string; cta: string; ctaSecondary: string };
  about: { badge: string; title: string; description: string; description2: string };
  services: { badge: string; title: string; subtitle: string };
  contact: { badge: string; title: string; subtitle: string };
  footer: { description: string; rights: string };
}

export interface SiteSettings {
  general: { phone: string; email: string; location: string; locationValue: string };
  stats: { yearsExp: number; projects: number; clients: number; technologies: number };
  socials: { facebook: string; linkedin: string; github: string };
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: any;
  read: boolean;
}

export async function getPortfolioItems(): Promise<PortfolioItem[]> {
  try {
    const app = getServerApp();
    if (!app) return [];

    const db = getFirestore(app);
    const snapshot = await getDocs(collection(db, 'portfolio'));
    const items: PortfolioItem[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      title: doc.data().title || '',
      description: doc.data().description || '',
      imageUrl: doc.data().imageUrl || '',
      link: doc.data().link || '',
      tags: doc.data().tags || [],
      order: doc.data().order ?? 999,
    }));
    // Sort by order ASC
    return items.sort((a, b) => (a.order || 999) - (b.order || 999));
  } catch (error) {
    console.error('Error fetching portfolio items:', error);
    return [];
  }
}

export async function getSiteContent(): Promise<SiteContent | null> {
  try {
    const app = getServerApp();
    if (!app) return null;
    const db = getFirestore(app);
    const snapshot = await getDocs(collection(db, 'siteContent'));
    const content: any = {};
    snapshot.docs.forEach(doc => {
      content[doc.id] = doc.data();
    });
    return content as SiteContent;
  } catch (error) {
    console.error('Error fetching site content:', error);
    return null;
  }
}

export async function getSiteSettings(): Promise<SiteSettings | null> {
  try {
    const app = getServerApp();
    if (!app) return null;
    const db = getFirestore(app);
    const snapshot = await getDocs(collection(db, 'siteSettings'));
    const settings: any = {};
    snapshot.docs.forEach(doc => {
      settings[doc.id] = doc.data();
    });
    return settings as SiteSettings;
  } catch (error) {
    console.error('Error fetching site settings:', error);
    return null;
  }
}

export async function getMessages(): Promise<ContactMessage[]> {
  try {
    const app = getServerApp();
    if (!app) return [];
    const db = getFirestore(app);
    const snapshot = await getDocs(collection(db, 'messages'));
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ContactMessage[];
    // Sort by date descending
    return items.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return [];
  }
}

export async function getTestimonials(): Promise<Testimonial[]> {
  try {
    const app = getServerApp();
    if (!app) return [];
    const db = getFirestore(app);
    const snapshot = await getDocs(collection(db, 'testimonials'));
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Testimonial[];
    return items.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
}

export async function deleteTestimonial(id: string) {
  try {
    const app = getServerApp();
    if (!app) return false;
    const db = getFirestore(app);
    await deleteDoc(doc(db, 'testimonials', id));
    return true;
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    return false;
  }
}

export async function submitTestimonial(data: {name: string, message: string, rating: number}) {
  try {
    const app = getServerApp();
    if (!app) return false;
    const db = getFirestore(app);
    const newRef = doc(collection(db, 'testimonials'));
    await setDoc(newRef, {
      ...data,
      createdAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error submitting testimonial:', error);
    return false;
  }
}

export async function getServiceItems(): Promise<ServiceItem[]> {
  try {
    const app = getServerApp();
    if (!app) return [];
    const db = getFirestore(app);
    const snapshot = await getDocs(collection(db, 'services'));
    const items = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as ServiceItem[];
    return items.sort((a, b) => (a.order || 999) - (b.order || 999));
  } catch (error) {
    console.error('Error fetching services:', error);
    return [];
  }
}

export async function updateServiceItem(id: string, data: any) {
  try {
    const app = getServerApp();
    if (!app) return false;
    const db = getFirestore(app);
    await setDoc(doc(db, 'services', id), data, { merge: true });
    return true;
  } catch (error) {
    console.error('Error updating service:', error);
    return false;
  }
}

export async function addServiceItem(data: any) {
  try {
    const app = getServerApp();
    if (!app) return false;
    const db = getFirestore(app);
    const newRef = doc(collection(db, 'services'));
    await setDoc(newRef, {
      ...data,
      order: data.order || Date.now()
    });
    return true;
  } catch (error) {
    console.error('Error adding service:', error);
    return false;
  }
}

export async function deleteServiceItem(id: string) {
  try {
    const app = getServerApp();
    if (!app) return false;
    const db = getFirestore(app);
    await deleteDoc(doc(db, 'services', id));
    return true;
  } catch (error) {
    console.error('Error deleting service:', error);
    return false;
  }
}

