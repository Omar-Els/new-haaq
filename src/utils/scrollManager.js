/**
 * وظائف إدارة موضع التمرير
 * 
 * هذا الملف يحتوي على وظائف لحفظ واستعادة موضع التمرير في التطبيق
 */

// حفظ موضع التمرير الحالي
export const saveScrollPosition = (key = 'lastScrollPosition') => {
  const scrollPosition = {
    x: window.scrollX,
    y: window.scrollY,
    path: window.location.pathname,
    timestamp: Date.now()
  };
  
  localStorage.setItem(key, JSON.stringify(scrollPosition));
};

// استعادة موضع التمرير المحفوظ
export const restoreScrollPosition = (key = 'lastScrollPosition') => {
  try {
    const savedPosition = localStorage.getItem(key);
    
    if (savedPosition) {
      const { x, y, path, timestamp } = JSON.parse(savedPosition);
      
      // تحقق مما إذا كان الموضع المحفوظ للصفحة الحالية
      if (path === window.location.pathname) {
        // تحقق مما إذا كان الموضع المحفوظ حديثًا (أقل من 5 دقائق)
        const fiveMinutes = 5 * 60 * 1000;
        if (Date.now() - timestamp < fiveMinutes) {
          window.scrollTo(x, y);
          return true;
        }
      }
    }
    
    return false;
  } catch (error) {
    console.error('Error restoring scroll position:', error);
    return false;
  }
};

// إضافة مستمعي الأحداث لحفظ موضع التمرير
export const setupScrollManager = () => {
  // حفظ موضع التمرير عند تغيير الصفحة
  window.addEventListener('beforeunload', () => {
    saveScrollPosition();
  });
  
  // حفظ موضع التمرير بشكل دوري
  const saveInterval = setInterval(() => {
    saveScrollPosition('periodicScrollPosition');
  }, 5000); // كل 5 ثوانٍ
  
  // استعادة موضع التمرير عند تحميل الصفحة
  window.addEventListener('load', () => {
    // محاولة استعادة الموضع المحفوظ عند الخروج أولاً
    if (!restoreScrollPosition()) {
      // إذا فشل، حاول استعادة الموضع المحفوظ دوريًا
      restoreScrollPosition('periodicScrollPosition');
    }
  });
  
  // تنظيف عند إزالة المكون
  return () => {
    clearInterval(saveInterval);
  };
};

export default {
  saveScrollPosition,
  restoreScrollPosition,
  setupScrollManager
};
