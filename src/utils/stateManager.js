/**
 * State Manager Utility
 * 
 * This utility provides functions to save and load application state
 * to ensure persistence across page refreshes.
 */

const APP_STATE_KEY = 'app_current_state';

/**
 * Save current application state to localStorage
 * 
 * @param {Object} state - The state object to save
 */
export const saveAppState = (state) => {
  try {
    localStorage.setItem(APP_STATE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Error saving app state:', error);
  }
};

/**
 * Load saved application state from localStorage
 * 
 * @returns {Object|null} The saved state or null if not found
 */
export const loadAppState = () => {
  try {
    const savedState = localStorage.getItem(APP_STATE_KEY);
    
    if (!savedState) {
      return null;
    }
    
    const parsedState = JSON.parse(savedState);
    
    // Check if state is too old (more than 24 hours)
    const now = Date.now();
    const stateAge = now - (parsedState.timestamp || 0);
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    if (stateAge > maxAge) {
      // State is too old, clear it
      localStorage.removeItem(APP_STATE_KEY);
      return null;
    }
    
    return parsedState;
  } catch (error) {
    console.error('Error loading app state:', error);
    return null;
  }
};

/**
 * Clear saved application state
 */
export const clearAppState = () => {
  try {
    localStorage.removeItem(APP_STATE_KEY);
  } catch (error) {
    console.error('Error clearing app state:', error);
  }
};