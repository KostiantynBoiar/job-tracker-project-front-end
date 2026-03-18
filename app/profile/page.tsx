'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, Mail, Calendar, Loader2, Save, Lock, Settings, Briefcase } from 'lucide-react';
import { apiClient } from '../../src/api/client';
import ProtectedRoute from '../../src/components/auth/ProtectedRoute/ProtectedRoute';

interface UserProfile {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  auth_provider: string;
  date_joined: string;
}

export default function ProfilePage() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState({ text: '', type: '' });

  // Editable fields
  const [username, setUsername] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  // Password change
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await apiClient.get('/api/users/me/');
        const data = response.data;
        setProfile(data);
        setUsername(data.username || '');
        setFirstName(data.first_name || '');
        setLastName(data.last_name || '');
      } catch (err) {
        console.error('Failed to fetch profile:', err);
        setError('Failed to load profile. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage({ text: '', type: '' });

    try {
      const response = await apiClient.put('/api/users/me/', {
        username,
        first_name: firstName,
        last_name: lastName,
      });
      setProfile(response.data);
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
    } catch (err: any) {
      console.error('Failed to update profile:', err);
      const errorMsg = err.response?.data?.detail || 'Failed to update profile.';
      setMessage({ text: errorMsg, type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newPassword !== confirmPassword) {
      setMessage({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    setIsChangingPassword(true);
    setMessage({ text: '', type: '' });

    try {
      await apiClient.post('/api/users/me/change-password/', {
        old_password: oldPassword,
        new_password: newPassword,
        new_password_confirm: confirmPassword,
      });
      setMessage({ text: 'Password changed successfully!', type: 'success' });
      setShowPasswordForm(false);
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      console.error('Failed to change password:', err);
      const errorMsg = err.response?.data?.detail || err.response?.data?.old_password?.[0] || 'Failed to change password.';
      setMessage({ text: errorMsg, type: 'error' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  if (isLoading) {
    return (
      <ProtectedRoute>
        <div style={styles.loadingContainer}>
          <Loader2 size={48} style={{ animation: 'spin 1s linear infinite', color: '#3b82f6' }} />
          <p style={styles.loadingText}>Loading profile...</p>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div style={styles.errorContainer}>
          <h2 style={styles.errorTitle}>Something went wrong</h2>
          <p style={styles.errorText}>{error}</p>
          <button onClick={() => window.location.reload()} style={styles.retryButton}>
            Try Again
          </button>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div style={styles.container}>
        <header style={styles.header}>
          <div style={styles.headerLeft}>
            <User size={32} style={{ color: '#3b82f6' }} />
            <div>
              <h1 style={styles.title}>My Profile</h1>
              <p style={styles.subtitle}>Manage your account settings</p>
            </div>
          </div>
          <div style={styles.headerRight}>
            <button onClick={() => router.push('/preferences')} style={styles.navButton}>
              <Settings size={18} />
              Preferences
            </button>
            <button onClick={() => router.push('/jobs')} style={styles.navButton}>
              <Briefcase size={18} />
              Browse Jobs
            </button>
          </div>
        </header>

        {message.text && (
          <div
            style={{
              ...styles.alert,
              backgroundColor: message.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: message.type === 'success' ? '#22c55e' : '#ef4444',
              border: `1px solid ${message.type === 'success' ? '#22c55e' : '#ef4444'}`,
            }}
          >
            {message.text}
          </div>
        )}

        {/* Account Info Card */}
        <div style={styles.card}>
          <div style={styles.cardHeader}>
            <Mail size={20} style={{ color: '#a1a1aa' }} />
            <h2 style={styles.cardTitle}>Account Information</h2>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Email</span>
            <span style={styles.infoValue}>{profile?.email}</span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Auth Provider</span>
            <span style={styles.infoBadge}>
              {profile?.auth_provider === 'email' ? 'Email/Password' : profile?.auth_provider}
            </span>
          </div>
          <div style={styles.infoRow}>
            <span style={styles.infoLabel}>Member Since</span>
            <span style={styles.infoValue}>
              <Calendar size={14} style={{ marginRight: '6px' }} />
              {profile?.date_joined ? formatDate(profile.date_joined) : 'N/A'}
            </span>
          </div>
        </div>

        {/* Edit Profile Card */}
        <form onSubmit={handleSaveProfile} style={styles.card}>
          <div style={styles.cardHeader}>
            <User size={20} style={{ color: '#a1a1aa' }} />
            <h2 style={styles.cardTitle}>Edit Profile</h2>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
              placeholder="Enter username"
            />
          </div>

          <div style={styles.formRow}>
            <div style={styles.formGroup}>
              <label style={styles.label}>First Name</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                style={styles.input}
                placeholder="Enter first name"
              />
            </div>
            <div style={styles.formGroup}>
              <label style={styles.label}>Last Name</label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                style={styles.input}
                placeholder="Enter last name"
              />
            </div>
          </div>

          <button type="submit" disabled={isSaving} style={styles.saveButton}>
            {isSaving ? (
              <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
            ) : (
              <Save size={18} />
            )}
            {isSaving ? 'Saving...' : 'Save Changes'}
          </button>
        </form>

        {/* Change Password Card - Only for email auth */}
        {profile?.auth_provider === 'email' && (
          <div style={styles.card}>
            <div style={styles.cardHeader}>
              <Lock size={20} style={{ color: '#a1a1aa' }} />
              <h2 style={styles.cardTitle}>Change Password</h2>
            </div>

            {!showPasswordForm ? (
              <button
                onClick={() => setShowPasswordForm(true)}
                style={styles.secondaryButton}
              >
                Change Password
              </button>
            ) : (
              <form onSubmit={handleChangePassword}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Current Password</label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    style={styles.input}
                    placeholder="Enter current password"
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    style={styles.input}
                    placeholder="Enter new password"
                    required
                  />
                </div>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    style={styles.input}
                    placeholder="Confirm new password"
                    required
                  />
                </div>
                <div style={styles.buttonRow}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPasswordForm(false);
                      setOldPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    style={styles.cancelButton}
                  >
                    Cancel
                  </button>
                  <button type="submit" disabled={isChangingPassword} style={styles.saveButton}>
                    {isChangingPassword ? (
                      <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
                    ) : (
                      <Lock size={18} />
                    )}
                    {isChangingPassword ? 'Changing...' : 'Change Password'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    padding: '24px',
    maxWidth: '700px',
    margin: '0 auto',
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    gap: '16px',
  },
  loadingText: {
    color: '#888',
    fontSize: '1rem',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#0a0a0a',
    padding: '24px',
    textAlign: 'center',
  },
  errorTitle: {
    color: '#fff',
    fontSize: '1.5rem',
    marginBottom: '8px',
  },
  errorText: {
    color: '#888',
    fontSize: '1rem',
    marginBottom: '24px',
  },
  retryButton: {
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '1rem',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
  },
  headerRight: {
    display: 'flex',
    gap: '12px',
  },
  navButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#111',
    color: '#fff',
    border: '1px solid #333',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 500,
    fontSize: '0.95rem',
    transition: 'all 0.2s',
  },
  title: {
    fontSize: '1.75rem',
    fontWeight: 700,
    color: '#fff',
    margin: 0,
  },
  subtitle: {
    fontSize: '0.95rem',
    color: '#888',
    margin: '4px 0 0 0',
  },
  alert: {
    padding: '16px',
    borderRadius: '8px',
    marginBottom: '24px',
    fontWeight: 500,
  },
  card: {
    backgroundColor: '#111',
    border: '1px solid #333',
    borderRadius: '12px',
    padding: '24px',
    marginBottom: '20px',
  },
  cardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '20px',
  },
  cardTitle: {
    fontSize: '1.25rem',
    fontWeight: 600,
    margin: 0,
    color: '#fff',
  },
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 0',
    borderBottom: '1px solid #222',
  },
  infoLabel: {
    color: '#888',
    fontSize: '0.95rem',
  },
  infoValue: {
    color: '#fff',
    fontSize: '0.95rem',
    display: 'flex',
    alignItems: 'center',
  },
  infoBadge: {
    padding: '4px 12px',
    backgroundColor: 'rgba(59, 130, 246, 0.15)',
    color: '#3b82f6',
    borderRadius: '6px',
    fontSize: '0.85rem',
    fontWeight: 500,
    textTransform: 'capitalize',
  },
  formGroup: {
    marginBottom: '16px',
    flex: 1,
  },
  formRow: {
    display: 'flex',
    gap: '16px',
  },
  label: {
    display: 'block',
    color: '#888',
    fontSize: '0.9rem',
    marginBottom: '8px',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#0a0a0a',
    border: '1px solid #333',
    borderRadius: '8px',
    color: '#fff',
    fontSize: '1rem',
    outline: 'none',
    boxSizing: 'border-box',
  },
  saveButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#3b82f6',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '1rem',
    width: '100%',
    marginTop: '8px',
  },
  secondaryButton: {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    color: '#3b82f6',
    border: '1px solid #3b82f6',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '1rem',
  },
  buttonRow: {
    display: 'flex',
    gap: '12px',
    marginTop: '16px',
  },
  cancelButton: {
    flex: 1,
    padding: '12px 24px',
    backgroundColor: 'transparent',
    color: '#888',
    border: '1px solid #333',
    borderRadius: '8px',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: '1rem',
  },
};
