"use client";
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

interface ProfileProps {
  userProfile: any;
  profileLoading: boolean;
  profileSaving: boolean;
  updateProfileSection: (section: string, data: any) => void;
  saveUserProfile: (profileData: any) => void;
}

export default function Profile({
  userProfile,
  profileLoading,
  profileSaving,
  updateProfileSection,
  saveUserProfile
}: ProfileProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [niche, setNiche] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  
  useEffect(() => {
    const loadUserProfile = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      setUser(user);
      
      if (user) {
        // Load profile data from Supabase
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profile) {
          setName(profile.name || '');
          setNiche(profile.niche || '');
          setBio(profile.bio || '');
        }
      }
      
      setLoading(false);
    };
    loadUserProfile();
  }, []);
  
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    setSaving(true);
    setSaveMessage('');
    
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          name,
          niche,
          bio,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'id'
        });

      if (error) throw error;
      
      setSaveMessage('✓ Preferences saved successfully!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error: any) {
      setSaveMessage('Error: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="border border-white/10 rounded-lg p-8">
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mb-4"></div>
            <p className="text-gray-400">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Content Preferences */}
      <div className="border border-white/10 rounded-lg p-8">
        <h3 className="text-xl font-semibold text-white mb-6">Content Preferences</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">Niche</label>
            <select 
              value={niche}
              onChange={(e) => setNiche(e.target.value)}
              className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white focus:outline-none focus:border-white/30"
            >
              <option value="">Select your niche</option>
              <option value="business">Business</option>
              <option value="motivation">Motivation</option>
              <option value="fitness">Fitness</option>
              <option value="lifestyle">Lifestyle</option>
              <option value="education">Education</option>
              <option value="tech">Tech</option>
              <option value="finance">Finance</option>
              <option value="crypto">Crypto</option>
              <option value="travel">Travel</option>
              <option value="food">Food</option>
              <option value="fashion">Fashion</option>
              <option value="beauty">Beauty</option>
              <option value="gaming">Gaming</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-400 mb-2">Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              rows={3}
              className="w-full px-4 py-3 bg-black border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/30"
            />
          </div>
        </div>
        <div className="mt-6 flex items-center justify-between">
          <div>
            {saveMessage && (
              <p className={`text-sm ${saveMessage.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>
                {saveMessage}
              </p>
            )}
          </div>
          <button
            onClick={handleSaveProfile}
            disabled={saving}
            className="px-6 py-3 bg-white text-black rounded-lg font-medium hover:bg-gray-200 disabled:opacity-50 transition-colors"
          >
            {saving ? 'Saving...' : 'Save Preferences'}
          </button>
        </div>
        <p className="text-sm text-gray-400 mt-4">
          These preferences are saved to your Supabase database and synced across devices.
        </p>
      </div>

      {/* Account Information */}
      <div className="border border-white/10 rounded-lg p-8">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold text-white">Account Information</h3>
            <button
              onClick={handleLogout}
              className="px-6 py-3 bg-red-500/10 text-red-400 border border-red-500/20 rounded-lg font-medium hover:bg-red-500/20 transition-colors"
            >
              Log out
            </button>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm text-gray-400 mb-1">Email</p>
              <p className="text-white font-medium">{user?.email || 'Not available'}</p>
            </div>

            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm text-gray-400 mb-1">User ID</p>
              <p className="text-white font-mono text-sm">{user?.id || 'Not available'}</p>
            </div>

            <div className="p-4 bg-white/5 rounded-lg border border-white/10">
              <p className="text-sm text-gray-400 mb-1">Account Created</p>
              <p className="text-white">{user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Not available'}</p>
            </div>

            {user?.email_confirmed_at && (
              <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                <p className="text-sm text-green-400 mb-1">✓ Email Verified</p>
                <p className="text-white text-sm">{new Date(user.email_confirmed_at).toLocaleDateString()}</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-white/10">
            <p className="text-sm text-gray-400">
              This is your Supabase authentication profile. No custom database tables are required for authentication to work.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
