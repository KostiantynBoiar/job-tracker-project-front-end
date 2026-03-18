'use client';

import React, { useState, useEffect } from 'react';
import { Save, Loader2, Building, Briefcase, Bell, BellOff, Trash2, Plus, CheckCircle, Bookmark, AlertCircle } from 'lucide-react';
import { 
  getPreferences, updateAlerts, 
  addPreferredCompany, removePreferredCompany, 
  addKeyword, removeKeyword, 
  Preferences 
} from '../../src/api/preferences';
import { getCompanies, Company } from '../../src/api/companies';

interface WatchlistTemplate {
  id: string;
  name: string;
  companies: number[]; 
  keywords: string;    
  email_alerts: boolean;
}

export default function WatchlistPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  const [availableCompanies, setAvailableCompanies] = useState<Company[]>([]);
  const [watchlists, setWatchlists] = useState<WatchlistTemplate[]>([]);
  const [activeBackendPrefs, setActiveBackendPrefs] = useState<Preferences | null>(null);

  const [isCreating, setIsCreating] = useState(false);
  const [newPrefs, setNewPrefs] = useState<WatchlistTemplate>({
    id: '', name: '', companies: [], keywords: '', email_alerts: true,
  });

  useEffect(() => {
    const loadAllData = async () => {
      try {
        // 1. Load API Companies
        const companiesData = await getCompanies();
        setAvailableCompanies(companiesData);

        // 2. Load Active Backend Profile
        const rawData = await getPreferences();
        const backendData = Array.isArray(rawData) ? rawData[0] : rawData;
        if (backendData) setActiveBackendPrefs(backendData);

        // 3. Load Local Watchlists
        const savedLocal = localStorage.getItem('faang_watchlists');
        let parsedWatchlists: WatchlistTemplate[] = savedLocal ? JSON.parse(savedLocal) : [];

        if (parsedWatchlists.length === 0 && backendData) {
          const hasCompanies = backendData.preferred_companies && backendData.preferred_companies.length > 0;
          const hasKeywords = backendData.keywords && backendData.keywords.length > 0;
          
          if (hasCompanies || hasKeywords) {
            const restoredTemplate: WatchlistTemplate = {
              id: Date.now().toString(),
              name: 'My Active Watchlist', 
              companies: (backendData.preferred_companies || []).map((c: any) => c.id),
              keywords: (backendData.keywords || []).map((k: any) => k.keyword).join(', '), // Extracted string correctly
              email_alerts: backendData.notification_frequency !== 'none'
            };
            parsedWatchlists = [restoredTemplate];
            localStorage.setItem('faang_watchlists', JSON.stringify(parsedWatchlists));
          }
        }
        
        setWatchlists(parsedWatchlists);

      } catch (error) {
        console.error("Failed to load initial data.", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAllData();
  }, []);

  const updateLocalWatchlists = (newList: WatchlistTemplate[]) => {
    setWatchlists(newList);
    localStorage.setItem('faang_watchlists', JSON.stringify(newList));
  };

  const toggleCompany = (companyId: number) => {
    setNewPrefs(prev => {
      const current = Array.isArray(prev.companies) ? prev.companies : [];
      return {
        ...prev,
        companies: current.includes(companyId)
          ? current.filter(id => id !== companyId)
          : [...current, companyId]
      };
    });
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (watchlists.length >= 2) {
      setMessage({ text: 'You can only have a maximum of 2 watchlists.', type: 'error' });
      return;
    }

    const newTemplate = { ...newPrefs, id: Date.now().toString() };
    updateLocalWatchlists([...watchlists, newTemplate]);
    
    setIsCreating(false);
    setNewPrefs({ id: '', name: '', companies: [], keywords: '', email_alerts: true });
    setMessage({ text: 'Watchlist saved to your collection!', type: 'success' });
  };

  const handleActivate = async (template: WatchlistTemplate) => {
    setIsSaving(true);
    setMessage({ text: '', type: '' });

    try {
      // 1. Sync Email Alerts
      await updateAlerts(template.email_alerts ? 'daily' : 'none');

      // 2. Safely Remove Old Data
      if (activeBackendPrefs?.preferred_companies) {
        for (const c of activeBackendPrefs.preferred_companies) {
          await removePreferredCompany(c.id).catch(() => {}); 
        }
      }
      if (activeBackendPrefs?.keywords) {
        for (const k of activeBackendPrefs.keywords) {
          await removeKeyword(k.id).catch(() => {});
        }
      }

      // 3. Add New Template Data to Backend
      for (const compId of template.companies) {
        await addPreferredCompany(compId).catch(() => {});
      }
      const newKeywordsArray = template.keywords.split(',').map(k => k.trim()).filter(Boolean);
      for (const kw of newKeywordsArray) {
        await addKeyword(kw).catch(() => {});
      }

      // 4. Refresh State
      const rawData = await getPreferences();
      setActiveBackendPrefs(Array.isArray(rawData) ? rawData[0] : rawData);
      
      setMessage({ text: `"${template.name}" is now active! Scrapers will use these filters.`, type: 'success' });
    } catch (error) {
      console.error("Sync Error:", error);
      setMessage({ text: 'Activation partially failed. Check API logs.', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string) => {
    const filtered = watchlists.filter(w => w.id !== id);
    updateLocalWatchlists(filtered);
    setMessage({ text: 'Watchlist deleted.', type: 'success' });
  };

  const isActive = (template: WatchlistTemplate) => {
    if (!activeBackendPrefs) return false;
    
    const activeCompIds = (activeBackendPrefs.preferred_companies || []).map(c => c.id).sort();
    const templateCompIds = [...template.companies].sort();
    
    const activeKeywords = (activeBackendPrefs.keywords || []).map(k => k.keyword.toLowerCase()).sort();
    const templateKeywords = template.keywords.split(',').map(k => k.trim().toLowerCase()).filter(Boolean).sort();

    return (
      JSON.stringify(activeCompIds) === JSON.stringify(templateCompIds) &&
      JSON.stringify(activeKeywords) === JSON.stringify(templateKeywords)
    );
  };

  if (isLoading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', minHeight: '50vh' }}>
        <Loader2 size={40} className="animate-spin" style={{ color: '#3b82f6' }} />
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.title}>My Watchlists</h1>
          <p style={styles.subtitle}>Create multiple filters and activate the one you want to track today.</p>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          {!isCreating && watchlists.length < 2 && (
            <button onClick={() => setIsCreating(true)} style={styles.addButton}>
              <Plus size={18} /> New Watchlist
            </button>
          )}
          {!isCreating && watchlists.length >= 2 && (
            <div style={styles.warningText}>
              <AlertCircle size={14} /> Maximum of 2 watchlists allowed.
            </div>
          )}
        </div>
      </div>

      {message.text && (
        <div style={{
          ...styles.alert, 
          backgroundColor: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)', 
          color: message.type === 'success' ? '#22c55e' : '#ef4444', 
          border: `1px solid ${message.type === 'success' ? '#22c55e' : '#ef4444'}`
        }}>
          {message.text}
        </div>
      )}

      {!isCreating && watchlists.length > 0 && (
        <div style={styles.grid}>
          {watchlists.map((wl) => {
            const currentlyActive = isActive(wl);
            return (
              <div key={wl.id} style={{...styles.savedCard, borderColor: currentlyActive ? '#22c55e' : 'var(--border-color)'}}>
                <div style={styles.savedHeader}>
                  <h3 style={styles.savedTitle}>{wl.name}</h3>
                  <button onClick={() => handleDelete(wl.id)} style={styles.deleteIcon} title="Delete">
                    <Trash2 size={18} />
                  </button>
                </div>
                
                <div style={styles.savedDetail}>
                  <Briefcase size={16} style={{ minWidth: '16px' }} /> 
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {wl.keywords || 'Any Role'}
                  </span>
                </div>
                <div style={styles.savedDetail}>
                  <Building size={16} style={{ minWidth: '16px' }} /> 
                  <span>
                    {wl.companies.length > 0 
                      ? wl.companies.map(id => availableCompanies.find(c => c.id === id)?.name).filter(Boolean).join(', ') 
                      : 'All Companies'}
                  </span>
                </div>

                <button 
                  onClick={() => handleActivate(wl)} 
                  disabled={currentlyActive || isSaving}
                  style={{
                    ...styles.activateButton,
                    backgroundColor: currentlyActive ? '#22c55e' : '#3b82f6',
                    color: '#ffffff',
                    opacity: isSaving && !currentlyActive ? 0.7 : 1,
                  }}
                >
                  {isSaving && !currentlyActive ? <Loader2 size={18} className="animate-spin" /> : (currentlyActive ? <CheckCircle size={18} /> : <Bell size={18} />)}
                  {currentlyActive ? 'Currently Active' : 'Activate Filters'}
                </button>
              </div>
            );
          })}
        </div>
      )}

      {!isCreating && watchlists.length === 0 && (
        <div style={styles.emptyState}>
          <Bookmark size={48} style={{ color: 'var(--text-secondary)', marginBottom: '16px' }} />
          <h3>No watchlists yet</h3>
          <p>Create your first watchlist to filter the Daily Feed.</p>
        </div>
      )}

      {isCreating && (
        <form onSubmit={handleCreate} style={styles.formContainer}>
          
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <h2 style={styles.cardTitle}>Watchlist Name</h2>
            </div>
            <input 
              type="text" 
              value={newPrefs.name}
              onChange={(e) => setNewPrefs({...newPrefs, name: e.target.value})}
              placeholder="e.g. My Dream Frontend Roles"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <Building size={20} style={{ color: 'var(--text-secondary)' }} />
              <h2 style={styles.cardTitle}>Target Companies</h2>
            </div>
            <p style={styles.cardDesc}>Select the companies to monitor. Leave empty to track all.</p>
            <div style={styles.chipGrid}>
              {availableCompanies.map(company => {
                const isSelected = newPrefs.companies.includes(company.id);
                return (
                  <button
                    key={company.id}
                    type="button"
                    onClick={() => toggleCompany(company.id)}
                    style={{
                      ...styles.chip,
                      backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.15)' : 'var(--bg-primary)',
                      color: isSelected ? '#3b82f6' : 'var(--text-secondary)',
                      borderColor: isSelected ? '#3b82f6' : 'var(--border-color)',
                    }}
                  >
                    {company.name}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <Briefcase size={20} style={{ color: 'var(--text-secondary)' }} />
              <h2 style={styles.cardTitle}>Target Roles & Keywords</h2>
            </div>
            <p style={styles.cardDesc}>Enter keywords separated by commas (e.g., "Frontend, React, Python").</p>
            <input 
              type="text" 
              value={newPrefs.keywords}
              onChange={(e) => setNewPrefs({...newPrefs, keywords: e.target.value})}
              placeholder="e.g. Senior Frontend Engineer, Next.js"
              style={styles.input}
              required
            />
          </div>

          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <Bell size={20} style={{ color: 'var(--text-secondary)' }} />
              <h2 style={styles.cardTitle}>Email Notifications</h2>
            </div>
            <label style={styles.checkboxLabel}>
              <input 
                type="checkbox" 
                checked={newPrefs.email_alerts}
                onChange={(e) => setNewPrefs({...newPrefs, email_alerts: e.target.checked})}
                style={styles.checkbox}
              />
              Send me a daily email recap of matching jobs
            </label>
          </div>

          <div style={styles.footer}>
            <button type="button" onClick={() => setIsCreating(false)} style={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" style={styles.saveButton}>
              <Save size={18} /> Save Watchlist
            </button>
          </div>

        </form>
      )}
    </div>
  );
}

// 🕵️ SENIOR DEV FIX: Replaced all hardcoded hex values with CSS variables
const styles: { [key: string]: React.CSSProperties } = {
  container: { padding: 'clamp(16px, 4vw, 24px)', maxWidth: '800px', width: '100%', boxSizing: 'border-box', color: 'var(--text-primary)', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' },
  title: { fontSize: '1.875rem', fontWeight: 700, margin: '0 0 8px 0', color: 'var(--text-primary)' },
  subtitle: { color: 'var(--text-secondary)', fontSize: '1rem', margin: 0 },
  warningText: { color: '#ef4444', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 500, marginTop: '8px' },
  addButton: { display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 16px', backgroundColor: '#3b82f6', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' },
  alert: { padding: '16px', borderRadius: '8px', marginBottom: '24px', fontWeight: 500 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' },
  savedCard: { backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px', transition: 'border-color 0.2s' },
  savedHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  savedTitle: { margin: 0, fontSize: '1.2rem', color: 'var(--text-primary)', fontWeight: 600 },
  deleteIcon: { background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px' },
  savedDetail: { display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-secondary)', fontSize: '0.95rem' },
  activateButton: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '12px', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '0.95rem', cursor: 'pointer', marginTop: 'auto', transition: 'all 0.2s' },
  emptyState: { textAlign: 'center', padding: '60px 20px', backgroundColor: 'var(--bg-secondary)', borderRadius: '12px', border: '1px solid var(--border-color)', color: 'var(--text-secondary)' },
  formContainer: { display: 'flex', flexDirection: 'column', gap: '24px' },
  card: { backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px' },
  cardHeader: { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' },
  cardTitle: { fontSize: '1.25rem', fontWeight: 600, margin: 0, color: 'var(--text-primary)' },
  cardDesc: { color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: 0, marginBottom: '20px' },
  chipGrid: { display: 'flex', flexWrap: 'wrap', gap: '12px' },
  chip: { padding: '8px 20px', borderRadius: '24px', border: '1px solid', cursor: 'pointer', fontWeight: 500, fontSize: '0.95rem', transition: 'all 0.2s ease' },
  input: { width: '100%', padding: '14px 16px', backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', color: 'var(--text-primary)', fontSize: '1rem', boxSizing: 'border-box', outline: 'none' },
  checkboxLabel: { display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-primary)', cursor: 'pointer', fontSize: '1rem', userSelect: 'none' },
  checkbox: { width: '18px', height: '18px', cursor: 'pointer', accentColor: '#3b82f6' },
  footer: { display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '8px' },
  cancelButton: { padding: '14px 24px', backgroundColor: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', borderRadius: '8px', fontWeight: 600, cursor: 'pointer' },
  saveButton: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '14px 32px', backgroundColor: '#3b82f6', color: '#ffffff', border: 'none', borderRadius: '8px', fontWeight: 600, fontSize: '1rem', cursor: 'pointer' }
};