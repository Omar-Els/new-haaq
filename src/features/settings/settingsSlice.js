import { createSlice } from '@reduxjs/toolkit';

// Helper functions for localStorage
const getSettingsFromStorage = () => {
  try {
    // Get theme from existing themeSlice
    const theme = localStorage.getItem('theme') || 'light';

    // Get other settings from localStorage with defaults
    return {
      appearance: {
        theme,
        fontSize: localStorage.getItem('fontSize') || 'medium',
        rtl: localStorage.getItem('rtl') !== 'false', // Default to true
        primaryColor: localStorage.getItem('primaryColor') || '#3498db',
        secondaryColor: localStorage.getItem('secondaryColor') || '#2ecc71',
      },
      notifications: {
        enableNotifications: localStorage.getItem('enableNotifications') !== 'false', // Default to true
        notificationSound: localStorage.getItem('notificationSound') !== 'false', // Default to true
        emailNotifications: localStorage.getItem('emailNotifications') === 'true', // Default to false
        notificationDuration: parseInt(localStorage.getItem('notificationDuration') || '5', 10),
      },
      account: {
        displayName: localStorage.getItem('displayName') || '',
        email: localStorage.getItem('email') || '',
        language: localStorage.getItem('language') || 'ar',
        avatar: localStorage.getItem('avatar') || '',
      },
      privacy: {
        saveLoginInfo: localStorage.getItem('saveLoginInfo') !== 'false', // Default to true
        autoLogout: localStorage.getItem('autoLogout') === 'true', // Default to false
        logoutTime: localStorage.getItem('logoutTime') || '30',
        dataEncryption: localStorage.getItem('dataEncryption') === 'true', // Default to false
      },
      data: {
        autoSave: localStorage.getItem('autoSave') !== 'false', // Default to true
        saveInterval: localStorage.getItem('saveInterval') || '5',
        exportFormat: localStorage.getItem('exportFormat') || 'excel',
        backupData: localStorage.getItem('backupData') === 'true', // Default to false
      }
    };
  } catch (error) {
    console.error('Error getting settings from storage:', error);
    return getDefaultSettings();
  }
};

// Default settings if localStorage fails
const getDefaultSettings = () => {
  return {
    appearance: {
      theme: 'light',
      fontSize: 'medium',
      rtl: true,
      primaryColor: '#3498db',
      secondaryColor: '#2ecc71',
    },
    notifications: {
      enableNotifications: true,
      notificationSound: true,
      emailNotifications: false,
      notificationDuration: 5,
    },
    account: {
      displayName: '',
      email: '',
      language: 'ar',
      avatar: '',
    },
    privacy: {
      saveLoginInfo: true,
      autoLogout: false,
      logoutTime: '30',
      dataEncryption: false,
    },
    data: {
      autoSave: true,
      saveInterval: '5',
      exportFormat: 'excel',
      backupData: false,
    }
  };
};

// Save settings to localStorage
const saveSettingsToStorage = (settings) => {
  try {
    // Save appearance settings
    Object.entries(settings.appearance).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });

    // Save notification settings
    Object.entries(settings.notifications).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });

    // Save account settings
    Object.entries(settings.account).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });

    // Save privacy settings
    Object.entries(settings.privacy).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });

    // Save data settings
    Object.entries(settings.data).forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
  } catch (error) {
    console.error('Error saving settings to storage:', error);
  }
};

// Apply settings to the application
const applySettings = (settings) => {
  // Apply appearance settings
  applyAppearanceSettings(settings.appearance);

  // Apply notification settings
  applyNotificationSettings(settings.notifications);

  // Apply privacy settings
  applyPrivacySettings(settings.privacy);

  // Apply data settings
  applyDataSettings(settings.data);

  // Apply account settings
  applyAccountSettings(settings.account);

  // Dispatch a custom event to notify the application that settings have changed
  const settingsChangedEvent = new CustomEvent('settingsChanged', { detail: settings });
  window.dispatchEvent(settingsChangedEvent);
};

