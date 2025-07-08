import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { selectTheme } from '../features/ui/themeSlice';

const ThemeProvider = ({ children }) => {
  const theme = useSelector(selectTheme);

  useEffect(() => {
    // تطبيق الثيم على عنصر HTML
    const htmlElement = document.documentElement;
    
    if (theme === 'dark') {
      htmlElement.setAttribute('data-theme', 'dark');
      htmlElement.classList.add('dark-mode');
    } else {
      htmlElement.setAttribute('data-theme', 'light');
      htmlElement.classList.remove('dark-mode');
    }

    // حفظ الثيم في localStorage
    localStorage.setItem('theme', theme);
    
    console.log(`🎨 تم تطبيق الثيم: ${theme}`);
  }, [theme]);

  return <>{children}</>;
};

export default ThemeProvider; 