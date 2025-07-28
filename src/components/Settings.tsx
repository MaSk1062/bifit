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
  AlertTriangle,
  ArrowLeft // Added ArrowLeft for back button
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore'; // Import Timestamp
import { db } from '@/lib/firebase'; // Assuming db is already configured here

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
    if (!currentUser?.uid) {
      setIsLoading(false); // Stop loading if no user is logged in
      return;
    }

    setIsLoading(true);
    try {
      const settingsDocRef = doc(db, 'userSettings', currentUser.uid);
      const settingsDoc = await getDoc(settingsDocRef);

      if (settingsDoc.exists()) {
        const data = settingsDoc.data();
        setSettings({
          ...data,
          // Convert Firestore Timestamps back to Date objects
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
        // Save default settings to Firestore
        await setDoc(settingsDocRef, {
          ...defaultSettings,
          createdAt: Timestamp.fromDate(defaultSettings.createdAt),
          updatedAt: Timestamp.fromDate(defaultSettings.updatedAt)
        });
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
        updatedAt: new Date() // Update timestamp on save
      };

      // Convert Date objects to Firestore Timestamps before saving
      const dataToSave = {
        ...updatedSettings,
        createdAt: Timestamp.fromDate(updatedSettings.createdAt),
        updatedAt: Timestamp.fromDate(updatedSettings.updatedAt),
      };

      await updateDoc(settingsDocRef, dataToSave);
      setSettings(updatedSettings); // Update local state with the saved data
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

  // Handlers for nested state updates
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
      // Assuming useAuth provides a logout function or integrate Firebase auth.signOut() here
      console.log('Logout clicked');
      // Example: await auth.signOut();
      // navigate('/login'); // Redirect to login page after logout
    } catch (error) {
      console.error('Logout error:', error);
      // Optionally show an error message
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center font-inter">
        <div className="flex items-center space-x-2">
          <Loader2 className="w-6 h-6 animate-spin text-black" />
          <span className="text-black">Loading settings...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-inter">
      {/* Header */}
      <div className="bg-black text-white">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold">BiFyT</h1>
              <Badge variant="secondary" className="bg-white text-black rounded-md shadow-sm">
                Settings
              </Badge>
            </div>
            <div className="flex items-center space-x-4">
              <Button asChild variant="outline" className="bg-black text-white border-white hover:bg-white hover:text-black rounded-md shadow-sm">
                <Link to="/dashboard">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back to Dashboard
                </Link>
              </Button>
              <Button
                onClick={saveSettings}
                disabled={isSaving}
                className="bg-white text-black hover:bg-gray-100 rounded-md shadow-sm transition-colors"
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
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center space-x-2 shadow-sm">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="text-green-800">Settings saved successfully!</span>
          </div>
        )}

        {showError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center space-x-2 shadow-sm">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            <span className="text-red-800">Error saving settings. Please try again.</span>
          </div>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Notifications Card */}
          <Card className="border-black rounded-lg shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-black text-xl">
                <Bell className="w-6 h-6" />
                <span>Notifications</span>
              </CardTitle>
              <CardDescription className="text-gray-600">Manage your notification preferences</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6"> {/* Increased spacing */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold text-black">Email Notifications</Label>
                  <p className="text-xs text-gray-700">Receive updates and alerts via email</p>
                </div>
                <Switch
                  checked={settings.notifications.email}
                  onCheckedChange={(checked) => handleNotificationChange('email', checked)}
                  className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-300" // Styled switch
                />
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold text-black">Push Notifications</Label>
                  <p className="text-xs text-gray-700">Get instant alerts on your device</p>
                </div>
                <Switch
                  checked={settings.notifications.push}
                  onCheckedChange={(checked) => handleNotificationChange('push', checked)}
                  className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-300"
                />
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold text-black">Activity Reminders</Label>
                  <p className="text-xs text-gray-700">Get reminded to log your activities</p>
                </div>
                <Switch
                  checked={settings.notifications.reminders}
                  onCheckedChange={(checked) => handleNotificationChange('reminders', checked)}
                  className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-300"
                />
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold text-black">Achievement Alerts</Label>
                  <p className="text-xs text-gray-700">Celebrate your fitness milestones</p>
                </div>
                <Switch
                  checked={settings.notifications.achievements}
                  onCheckedChange={(checked) => handleNotificationChange('achievements', checked)}
                  className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-300"
                />
              </div>

              <div className="flex items-center justify-between"> {/* No bottom border for last item */}
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold text-black">Weekly Reports</Label>
                  <p className="text-xs text-gray-700">Receive weekly progress summaries</p>
                </div>
                <Switch
                  checked={settings.notifications.weeklyReports}
                  onCheckedChange={(checked) => handleNotificationChange('weeklyReports', checked)}
                  className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-300"
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy Card */}
          <Card className="border-black rounded-lg shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-black text-xl">
                <Shield className="w-6 h-6" />
                <span>Privacy</span>
              </CardTitle>
              <CardDescription className="text-gray-600">Control your privacy settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6"> {/* Increased spacing */}
              <div className="space-y-2 pb-3 border-b border-gray-200">
                <Label className="text-sm font-semibold text-black">Profile Visibility</Label>
                <Select
                  value={settings.privacy.profileVisibility}
                  onValueChange={(value) => handlePrivacyChange('profileVisibility', value as UserSettings['privacy']['profileVisibility'])}
                >
                  <SelectTrigger className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black border border-gray-300 rounded-md shadow-lg">
                    <SelectItem value="public" className="hover:bg-gray-100 focus:bg-gray-100 rounded-sm">Public</SelectItem>
                    <SelectItem value="friends" className="hover:bg-gray-100 focus:bg-gray-100 rounded-sm">Friends Only</SelectItem>
                    <SelectItem value="private" className="hover:bg-gray-100 focus:bg-gray-100 rounded-sm">Private</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold text-black">Share Activities</Label>
                  <p className="text-xs text-gray-700">Allow others to see your logged activities</p>
                </div>
                <Switch
                  checked={settings.privacy.activitySharing}
                  onCheckedChange={(checked) => handlePrivacyChange('activitySharing', checked)}
                  className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-300"
                />
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold text-black">Share Goals</Label>
                  <p className="text-xs text-gray-700">Allow others to see your fitness goals</p>
                </div>
                <Switch
                  checked={settings.privacy.goalSharing}
                  onCheckedChange={(checked) => handlePrivacyChange('goalSharing', checked)}
                  className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-300"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold text-black">Location Sharing</Label>
                  <p className="text-xs text-gray-700">Share your location with activities</p>
                </div>
                <Switch
                  checked={settings.privacy.locationSharing}
                  onCheckedChange={(checked) => handlePrivacyChange('locationSharing', checked)}
                  className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-300"
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance Card */}
          <Card className="border-black rounded-lg shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-black text-xl">
                <Palette className="w-6 h-6" />
                <span>Appearance</span>
              </CardTitle>
              <CardDescription className="text-gray-600">Customize your app appearance</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6"> {/* Increased spacing */}
              <div className="space-y-2 pb-3 border-b border-gray-200">
                <Label className="text-sm font-semibold text-black">Theme</Label>
                <Select
                  value={settings.appearance.theme}
                  onValueChange={(value) => handleAppearanceChange('theme', value as UserSettings['appearance']['theme'])}
                >
                  <SelectTrigger className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black border border-gray-300 rounded-md shadow-lg">
                    <SelectItem value="light" className="hover:bg-gray-100 focus:bg-gray-100 rounded-sm">Light</SelectItem>
                    <SelectItem value="dark" className="hover:bg-gray-100 focus:bg-gray-100 rounded-sm">Dark</SelectItem>
                    <SelectItem value="auto" className="hover:bg-gray-100 focus:bg-gray-100 rounded-sm">Auto (System Default)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 pb-3 border-b border-gray-200">
                <Label className="text-sm font-semibold text-black">Units</Label>
                <Select
                  value={settings.appearance.units}
                  onValueChange={(value) => handleAppearanceChange('units', value as UserSettings['appearance']['units'])}
                >
                  <SelectTrigger className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black border border-gray-300 rounded-md shadow-lg">
                    <SelectItem value="metric" className="hover:bg-gray-100 focus:bg-gray-100 rounded-sm">Metric (kg, km)</SelectItem>
                    <SelectItem value="imperial" className="hover:bg-gray-100 focus:bg-gray-100 rounded-sm">Imperial (lbs, mi)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-black">Language</Label>
                <Select
                  value={settings.appearance.language}
                  onValueChange={(value) => handleAppearanceChange('language', value)}
                >
                  <SelectTrigger className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black border border-gray-300 rounded-md shadow-lg">
                    <SelectItem value="en" className="hover:bg-gray-100 focus:bg-gray-100 rounded-sm">English</SelectItem>
                    <SelectItem value="es" className="hover:bg-gray-100 focus:bg-gray-100 rounded-sm">Spanish</SelectItem>
                    <SelectItem value="fr" className="hover:bg-gray-100 focus:bg-gray-100 rounded-sm">French</SelectItem>
                    <SelectItem value="de" className="hover:bg-gray-100 focus:bg-gray-100 rounded-sm">German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Data & Sync Card */}
          <Card className="border-black rounded-lg shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-black text-xl">
                <Database className="w-6 h-6" />
                <span>Data & Sync</span>
              </CardTitle>
              <CardDescription className="text-gray-600">Manage your data and synchronization</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6"> {/* Increased spacing */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold text-black">Auto Sync</Label>
                  <p className="text-xs text-gray-700">Automatically synchronize your data across devices</p>
                </div>
                <Switch
                  checked={settings.data.autoSync}
                  onCheckedChange={(checked) => handleDataChange('autoSync', checked)}
                  className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-300"
                />
              </div>

              <div className="space-y-2 pb-3 border-b border-gray-200">
                <Label className="text-sm font-semibold text-black">Backup Frequency</Label>
                <Select
                  value={settings.data.backupFrequency}
                  onValueChange={(value) => handleDataChange('backupFrequency', value as UserSettings['data']['backupFrequency'])}
                >
                  <SelectTrigger className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black border border-gray-300 rounded-md shadow-lg">
                    <SelectItem value="daily" className="hover:bg-gray-100 focus:bg-gray-100 rounded-sm">Daily</SelectItem>
                    <SelectItem value="weekly" className="hover:bg-gray-100 focus:bg-gray-100 rounded-sm">Weekly</SelectItem>
                    <SelectItem value="monthly" className="hover:bg-gray-100 focus:bg-gray-100 rounded-sm">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2 pb-3 border-b border-gray-200">
                <Label className="text-sm font-semibold text-black">Data Retention</Label>
                <Select
                  value={settings.data.dataRetention}
                  onValueChange={(value) => handleDataChange('dataRetention', value as UserSettings['data']['dataRetention'])}
                >
                  <SelectTrigger className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black border border-gray-300 rounded-md shadow-lg">
                    <SelectItem value="30days" className="hover:bg-gray-100 focus:bg-gray-100 rounded-sm">30 Days</SelectItem>
                    <SelectItem value="90days" className="hover:bg-gray-100 focus:bg-gray-100 rounded-sm">90 Days</SelectItem>
                    <SelectItem value="1year" className="hover:bg-gray-100 focus:bg-gray-100 rounded-sm">1 Year</SelectItem>
                    <SelectItem value="forever" className="hover:bg-gray-100 focus:bg-gray-100 rounded-sm">Forever</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-semibold text-black">Export Format</Label>
                <Select
                  value={settings.data.exportFormat}
                  onValueChange={(value) => handleDataChange('exportFormat', value as UserSettings['data']['exportFormat'])}
                >
                  <SelectTrigger className="border-gray-300 focus:border-black focus:ring-black rounded-md text-black h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white text-black border border-gray-300 rounded-md shadow-lg">
                    <SelectItem value="json" className="hover:bg-gray-100 focus:bg-gray-100 rounded-sm">JSON</SelectItem>
                    <SelectItem value="csv" className="hover:bg-gray-100 focus:bg-gray-100 rounded-sm">CSV</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Account Card */}
          <Card className="border-black rounded-lg shadow-lg">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center space-x-2 text-black text-xl">
                <User className="w-6 h-6" />
                <span>Account</span>
              </CardTitle>
              <CardDescription className="text-gray-600">Manage your account settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6"> {/* Increased spacing */}
              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold text-black">Email Notifications</Label>
                  <p className="text-xs text-gray-700">Receive important account-related emails</p>
                </div>
                <Switch
                  checked={settings.account.emailNotifications}
                  onCheckedChange={(checked) => handleAccountChange('emailNotifications', checked)}
                  className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-300"
                />
              </div>

              <div className="flex items-center justify-between pb-3 border-b border-gray-200">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold text-black">Marketing Emails</Label>
                  <p className="text-xs text-gray-700">Receive promotional content and offers</p>
                </div>
                <Switch
                  checked={settings.account.marketingEmails}
                  onCheckedChange={(checked) => handleAccountChange('marketingEmails', checked)}
                  className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-300"
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm font-semibold text-black">Two-Factor Authentication</Label>
                  <p className="text-xs text-gray-700">Add an extra layer of security to your account</p>
                </div>
                <Switch
                  checked={settings.account.twoFactorAuth}
                  onCheckedChange={(checked) => handleAccountChange('twoFactorAuth', checked)}
                  className="data-[state=checked]:bg-black data-[state=unchecked]:bg-gray-300"
                />
              </div>

              <div className="pt-6 border-t border-gray-200"> {/* Separator for logout */}
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  className="w-full text-red-600 border-red-300 hover:bg-red-50 hover:text-red-700 rounded-md shadow-sm transition-colors"
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