// Apply appearance settings
const applyAppearanceSettings = (appearance) => {
  // Apply font size
  document.documentElement.style.setProperty('--font-size-base', getFontSizeValue(appearance.fontSize));

  // Apply RTL direction
  document.documentElement.dir = appearance.rtl ? 'rtl' : 'ltr';
  document.body.dir = appearance.rtl ? 'rtl' : 'ltr';

  // Apply custom colors
  document.documentElement.style.setProperty('--primary-color', appearance.primaryColor);
  document.documentElement.style.setProperty('--secondary-color', appearance.secondaryColor);

  // Apply theme class to body
  if (appearance.theme === 'dark') {
    document.body.classList.add('dark-theme');
    document.body.classList.remove('light-theme');
  } else {
    document.body.classList.add('light-theme');
    document.body.classList.remove('dark-theme');
  }

  // Update meta theme-color for mobile browsers
  const metaThemeColor = document.querySelector('meta[name="theme-color"]');
  if (metaThemeColor) {
    metaThemeColor.setAttribute('content', appearance.theme === 'dark' ? '#1a1a1a' : '#ffffff');
  }
};

// Apply notification settings
const applyNotificationSettings = (notifications) => {
  // Store notification settings in window object for global access
  window.notificationSettings = {
    enabled: notifications.enableNotifications,
    sound: notifications.notificationSound,
    duration: notifications.notificationDuration * 1000, // Convert to milliseconds
    email: notifications.emailNotifications
  };
};

// Apply privacy settings
const applyPrivacySettings = (privacy) => {
  // Setup auto logout if enabled
  if (privacy.autoLogout) {
    setupAutoLogout(privacy.logoutTime);
  } else {
    clearAutoLogout();
  }

  // Apply data encryption if enabled
  if (privacy.dataEncryption) {
    enableDataEncryption();
  }
};

// Apply data settings
const applyDataSettings = (data) => {
  // Setup auto save if enabled
  if (data.autoSave) {
    setupAutoSave(data.saveInterval);
  } else {
    clearAutoSave();
  }

  // Store export format preference
  window.exportFormat = data.exportFormat;
};

// Apply account settings
const applyAccountSettings = (account) => {
  // Update user display name if available
  if (account.displayName) {
    updateUserDisplayName(account.displayName);
  }

  // Apply language setting
  applyLanguage(account.language);
};

// Helper function to get font size value
const getFontSizeValue = (size) => {
  switch (size) {
    case 'small':
      return '0.875rem';
    case 'large':
      return '1.125rem';
    case 'medium':
    default:
      return '1rem';
  }
};

// Auto logout timer reference
let autoLogoutTimer = null;

// Setup auto logout timer
const setupAutoLogout = (minutes) => {
  // Clear any existing timer
  clearAutoLogout();

  // Convert minutes to milliseconds
  const timeout = parseInt(minutes, 10) * 60 * 1000;

  // Set up inactivity detection
  const resetTimer = () => {
    clearTimeout(autoLogoutTimer);
    autoLogoutTimer = setTimeout(() => {
      // Perform logout action
      if (window.location.pathname !== '/login') {
        // Save current state before logout
        localStorage.setItem('autoLogoutRedirect', window.location.pathname);

        // Use imported store instead of window.store
        try {
          // This assumes you have a logout action in your auth slice
          const logoutAction = { type: 'auth/logout' };

          // Check if we're in a browser environment
          if (typeof window !== 'undefined') {
            // Redirect to login page
            window.location.href = '/login?timeout=true';
          }
        } catch (error) {
          console.error('Error during auto logout:', error);
        }
      }
    }, timeout);
  };

  // Set initial timer
  resetTimer();

  // Reset timer on user activity
  const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
  events.forEach(event => {
    document.addEventListener(event, resetTimer);
  });

  // Store event listeners for cleanup
  window.autoLogoutEvents = events;

  console.log(`Auto logout set for ${minutes} minutes`);
};

