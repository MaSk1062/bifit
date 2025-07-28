import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Bell, 
  Shield, 
  Palette, 
  Database, 
  User, 
  LogOut, 
  Save,
  Loader2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

interface UserSettings {
  notifications: {
    email: boolean;
    push: boolean;
    reminders: boolean;
    achievements: boolean;
    weeklyReports: boolean;
  };
  privacy: {
    profileVisibility: 'public' | 'private' | 'friends';
    activitySharing: boolean;
    goalSharing: boolean;
    locationSharing: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    units: 'metric' | 'imperial';
    language: string;
  };
  data: {
    autoSync: boolean;
    backupFrequency: 'daily' | 'weekly' | 'monthly';
    dataRetention: '30days' | '90days' | '1year' | 'forever';
    exportFormat: 'json' | 'csv';
  };
  account: {
    emailNotifications: boolean;
    marketingEmails: boolean;
    twoFactorAuth: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

export function Settings() {
  const { currentUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [settings, setSettings] = useState<UserSettings>({
    notifications: {
      email: true,
      push: true,
      reminders: true,
      achievements: true,
      weeklyReports: false
    },
    privacy: {
      profileVisibility: 'private',
      activitySharing: false,
      goalSharing: false,
      locationSharing: false
    },
    appearance: {
      theme: 'light',
      units: 'metric',
      language: 'en'
    },
    data: {
      autoSync: true,
      backupFrequency: 'weekly',
      dataRetention: '1year',
      exportFormat: 'json'
    },
    account: {
      emailNotifications: true,
      marketingEmails: false,
      twoFactorAuth: false
    },
    createdAt: new Date(),
    updatedAt: new Date()
  });

  // Load settings from Firestore
  const loadSettings = async () => {
    if (!currentUser?.uid) return;

    setIsLoading(true);
    try {
      const settingsDocRef = doc(db, 'userSettings', currentUser.uid);
      const settingsDoc = await getDoc(settingsDocRef);
      
      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        setSettings({
          ...data,
          createdAt: data.createdAt?.toDate?.() || new Date(),
          updatedAt: data.updatedAt?.toDate?.() || new Date()
        } as UserSettings);
      } else {
        // Create default settings if they don't exist
        const defaultSettings: UserSettings = {
          notifications: {
            email: true,
            push: true,
            reminders: true,
            achievements: true,
            weeklyReports: false
          },
          privacy: {
            profileVisibility: 'private',
            activitySharing: false,
            goalSharing: false,
            locationSharing: false
          },
          appearance: {
            theme: 'light',
            units: 'metric',
            language: 'en'
          },
          data: {
            autoSync: true,
            backupFrequency: 'weekly',
            dataRetention: '1year',
            exportFormat: 'json'
          },
          account: {
            emailNotifications: true,
            marketingEmails: false,
            twoFactorAuth: false
          },
          createdAt: new Date(),
          updatedAt: new Date()
        };
        await setDoc(settingsDocRef, defaultSettings);
        setSettings(defaultSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSettings();
  }, [currentUser?.uid]);

  // Save settings to Firestore
  const saveSettings = async () => {
    if (!currentUser?.uid) return;

    setIsSaving(true);
    try {
      const settingsDocRef = doc(db, 'userSettings', currentUser.uid);
      const updatedSettings = {
        ...settings,
        updatedAt: new Date()
      };
      
      await updateDoc(settingsDocRef, updatedSettings);
      setSettings(updatedSettings);
      setShowSuccess(true);
      
      // Hide success message after 3 seconds
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleNotificationChange = (key: keyof UserSettings['notifications'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const handlePrivacyChange = (key: keyof UserSettings['privacy'], value: boolean | string) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [key]: value
      }
    }));
  };

  const handleAppearanceChange = (key: keyof UserSettings['appearance'], value: string) => {
    setSettings(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        [key]: value
      }
    }));
  };

  const handleDataChange = (key: keyof UserSettings['data'], value: string | boolean) => {
    setSettings(prev => ({
      ...prev,
      data: {
        ...prev.data,
        [key]: value
      }
    }));
  };

  const handleAccountChange = (key: keyof UserSettings['account'], value: boolean) => {
    setSettings(prev => ({
      ...prev,
      account: {
        ...prev.account,
        [key]: value
      }
    }));
  };

