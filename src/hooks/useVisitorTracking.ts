import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface VisitorData {
  ip_address?: string;
  user_agent: string;
  device_type: string;
  browser: string;
  operating_system: string;
  screen_resolution: string;
  timezone: string;
  language: string;
  referrer: string;
  session_id: string;
  is_mobile: boolean;
  country?: string;
  city?: string;
}

const generateSessionId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const detectDeviceType = (): string => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('mobile') || userAgent.includes('android') || userAgent.includes('iphone')) {
    return 'Mobile';
  } else if (userAgent.includes('tablet') || userAgent.includes('ipad')) {
    return 'Tablet';
  }
  return 'Desktop';
};

const detectBrowser = (): string => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('chrome')) return 'Chrome';
  if (userAgent.includes('firefox')) return 'Firefox';
  if (userAgent.includes('safari') && !userAgent.includes('chrome')) return 'Safari';
  if (userAgent.includes('edge')) return 'Edge';
  if (userAgent.includes('opera')) return 'Opera';
  return 'Unknown';
};

const detectOS = (): string => {
  const userAgent = navigator.userAgent.toLowerCase();
  if (userAgent.includes('windows')) return 'Windows';
  if (userAgent.includes('mac')) return 'macOS';
  if (userAgent.includes('linux')) return 'Linux';
  if (userAgent.includes('android')) return 'Android';
  if (userAgent.includes('ios') || userAgent.includes('iphone') || userAgent.includes('ipad')) return 'iOS';
  return 'Unknown';
};

const anonymizeIP = (ip: string): string => {
  // Anonymize IPv4 by zeroing last octet (e.g., 192.168.1.1 -> 192.168.1.0)
  // This preserves geolocation accuracy while improving privacy
  const ipv4Regex = /^(\d{1,3}\.\d{1,3}\.\d{1,3})\.\d{1,3}$/;
  const match = ip.match(ipv4Regex);
  if (match) {
    return `${match[1]}.0`;
  }
  // For IPv6, return first 64 bits (network portion)
  if (ip.includes(':')) {
    const parts = ip.split(':');
    return parts.slice(0, 4).join(':') + '::';
  }
  return ip; // Return as-is if format not recognized
};

const getLocationData = async (): Promise<{ country?: string; city?: string; ip?: string }> => {
  try {
    const response = await fetch('https://ipapi.co/json/');
    const data = await response.json();
    return {
      country: data.country_name,
      city: data.city,
      ip: data.ip ? anonymizeIP(data.ip) : undefined
    };
  } catch {
    return {};
  }
};

export const useVisitorTracking = () => {
  useEffect(() => {
    const trackVisitor = async () => {
      try {
        const locationData = await getLocationData();
        
        let sessionId = sessionStorage.getItem('visitor_session_id');
        if (!sessionId) {
          sessionId = generateSessionId();
          sessionStorage.setItem('visitor_session_id', sessionId);
        }

        // Input validation and sanitization
        const userAgent = navigator.userAgent.substring(0, 500); // Limit length
        const referrer = document.referrer ? document.referrer.substring(0, 500) : 'Direct';
        const deviceType = detectDeviceType();
        const browser = detectBrowser();
        const os = detectOS();

        // Validate critical fields
        if (!userAgent || !deviceType || !browser || !os) {
          console.error('Missing required visitor data');
          return;
        }

        const visitorData: VisitorData = {
          ip_address: locationData.ip?.substring(0, 45) || undefined, // IPv6 max length
          user_agent: userAgent,
          device_type: deviceType,
          browser: browser,
          operating_system: os,
          screen_resolution: `${screen.width}x${screen.height}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone.substring(0, 100),
          language: navigator.language.substring(0, 10),
          referrer: referrer,
          session_id: sessionId.substring(0, 100),
          is_mobile: /Mobi|Android/i.test(navigator.userAgent),
          country: locationData.country?.substring(0, 100),
          city: locationData.city?.substring(0, 100),
        };

        const { error } = await supabase
          .from('visitors')
          .insert(visitorData);

        if (error) {
          console.error('Error tracking visitor:', error);
        }
      } catch (error) {
        console.error('Error tracking visitor:', error);
      }
    };

    // Track visitor on mount
    trackVisitor();
  }, []);
};