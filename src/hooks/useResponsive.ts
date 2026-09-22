import { useState, useEffect } from 'react';

export type DeviceType = 'mobile' | 'tablet' | 'desktop';

export interface ViewportState {
  width: number;
  height: number;
  isMobile: boolean; // < 768px
  isTablet: boolean; // 768px - 1023px
  isDesktop: boolean; // >= 1024px
  isSmallMobile: boolean; // < 380px
  isLargeMobile: boolean; // 380px - 767px
  isLandscape: boolean;
  deviceType: DeviceType;
}

export function useResponsive(): ViewportState {
  const [state, setState] = useState<ViewportState>(() => {
    const w = typeof window !== 'undefined' ? window.innerWidth : 1200;
    const h = typeof window !== 'undefined' ? window.innerHeight : 800;
    const isMobile = w < 768;
    const isTablet = w >= 768 && w < 1024;
    const isDesktop = w >= 1024;

    return {
      width: w,
      height: h,
      isMobile,
      isTablet,
      isDesktop,
      isSmallMobile: w < 380,
      isLargeMobile: w >= 380 && w < 768,
      isLandscape: w > h,
      deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
    };
  });

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isMobile = w < 768;
      const isTablet = w >= 768 && w < 1024;
      const isDesktop = w >= 1024;

      setState({
        width: w,
        height: h,
        isMobile,
        isTablet,
        isDesktop,
        isSmallMobile: w < 380,
        isLargeMobile: w >= 380 && w < 768,
        isLandscape: w > h,
        deviceType: isMobile ? 'mobile' : isTablet ? 'tablet' : 'desktop',
      });
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('orientationchange', handleResize, { passive: true });

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, []);

  return state;
}
