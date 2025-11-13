import { useState, useEffect } from 'react';

export function useDeviceType() {
  const [deviceType, setDeviceType] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');

  useEffect(() => {
    const checkDeviceType = () => {
      const width = window.innerWidth;
      
      if (width < 768) {
        setDeviceType('mobile');
      } else if (width < 1024) {
        setDeviceType('tablet');
      } else {
        setDeviceType('desktop');
      }
    };

    // Check initial device type
    checkDeviceType();

    // Add resize listener
    const handleResize = () => {
      checkDeviceType();
    };

    window.addEventListener('resize', handleResize);
    
    // Also check on orientation change for mobile devices
    window.addEventListener('orientationchange', checkDeviceType);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', checkDeviceType);
    };
  }, []);

  return deviceType;
}