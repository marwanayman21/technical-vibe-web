'use client';

import {useEffect, useState} from 'react';
import {onAuthStateChanged, signOut, User} from 'firebase/auth';
import {auth, db, isFirebaseInitialized} from '@/lib/firebase';
import {collection, addDoc, getDocs, deleteDoc, doc, updateDoc} from 'firebase/firestore';
import {
  getSiteContent,
  getSiteSettings,
  getMessages,
  updateSiteContent,
  updateSiteSettings,
  toggleMessageRead,
  deleteMessage,
  getTestimonials,
  deleteTestimonial,
  getServiceItems,
  addServiceItem,
  updateServiceItem,
  deleteServiceItem,
  PortfolioItem,
  ServiceItem,
  SiteContent,
  SiteSettings,
  ContactMessage,
  Testimonial
} from '@/lib/firestore';

import {useRouter} from 'next/navigation';
import styles from './dashboard.module.css';

export default function AdminDashboard() {
  const router = useRouter();
  const [, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'portfolio' | 'pages' | 'settings' | 'messages' | 'reviews'>('portfolio');
  
  // Portfolio state
  const [projects, setProjects] = useState<PortfolioItem[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState({
    title: '', 
    titleAr: '', 
    description: '', 
    descriptionAr: '', 
    link: '', 
    tags: '', 
    imageUrl: '', 
    galleryImages: [] as string[],
    order: 0
  });
  const [uploading, setUploading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Pages & Settings state
  const [content, setContent] = useState<SiteContent | null>(null);
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([]);
  const [saving, setSaving] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<ContactMessage | null>(null);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [serviceForm, setServiceForm] = useState({icon: '', titleEn: '', titleAr: '', descEn: '', descAr: ''});
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u) {
        // Only fetch if we transitioning from no user
        setUser(u);
        fetchAllData();
      } else {
        router.push('/admin/login');
      }
      setLoading(false);
    });
    return () => unsub();
  }, []); // router is stable, auth state change is our trigger

  const fetchAllData = async () => {
    await Promise.all([
      fetchProjects(),
      fetchContent(),
      fetchSettings(),
      fetchMessages(),
      fetchTestimonials(),
      fetchServices()
    ]);
  };

  const fetchProjects = async () => {
    if (!db) return;
    try {
      const snap = await getDocs(collection(db, 'portfolio'));
      const items: PortfolioItem[] = snap.docs.map((d) => ({
        id: d.id,
        ...d.data(),
      })) as PortfolioItem[];
      setProjects(items);
    } catch (err) {
      console.error('Error fetching projects:', err);
    }
  };

  const fetchContent = async () => {
    const data = await getSiteContent();
    if (data) setContent(data);
  };

  const fetchSettings = async () => {
    const data = await getSiteSettings();
    if (data) setSettings(data);
  };

  const fetchMessages = async () => {
    const data = await getMessages();
    setMessages(data);
  };

  const fetchTestimonials = async () => {
    const data = await getTestimonials();
    setTestimonials(data);
  };

  const handleDeleteTestimonial = async (id: string) => {
    if (!confirm('Delete this testimonial?')) return;
    const success = await deleteTestimonial(id);
    if (success) fetchTestimonials();
  };

  const fetchServices = async () => {
    const data = await getServiceItems();
    setServiceItems(data);
  };

  const handleDeleteService = async (id: string) => {
    if (!confirm('Delete this service?')) return;
    const success = await deleteServiceItem(id);
    if (success) fetchServices();
  };

  const handleServiceSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
    if (editingServiceId) {
      await updateServiceItem(editingServiceId, serviceForm);
    } else {
      await addServiceItem(serviceForm);
    }
    setSaving(false);
    setShowServiceForm(false);
    setEditingServiceId(null);
    setServiceForm({icon: '', titleEn: '', titleAr: '', descEn: '', descAr: ''});
    fetchServices();
  };

  const handlePortfolioSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!db) return;

    const data = {
      title: form.title,
      titleAr: form.titleAr,
      description: form.description,
      descriptionAr: form.descriptionAr,
      link: form.link,
      imageUrl: form.imageUrl,
      galleryImages: form.galleryImages,
      tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean),
      order: Number(form.order) || 0,
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, 'portfolio', editingId), data);
      } else {
        await addDoc(collection(db, 'portfolio'), data);
      }
      setForm({title: '', titleAr: '', description: '', descriptionAr: '', link: '', tags: '', imageUrl: '', galleryImages: [], order: 0});
      setShowForm(false);
      setEditingId(null);
      fetchProjects();
    } catch (err) {
      console.error('Error saving:', err);
    }
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        throw new Error('Upload failed');
      }

      const data = await res.json();
      setUploading(false);
      return data.url;
    } catch (err) {
      console.error('Upload error:', err);
      setUploading(false);
      return '';
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const url = await handleImageUpload(file);
    if (url) {
      setForm(prev => ({
        ...prev,
        galleryImages: [...prev.galleryImages, url]
      }));
    }
    setUploading(false);
  };

  const removeGalleryImage = (index: number) => {
    setForm(prev => ({
      ...prev,
      galleryImages: prev.galleryImages.filter((_, i) => i !== index)
    }));
  };

  const handleDelete = async (id: string) => {
    if (!db) return;
    if (!confirm('Are you sure you want to delete this project?')) return;
    try {
      await deleteDoc(doc(db, 'portfolio', id));
      fetchProjects();
    } catch (err) {
      console.error('Error deleting:', err);
    }
  };

  const handleEdit = (item: PortfolioItem) => {
    setForm({
      title: item.title,
      titleAr: item.titleAr || '',
      description: item.description,
      descriptionAr: item.descriptionAr || '',
      link: item.link,
      tags: item.tags.join(', '),
      imageUrl: item.imageUrl,
      galleryImages: item.galleryImages || [],
      order: item.order || 0,
    });
    setEditingId(item.id);
    setShowForm(true);
  };

  const handleSaveContent = async (section: string, data: any) => {
    setSaving(true);
    const success = await updateSiteContent(section, data);
    if (success) fetchContent();
    setSaving(false);
  };

  const handleSaveSettings = async (section: string, data: any) => {
    setSaving(true);
    const success = await updateSiteSettings(section, data);
    if (success) fetchSettings();
    setSaving(false);
  };

  const handleToggleRead = async (id: string, read: boolean) => {
    const success = await toggleMessageRead(id, read);
    if (success) fetchMessages();
  };

  const handleDeleteMessage = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    const success = await deleteMessage(id);
    if (success) {
      fetchMessages();
      setSelectedMessage(null);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
    router.push('/admin/login');
  };

  if (loading) {
    return (
      <div className={styles.loadingPage}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!isFirebaseInitialized()) {
    return (
      <div className={styles.page}>
        <div className={styles.noFirebase}>
          <h2>⚠️ Firebase Not Configured</h2>
          <p>Please add your Firebase credentials to the <code>.env.local</code> file to enable the admin panel.</p>
          <div className={styles.codeHint}>
            <pre>{`NEXT_PUBLIC_FIREBASE_API_KEY="your-key"
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-domain"
NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-bucket"
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"`}</pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Sidebar */}
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
        <div className={styles.sidebarLogo}>
          <button className={styles.sidebarLogo} onClick={() => setIsSidebarOpen(false)}>
            {settings?.general?.logoUrl ? (
              <img src={settings.general.logoUrl} alt="Logo" className={styles.logoImg} />
            ) : (
              <div className={styles.logoPlaceholder} /> // Clean state instead of 'VIBE' if settings not loaded
            )}
            <span className={styles.brandName}>
              {settings?.general?.siteNameEn || ''}
            </span>
          </button>
        </div>
        <nav className={styles.sidebarNav}>
          <button 
            className={`${styles.sidebarLink} ${activeTab === 'portfolio' ? styles.active : ''}`}
            onClick={() => { setActiveTab('portfolio'); setIsSidebarOpen(false); setShowDetail(false); }}
          >
            📁 Portfolio
          </button>
          <button 
            className={`${styles.sidebarLink} ${activeTab === 'pages' ? styles.active : ''}`}
            onClick={() => { setActiveTab('pages'); setIsSidebarOpen(false); setShowDetail(false); }}
          >
            📄 Pages
          </button>
          <button 
            className={`${styles.sidebarLink} ${activeTab === 'settings' ? styles.active : ''}`}
            onClick={() => { setActiveTab('settings'); setIsSidebarOpen(false); setShowDetail(false); }}
          >
            ⚙️ Settings
          </button>
          <button 
            className={`${styles.sidebarLink} ${activeTab === 'messages' ? styles.active : ''}`}
            onClick={() => { setActiveTab('messages'); setIsSidebarOpen(false); setShowDetail(false); }}
          >
            📩 Messages
            {messages.some(m => !m.read) && (
              <span className={styles.msgBadge}>{messages.filter(m => !m.read).length}</span>
            )}
          </button>
          <button 
            className={`${styles.sidebarLink} ${activeTab === 'reviews' ? styles.active : ''}`}
            onClick={() => { setActiveTab('reviews'); setIsSidebarOpen(false); setShowDetail(false); }}
          >
            ⭐ Reviews
          </button>
        </nav>
        <button onClick={() => { handleLogout(); setIsSidebarOpen(false); }} className={styles.logoutBtn}>
          🚪 Logout
        </button>
      </aside>

      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && (
        <div className={styles.sidebarOverlay} onClick={() => setIsSidebarOpen(false)} />
      )}

      {/* Main Content */}
      <main className={styles.main}>
        <div className={styles.topBar}>
          <div style={{display: 'flex', alignItems: 'center'}}>
            <button 
              className={styles.mobileMenuBtn}
              onClick={() => setIsSidebarOpen(true)}
            >
              ☰
            </button>
            <div>
              <h1 className={styles.pageTitle}>
                {activeTab === 'portfolio' && 'Portfolio Projects'}
                {activeTab === 'pages' && 'Page Content'}
                {activeTab === 'settings' && 'Site Settings'}
                {activeTab === 'messages' && 'Messages & Inquiries'}
                {activeTab === 'reviews' && 'Client Reviews'}
              </h1>
              <p className={styles.pageSubtitle}>
                {activeTab === 'portfolio' && 'Manage your portfolio items and case studies'}
                {activeTab === 'pages' && 'Update sections, headings and descriptions'}
                {activeTab === 'settings' && 'General site information and socials'}
                {activeTab === 'messages' && 'View and respond to client messages'}
                {activeTab === 'reviews' && 'Moderate and manage client testimonials'}
              </p>
            </div>
          </div>
        </div>

        {/* Portfolio Tab */}
        {activeTab === 'portfolio' && (
          <>
            <div className={styles.tabActions}>
              <button
                className={styles.addBtn}
                onClick={() => {
                  setForm({title: '', titleAr: '', description: '', descriptionAr: '', link: '', tags: '', imageUrl: '', galleryImages: [], order: (projects.at(-1)?.order || 0) + 1});
                  setEditingId(null);
                  setShowForm(true);
                }}
              >
                + Add Project
              </button>
            </div>

            {/* Form Modal */}
            {showForm && (
              <div className={styles.modal}>
                <div className={styles.modalContent}>
                  <div className={styles.modalHeader}>
                    <h2>{editingId ? 'Edit Project' : 'Add New Project'}</h2>
                    <button className={styles.closeBtn} onClick={() => setShowForm(false)}>✕</button>
                  </div>
                    <form onSubmit={handlePortfolioSubmit} className={styles.form}>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="projectTitleEn">Project Title (English)</label>
                      <input
                        id="projectTitleEn"
                        type="text"
                        value={form.title}
                        onChange={(e) => setForm({...form, title: e.target.value})}
                        className={styles.input}
                        placeholder="Enter project name"
                        required
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="projectTitleAr">Project Title (Arabic)</label>
                      <input
                        id="projectTitleAr"
                        type="text"
                        value={form.titleAr}
                        onChange={(e) => setForm({...form, titleAr: e.target.value})}
                        className={styles.input}
                        placeholder="اسم المشروع"
                        dir="rtl"
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="projectOrder">Display Order</label>
                      <input
                        id="projectOrder"
                        type="number"
                        value={form.order || 0}
                        onChange={(e) => setForm({...form, order: Number.parseInt(e.target.value) || 0})}
                        className={styles.input}
                        placeholder="1, 2, 3..."
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="projectDescEn">Description (English)</label>
                      <textarea
                        id="projectDescEn"
                        value={form.description}
                        onChange={(e) => setForm({...form, description: e.target.value})}
                        className={styles.textarea}
                        placeholder="Describe the project..."
                        rows={3}
                        required
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="projectDescAr">Description (Arabic)</label>
                      <textarea
                        id="projectDescAr"
                        value={form.descriptionAr}
                        onChange={(e) => setForm({...form, descriptionAr: e.target.value})}
                        className={styles.textarea}
                        placeholder="وصف المشروع..."
                        rows={3}
                        dir="rtl"
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="projectLink">Project Link</label>
                      <input
                        id="projectLink"
                        type="url"
                        value={form.link}
                        onChange={(e) => setForm({...form, link: e.target.value})}
                        className={styles.input}
                        placeholder="https://example.com"
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="projectTags">Tags (comma separated)</label>
                      <input
                        id="projectTags"
                        type="text"
                        value={form.tags}
                        onChange={(e) => setForm({...form, tags: e.target.value})}
                        className={styles.input}
                        placeholder="React, Next.js, Firebase"
                      />
                    </div>
                    <div className={styles.field}>
                      <label className={styles.label} htmlFor="projectImage">Project Image</label>
                      <input
                        id="projectImage"
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            setUploading(true);
                            const url = await handleImageUpload(file);
                            if (url) setForm({...form, imageUrl: url});
                            setUploading(false);
                          }
                        }}
                        className={styles.fileInput}
                      />
                      {uploading && <span className={styles.uploadingText}>Uploading...</span>}
                      {form.imageUrl && <img src={form.imageUrl} alt="Preview" className={styles.preview} />}
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label}>Gallery Images</label>
                      <div className={styles.galleryUploadGrid}>
                        {form.galleryImages.map((img, i) => (
                          <div key={i} className={styles.galleryPreviewItem}>
                            <img src={img} alt={`Gallery ${i}`} className={styles.galleryPreviewImg} />
                            <button 
                              type="button" 
                              className={styles.removeImgBtn}
                              onClick={() => removeGalleryImage(i)}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                        <label className={styles.galleryAddBtn}>
                          +
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleGalleryUpload} 
                            style={{display: 'none'}} 
                          />
                        </label>
                      </div>
                    </div>

                    <div className={styles.formActions}>
                      <button type="button" className={styles.cancelBtn} onClick={() => setShowForm(false)}>
                        Cancel
                      </button>
                      <button type="submit" className={styles.submitBtn}>
                        {editingId ? 'Save Changes' : 'Add Project'}
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

            {/* Projects Grid */}
            <div className={styles.projectsGrid}>
              {projects.length === 0 ? (
                <div className={styles.empty}>
                  <p>No projects yet. Click "Add Project" to create your first one!</p>
                </div>
              ) : (
                projects.map((item) => (
                  <div key={item.id} className={styles.projectCard}>
                    <div className={styles.projectImage}>
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.title} />
                      ) : (
                        <div className={styles.projectPlaceholder}>📁</div>
                      )}
                    </div>
                    <div className={styles.projectBody}>
                      <div className={styles.projectCardHeader}>
                        <h3 className={styles.projectTitle}>{item.title}</h3>
                        <span className={styles.orderBadge}>#{item.order || 0}</span>
                      </div>
                      <p className={styles.projectDesc}>{item.description}</p>
                      <div className={styles.projectTags}>
                        {item.tags?.map((tag) => (
                          <span key={tag} className={styles.projectTag}>{tag}</span>
                        ))}
                      </div>
                      <div className={styles.projectActions}>
                        <button onClick={() => handleEdit(item)} className={styles.editBtn}>✏️ Edit</button>
                        <button onClick={() => handleDelete(item.id)} className={styles.deleteBtn}>🗑️ Delete</button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}

        {/* Pages Tab */}
        {activeTab === 'pages' && (
          <div className={styles.tabContent}>
            <div className={styles.shortcutBar}>
              <button onClick={() => setActiveTab('reviews')} className={styles.shortcutBtn}>
                ⭐ Moderate Reviews & Opinions
              </button>
            </div>

            <div className={styles.topBar}>
              <div>
                <h1 className={styles.pageTitle}>Page Content</h1>
                <p className={styles.pageSubtitle}>Manage text, services, and sections of your website</p>
              </div>
            </div>

            <div className={styles.editorGrid}>
              <div className={styles.editorCard}>
                <h3 className={styles.editorTitle}>Hero Section</h3>
                <div className={styles.formGroup}>
                  <label htmlFor="heroTitleEn">Title (English)</label>
                  <input 
                    id="heroTitleEn"
                    defaultValue={content?.hero?.title}
                    onBlur={(e) => handleSaveContent('hero', { ...content?.hero, title: e.target.value })}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="heroTitleAr">Title (Arabic)</label>
                  <input 
                    id="heroTitleAr"
                    defaultValue={content?.hero?.titleAr}
                    onBlur={(e) => handleSaveContent('hero', { ...content?.hero, titleAr: e.target.value })}
                    className={styles.input}
                    dir="rtl"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="heroSubtitleEn">Subtitle (English)</label>
                  <textarea 
                    id="heroSubtitleEn"
                    defaultValue={content?.hero?.subtitle || ''}
                    onBlur={(e) => handleSaveContent('hero', { ...content?.hero, subtitle: e.target.value })}
                    className={styles.textarea}
                    rows={3}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="heroSubtitleAr">Subtitle (Arabic)</label>
                  <textarea 
                    id="heroSubtitleAr"
                    defaultValue={content?.hero?.subtitleAr || ''}
                    onBlur={(e) => handleSaveContent('hero', { ...content?.hero, subtitleAr: e.target.value })}
                    className={styles.textarea}
                    rows={3}
                    dir="rtl"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="heroCtaEn">CTA Button (English)</label>
                  <input 
                    id="heroCtaEn"
                    defaultValue={content?.hero?.cta || ''}
                    onBlur={(e) => handleSaveContent('hero', { ...content?.hero, cta: e.target.value })}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="heroCtaAr">CTA Button (Arabic)</label>
                  <input 
                    id="heroCtaAr"
                    defaultValue={content?.hero?.ctaAr || ''}
                    onBlur={(e) => handleSaveContent('hero', { ...content?.hero, ctaAr: e.target.value })}
                    className={styles.input}
                    dir="rtl"
                  />
                </div>
              </div>

              <div className={styles.editorCard}>
                <h3 className={styles.editorTitle}>About Section</h3>
                <div className={styles.formGroup}>
                  <label htmlFor="aboutBadgeEn">Badge (English)</label>
                  <input 
                    id="aboutBadgeEn"
                    defaultValue={content?.about?.badge}
                    onBlur={(e) => handleSaveContent('about', { ...content?.about, badge: e.target.value })}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="aboutBadgeAr">Badge (Arabic)</label>
                  <input 
                    id="aboutBadgeAr"
                    defaultValue={content?.about?.badgeAr}
                    onBlur={(e) => handleSaveContent('about', { ...content?.about, badgeAr: e.target.value })}
                    className={styles.input}
                    dir="rtl"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="aboutTitleEn">Title (English)</label>
                  <input 
                    id="aboutTitleEn"
                    defaultValue={content?.about?.title}
                    onBlur={(e) => handleSaveContent('about', { ...content?.about, title: e.target.value })}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="aboutTitleAr">Title (Arabic)</label>
                  <input 
                    id="aboutTitleAr"
                    defaultValue={content?.about?.titleAr}
                    onBlur={(e) => handleSaveContent('about', { ...content?.about, titleAr: e.target.value })}
                    className={styles.input}
                    dir="rtl"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="aboutDesc1En">Description 1 (English)</label>
                  <textarea 
                    id="aboutDesc1En"
                    defaultValue={content?.about?.description}
                    onBlur={(e) => handleSaveContent('about', { ...content?.about, description: e.target.value })}
                    className={styles.textarea}
                    rows={3}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="aboutDesc1Ar">Description 1 (Arabic)</label>
                  <textarea 
                    id="aboutDesc1Ar"
                    defaultValue={content?.about?.descriptionAr}
                    onBlur={(e) => handleSaveContent('about', { ...content?.about, descriptionAr: e.target.value })}
                    className={styles.textarea}
                    rows={3}
                    dir="rtl"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="aboutDesc2En">Description 2 (English)</label>
                  <textarea 
                    id="aboutDesc2En"
                    defaultValue={content?.about?.description2}
                    onBlur={(e) => handleSaveContent('about', { ...content?.about, description2: e.target.value })}
                    className={styles.textarea}
                    rows={3}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="aboutDesc2Ar">Description 2 (Arabic)</label>
                  <textarea 
                    id="aboutDesc2Ar"
                    defaultValue={content?.about?.description2Ar}
                    onBlur={(e) => handleSaveContent('about', { ...content?.about, description2Ar: e.target.value })}
                    className={styles.textarea}
                    rows={3}
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Services Header */}
              <div className={styles.editorCard}>
                <h3 className={styles.editorTitle}>Services Section (Header)</h3>
                <div className={styles.formGroup}>
                  <label htmlFor="servicesBadgeEn">Section Badge (English)</label>
                  <input 
                    id="servicesBadgeEn"
                    defaultValue={content?.services?.badge || ''}
                    onBlur={(e) => handleSaveContent('services', { ...content?.services, badge: e.target.value })}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="servicesBadgeAr">Section Badge (Arabic)</label>
                  <input 
                    id="servicesBadgeAr"
                    defaultValue={content?.services?.badgeAr || ''}
                    onBlur={(e) => handleSaveContent('services', { ...content?.services, badgeAr: e.target.value })}
                    className={styles.input}
                    dir="rtl"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="servicesTitleEn">Section Title (English)</label>
                  <input 
                    id="servicesTitleEn"
                    defaultValue={content?.services?.title || ''}
                    onBlur={(e) => handleSaveContent('services', { ...content?.services, title: e.target.value })}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="servicesTitleAr">Section Title (Arabic)</label>
                  <input 
                    id="servicesTitleAr"
                    defaultValue={content?.services?.titleAr || ''}
                    onBlur={(e) => handleSaveContent('services', { ...content?.services, titleAr: e.target.value })}
                    className={styles.input}
                    dir="rtl"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="servicesSubtitleEn">Section Subtitle (English)</label>
                  <textarea 
                    id="servicesSubtitleEn"
                    defaultValue={content?.services?.subtitle || ''}
                    onBlur={(e) => handleSaveContent('services', { ...content?.services, subtitle: e.target.value })}
                    className={styles.textarea}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="servicesSubtitleAr">Section Subtitle (Arabic)</label>
                  <textarea 
                    id="servicesSubtitleAr"
                    defaultValue={content?.services?.subtitleAr || ''}
                    onBlur={(e) => handleSaveContent('services', { ...content?.services, subtitleAr: e.target.value })}
                    className={styles.textarea}
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Dynamic Services Management */}
              <div className={`${styles.editorCard} ${styles.fullWidth}`}>
                <div className={styles.flexHeader}>
                  <h3 className={styles.editorTitle}>Our Services List</h3>
                  <button 
                    onClick={() => {
                      setEditingServiceId(null);
                      setServiceForm({icon: '', titleEn: '', titleAr: '', descEn: '', descAr: ''});
                      setShowServiceForm(true);
                    }}
                    className={styles.addBtnSmall}
                  >
                    + Add New Service
                  </button>
                </div>
                
                <div className={styles.servicesManagementGrid}>
                  {serviceItems.map(item => (
                    <div key={item.id} className={styles.serviceItemCard}>
                      <span className={styles.serviceIconDisplay}>{item.icon}</span>
                      <div className={styles.serviceItemInfo}>
                        <h4>{item.titleEn} / {item.titleAr}</h4>
                        <p>{item.descEn}</p>
                      </div>
                      <div className={styles.serviceActions}>
                        <button onClick={() => {
                          setEditingServiceId(item.id);
                          setServiceForm({
                            icon: item.icon,
                            titleEn: item.titleEn,
                            titleAr: item.titleAr,
                            descEn: item.descEn,
                            descAr: item.descAr
                          });
                          setShowServiceForm(true);
                        }}>Edit</button>
                        <button onClick={() => handleDeleteService(item.id)} className={styles.deleteLink}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === 'settings' && (
          <div className={styles.tabContent}>
            <div className={styles.editorGrid}>
              <div className={styles.editorCard}>
                <h3 className={styles.editorTitle}>General Info</h3>
                <div className={styles.formGroup}>
                  <label htmlFor="settingsPhone">Phone</label>
                  <input 
                    id="settingsPhone"
                    defaultValue={settings?.general?.phone}
                    onBlur={(e) => handleSaveSettings('general', { ...settings?.general, phone: e.target.value })}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="settingsEmail">Email</label>
                  <input 
                    id="settingsEmail"
                    defaultValue={settings?.general?.email}
                    onBlur={(e) => handleSaveSettings('general', { ...settings?.general, email: e.target.value })}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="settingsLocation">Location</label>
                  <input 
                    id="settingsLocation"
                    defaultValue={settings?.general?.location}
                    onBlur={(e) => handleSaveSettings('general', { ...settings?.general, location: e.target.value })}
                    className={styles.input}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="siteNameEn">Site Name (English)</label>
                  <input 
                    id="siteNameEn"
                    defaultValue={settings?.general?.siteNameEn || ''}
                    onBlur={(e) => handleSaveSettings('general', { ...settings?.general, siteNameEn: e.target.value })}
                    className={styles.input}
                    placeholder="Technical Vibe"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="siteNameAr">Site Name (Arabic)</label>
                  <input 
                    id="siteNameAr"
                    defaultValue={settings?.general?.siteNameAr || ''}
                    onBlur={(e) => handleSaveSettings('general', { ...settings?.general, siteNameAr: e.target.value })}
                    className={styles.input}
                    placeholder="تيكنيكال فايب"
                    dir="rtl"
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Site Logo</label>
                  <div className={styles.uploadArea}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleImageUpload(file);
                          if (url) handleSaveSettings('general', { ...settings?.general, logoUrl: url });
                        }
                      }}
                      className={styles.fileInput}
                    />
                    {settings?.general?.logoUrl && <img src={settings?.general?.logoUrl} alt="Logo" style={{width: '50px', height: '50px', objectFit: 'contain', marginTop: '10px'}} />}
                  </div>
                </div>
                <div className={styles.formGroup}>
                  <label>Site Favicon</label>
                  <div className={styles.uploadArea}>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const url = await handleImageUpload(file);
                          if (url) handleSaveSettings('general', { ...settings?.general, faviconUrl: url });
                        }
                      }}
                      className={styles.fileInput}
                    />
                    {settings?.general?.faviconUrl && <img src={settings?.general?.faviconUrl} alt="Favicon" style={{width: '32px', height: '32px', objectFit: 'contain', marginTop: '10px'}} />}
                  </div>
                </div>
              </div>

              <div className={styles.editorCard}>
                <h3 className={styles.editorTitle}>Social Media</h3>
                <div className={styles.formGroup}>
                  <label htmlFor="socialFacebook">Facebook URL</label>
                  <input 
                    id="socialFacebook"
                    defaultValue={settings?.socials?.facebook}
                    onBlur={(e) => handleSaveSettings('socials', { ...settings?.socials, facebook: e.target.value })}
                    className={styles.input}
                    placeholder="https://facebook.com/..."
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="socialLinkedin">LinkedIn URL</label>
                  <input 
                    id="socialLinkedin"
                    defaultValue={settings?.socials?.linkedin}
                    onBlur={(e) => handleSaveSettings('socials', { ...settings?.socials, linkedin: e.target.value })}
                    className={styles.input}
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="socialInstagram">Instagram URL</label>
                  <input 
                    id="socialInstagram"
                    defaultValue={settings?.socials?.instagram}
                    onBlur={(e) => handleSaveSettings('socials', { ...settings?.socials, instagram: e.target.value })}
                    className={styles.input}
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="socialWhatsapp">WhatsApp Number</label>
                  <input 
                    id="socialWhatsapp"
                    defaultValue={settings?.socials?.whatsapp}
                    onBlur={(e) => handleSaveSettings('socials', { ...settings?.socials, whatsapp: e.target.value })}
                    className={styles.input}
                    placeholder="+201..."
                  />
                </div>
                <div className={styles.formGroup}>
                  <label htmlFor="socialGithub">GitHub URL</label>
                  <input 
                    id="socialGithub"
                    defaultValue={settings?.socials?.github}
                    onBlur={(e) => handleSaveSettings('socials', { ...settings?.socials, github: e.target.value })}
                    className={styles.input}
                    placeholder="https://github.com/..."
                  />
                </div>
              </div>

              <div className={styles.editorCard}>
                <h3 className={styles.editorTitle}>Stats</h3>
                <div className={styles.statsEditor}>
                  <div className={styles.formGroup}>
                    <label htmlFor="statYears">Years of Exp</label>
                    <input 
                      id="statYears"
                      type="number"
                      defaultValue={settings?.stats?.yearsExp ?? 0}
                      onBlur={(e) => handleSaveSettings('stats', { ...settings?.stats, yearsExp: Number.parseInt(e.target.value) || 0 })}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="statProjects">Projects Done</label>
                    <input 
                      id="statProjects"
                      type="number"
                      defaultValue={settings?.stats?.projects ?? 0}
                      onBlur={(e) => handleSaveSettings('stats', { ...settings?.stats, projects: Number.parseInt(e.target.value) || 0 })}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="statClients">Happy Clients</label>
                    <input 
                      id="statClients"
                      type="number"
                      defaultValue={settings?.stats?.clients ?? 0}
                      onBlur={(e) => handleSaveSettings('stats', { ...settings?.stats, clients: Number.parseInt(e.target.value) || 0 })}
                      className={styles.input}
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label htmlFor="statTechs">Technologies</label>
                    <input 
                      id="statTechs"
                      type="number"
                      defaultValue={settings?.stats?.technologies ?? 0}
                      onBlur={(e) => handleSaveSettings('stats', { ...settings?.stats, technologies: Number.parseInt(e.target.value) || 0 })}
                      className={styles.input}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === 'messages' && (
          <div className={`${styles.messagesContainer} ${showDetail ? styles.showDetail : ''}`}>
            <div className={styles.messagesList}>
              {messages.length === 0 ? (
                <div className={styles.empty}>No messages received yet.</div>
              ) : (
                messages.map(msg => (
                  <div 
                    key={msg.id} 
                    className={`${styles.msgItem} ${msg.read ? '' : styles.unread} ${selectedMessage?.id === msg.id ? styles.msgSelected : ''}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSelectedMessage(msg);
                        setShowDetail(true);
                        if (!msg.read) handleToggleRead(msg.id, true);
                      }
                    }}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedMessage(msg);
                      setShowDetail(true);
                      if (!msg.read) handleToggleRead(msg.id, true);
                    }}
                  >
                    <div className={styles.msgHead}>
                      <span className={styles.msgName}>{msg.name}</span>
                      <span className={styles.msgDate}>
                        {msg.createdAt ? new Date(msg.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                      </span>
                    </div>
                    <p className={styles.msgPreview}>{msg.message}</p>
                  </div>
                ))
              )}
            </div>

            <div className={styles.msgDetail}>
              {selectedMessage ? (
                <div className={styles.msgCard}>
                  <button className={styles.backBtn} onClick={() => setShowDetail(false)}>
                    ← Back to List
                  </button>
                  <div className={styles.msgCardHeader}>
                    <div>
                      <h2>{selectedMessage.name}</h2>
                      <p>{selectedMessage.email}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteMessage(selectedMessage.id)}
                      className={styles.msgDeleteBtn}
                    >
                      Delete
                    </button>
                  </div>
                  <div className={styles.msgBody}>
                    {selectedMessage.message}
                  </div>
                </div>
              ) : (
                <div className={styles.msgPlaceholder}>Select a message to read</div>
              )}
            </div>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className={styles.tabContent}>
            <div className={styles.reviewsGrid}>
              {testimonials.length === 0 ? (
                <div className={styles.empty}>No reviews yet.</div>
              ) : (
                testimonials.map(review => (
                  <div key={review.id} className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <div>
                        <h3>{review.name}</h3>
                        <div className={styles.ratingStars}>
                          {[...new Array(5)].map((_, i) => (
                            <span key={`${review.id}-star-${i}`} className={i < review.rating ? styles.starFilled : styles.starEmpty}>
                              ★
                            </span>
                          ))}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteTestimonial(review.id)}
                        className={styles.deleteIconBtn}
                      >
                        🗑️
                      </button>
                    </div>
                    <p className={styles.reviewMessage}>{review.message}</p>
                    <span className={styles.reviewDate}>
                      {review.createdAt ? new Date(review.createdAt.seconds * 1000).toLocaleDateString() : 'Just now'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </main>

      {/* Service Item Modal */}
      {showServiceForm && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <div className={styles.modalHeader}>
              <h2>{editingServiceId ? 'Edit Service' : 'Add New Service'}</h2>
              <button 
                onClick={() => {
                  setShowServiceForm(false);
                  setEditingServiceId(null);
                }} 
                className={styles.closeBtn}
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleServiceSubmit} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label} htmlFor="serviceIcon">Icon (Emoji or Text)</label>
                <input
                  id="serviceIcon"
                  type="text"
                  value={serviceForm.icon}
                  onChange={(e) => setServiceForm({...serviceForm, icon: e.target.value})}
                  className={styles.input}
                  placeholder="e.svg, 🚀, 🌐, ..."
                  required
                />
              </div>

              <div className={styles.grid2Col}>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="serviceTitleEn">Title (English)</label>
                  <input
                    id="serviceTitleEn"
                    type="text"
                    value={serviceForm.titleEn}
                    onChange={(e) => setServiceForm({...serviceForm, titleEn: e.target.value})}
                    className={styles.input}
                    required
                  />
                </div>
                <div className={styles.field}>
                  <label className={styles.label} htmlFor="serviceTitleAr">Title (Arabic)</label>
                  <input
                    id="serviceTitleAr"
                    type="text"
                    value={serviceForm.titleAr}
                    onChange={(e) => setServiceForm({...serviceForm, titleAr: e.target.value})}
                    className={styles.input}
                    required
                    dir="rtl"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="serviceDescEn">Description (English)</label>
                <textarea
                  id="serviceDescEn"
                  value={serviceForm.descEn}
                  onChange={(e) => setServiceForm({...serviceForm, descEn: e.target.value})}
                  className={styles.textarea}
                  rows={2}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label} htmlFor="serviceDescAr">Description (Arabic)</label>
                <textarea
                  id="serviceDescAr"
                  value={serviceForm.descAr}
                  onChange={(e) => setServiceForm({...serviceForm, descAr: e.target.value})}
                  className={styles.textarea}
                  rows={2}
                  required
                  dir="rtl"
                />
              </div>

              <div className={styles.formActions}>
                <button 
                  type="button" 
                  onClick={() => setShowServiceForm(false)} 
                  className={styles.cancelBtn}
                >
                  Cancel
                </button>
                <button type="submit" className={styles.submitBtn} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