// Clear auto logout timer
const clearAutoLogout = () => {
  if (autoLogoutTimer) {
    clearTimeout(autoLogoutTimer);
    autoLogoutTimer = null;
  }

  // Remove event listeners
  if (window.autoLogoutEvents && Array.isArray(window.autoLogoutEvents)) {
    const resetTimer = () => {}; // Empty function for cleanup
    window.autoLogoutEvents.forEach(event => {
      document.removeEventListener(event, resetTimer);
    });
    window.autoLogoutEvents = null;
  }
};

// Auto save timer reference
let autoSaveTimer = null;

// Setup auto save timer
const setupAutoSave = (minutes) => {
  // Clear any existing timer
  clearAutoSave();

  // Convert minutes to milliseconds
  const interval = parseInt(minutes, 10) * 60 * 1000;

  // Set up periodic save
  autoSaveTimer = setInterval(() => {
    // Perform auto save action
    const autoSaveEvent = new CustomEvent('autoSave');
    window.dispatchEvent(autoSaveEvent);

    console.log('Auto save triggered');
  }, interval);

  console.log(`Auto save set for every ${minutes} minutes`);
};

// Clear auto save timer
const clearAutoSave = () => {
  if (autoSaveTimer) {
    clearInterval(autoSaveTimer);
    autoSaveTimer = null;
  }
};

// Enable data encryption
const enableDataEncryption = () => {
  // This is a placeholder for actual encryption implementation
  window.dataEncryptionEnabled = true;
  console.log('Data encryption enabled');
};

// Update user display name
const updateUserDisplayName = (displayName) => {
  // This is a placeholder for actual user profile update
  try {
    // Update in localStorage for persistence
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
      const user = JSON.parse(currentUser);
      user.displayName = displayName;
      localStorage.setItem('currentUser', JSON.stringify(user));
    }

    console.log(`User display name updated to: ${displayName}`);
  } catch (error) {
    console.error('Error updating user display name:', error);
  }
};

// Apply language setting
const applyLanguage = (language) => {
  // Set language attribute on html element
  document.documentElement.setAttribute('lang', language);

  // This is a placeholder for actual language change implementation
  window.appLanguage = language;

  // Dispatch language change event
  const languageChangeEvent = new CustomEvent('languageChange', { detail: { language } });
  window.dispatchEvent(languageChangeEvent);

  console.log(`Language set to: ${language}`);
};

// Get initial settings from localStorage
const initialSettings = getSettingsFromStorage();

// Apply initial settings
applySettings(initialSettings);

// Create the settings slice
const settingsSlice = createSlice({
  name: 'settings',
  initialState: initialSettings,
  reducers: {
    updateSettings: (state, action) => {
      const { category, settings } = action.payload;
      state[category] = {
        ...state[category],
        ...settings
      };

      // Save to localStorage
      saveSettingsToStorage(state);

      // Apply settings
      applySettings(state);
    },
    resetSettings: (state) => {
      const defaultSettings = getDefaultSettings();
      Object.keys(defaultSettings).forEach(category => {
        state[category] = defaultSettings[category];
      });

      // Save to localStorage
      saveSettingsToStorage(state);

      // Apply settings
      applySettings(state);
    }
  }
});

// Export actions
export const { updateSettings, resetSettings } = settingsSlice.actions;

// Export selectors
export const selectAllSettings = (state) => state.settings;
export const selectAppearanceSettings = (state) => state.settings.appearance;
export const selectNotificationSettings = (state) => state.settings.notifications;
export const selectAccountSettings = (state) => state.settings.account;
export const selectPrivacySettings = (state) => state.settings.privacy;
export const selectDataSettings = (state) => state.settings.data;

export default settingsSlice.reducer;