  const handleLogout = async () => {
    try {
      // Logout logic would be here
      console.log('Logout clicked');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-black" />
          <span className="text-black">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-black text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">BiFyT</h1>
              <Badge variant="secondary" className="bg-white text-black">
                Settings
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild variant="outline" className="text-white border-white hover:bg-white hover:text-black">
                <Link to="/dashboard">
                  Back to Dashboard
                </Link>
              </Button>
              <Button 
                onClick={saveSettings}
                disabled={isSaving}
                className="bg-white text-black hover:bg-gray-100"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Save className="w-4 h-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Success/Error Messages */}
        {showSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800">Settings saved successfully!</span>
          </div>
        )}

        {showError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">Error saving settings. Please try again.</span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-black">
                <Bell className="w-5 h-5" />
                <span>Notifications</span>
              </CardTitle>
              <CardDescription>Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Email Notifications</Label>
                  <p className="text-xs text-gray-600">Receive updates via email</p>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Push Notifications</Label>
                  <p className="text-xs text-gray-600">Receive push notifications</p>
                </div>
                <Switch
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Activity Reminders</Label>
                  <p className="text-xs text-gray-600">Get reminded to log activities</p>
                </div>
                <Switch
                  checked={settings.notifications.reminders}
                  onCheckedChange={(checked) => handleNotificationChange('reminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Achievement Alerts</Label>
                  <p className="text-xs text-gray-600">Celebrate your milestones</p>
                </div>
                <Switch
                  checked={settings.notifications.achievements}
                  onCheckedChange={(checked) => handleNotificationChange('achievements', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Weekly Reports</Label>
                  <p className="text-xs text-gray-600">Receive weekly progress summaries</p>
                </div>
                <Switch
                  checked={settings.notifications.weeklyReports}
                  onCheckedChange={(checked) => handleNotificationChange('weeklyReports', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-black">
                <Shield className="w-5 h-5" />
                <span>Privacy</span>
              </CardTitle>
              <CardDescription>Control your privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Profile Visibility</Label>
                <Select
                  value={settings.privacy.profileVisibility}
                  onValueChange={(value) => handlePrivacyChange('profileVisibility', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="friends">Friends Only</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Share Activities</Label>
                  <p className="text-xs text-gray-600">Allow others to see your activities</p>
                </div>
                <Switch
                  checked={settings.privacy.activitySharing}
                  onCheckedChange={(checked) => handlePrivacyChange('activitySharing', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Share Goals</Label>
                  <p className="text-xs text-gray-600">Allow others to see your goals</p>
                </div>
                <Switch
                  checked={settings.privacy.goalSharing}
                  onCheckedChange={(checked) => handlePrivacyChange('goalSharing', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Location Sharing</Label>
                  <p className="text-xs text-gray-600">Share your location with activities</p>
                </div>
                <Switch
                  checked={settings.privacy.locationSharing}
                  onCheckedChange={(checked) => handlePrivacyChange('locationSharing', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-black">
                <Palette className="w-5 h-5" />
                <span>Appearance</span>
              </CardTitle>
              <CardDescription>Customize your app appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Theme</Label>
                <Select
                  value={settings.appearance.theme}
                  onValueChange={(value) => handleAppearanceChange('theme', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="auto">Auto</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Units</Label>
                <Select
                  value={settings.appearance.units}
                  onValueChange={(value) => handleAppearanceChange('units', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="metric">Metric (kg, km)</SelectItem>
                    <SelectItem value="imperial">Imperial (lbs, mi)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Language</Label>
                <Select
                  value={settings.appearance.language}
                  onValueChange={(value) => handleAppearanceChange('language', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Data & Sync */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-black">
                <Database className="w-5 h-5" />
                <span>Data & Sync</span>
              </CardTitle>
              <CardDescription>Manage your data and synchronization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Auto Sync</Label>
                  <p className="text-xs text-gray-600">Automatically sync data</p>
                </div>
                <Switch
                  checked={settings.data.autoSync}
                  onCheckedChange={(checked) => handleDataChange('autoSync', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Backup Frequency</Label>
                <Select
                  value={settings.data.backupFrequency}
                  onValueChange={(value) => handleDataChange('backupFrequency', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Data Retention</Label>
                <Select
                  value={settings.data.dataRetention}
                  onValueChange={(value) => handleDataChange('dataRetention', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30days">30 Days</SelectItem>
                    <SelectItem value="90days">90 Days</SelectItem>
                    <SelectItem value="1year">1 Year</SelectItem>
                    <SelectItem value="forever">Forever</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium">Export Format</Label>
                <Select
                  value={settings.data.exportFormat}
                  onValueChange={(value) => handleDataChange('exportFormat', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="json">JSON</SelectItem>
                    <SelectItem value="csv">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Account */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-black">
                <User className="w-5 h-5" />
                <span>Account</span>
              </CardTitle>
              <CardDescription>Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Email Notifications</Label>
                  <p className="text-xs text-gray-600">Receive account-related emails</p>
                </div>
                <Switch
                  checked={settings.account.emailNotifications}
                  onCheckedChange={(checked) => handleAccountChange('emailNotifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Marketing Emails</Label>
                  <p className="text-xs text-gray-600">Receive promotional content</p>
                </div>
                <Switch
                  checked={settings.account.marketingEmails}
                  onCheckedChange={(checked) => handleAccountChange('marketingEmails', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-medium">Two-Factor Authentication</Label>
                  <p className="text-xs text-gray-600">Add extra security to your account</p>
                </div>
                <Switch
                  checked={settings.account.twoFactorAuth}
                  onCheckedChange={(checked) => handleAccountChange('twoFactorAuth', checked)}
                />
              </div>

              <div className="pt-4 border-t">
                <Button 
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
} 