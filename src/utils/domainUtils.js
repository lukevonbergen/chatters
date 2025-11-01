// Utility functions for handling domain-specific URLs

export const isDevSite = () => {
  if (typeof window === 'undefined') return false;

  const hostname = window.location.hostname;
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';
  const isDevDomain = hostname.includes('dev') || hostname.includes('staging') || hostname.includes('test');
  const isVercelPreview = hostname.includes('vercel.app') && !hostname.includes('getchatters.com');

  return isLocalhost || isDevDomain || isVercelPreview;
};

export const getDashboardDomain = () => {
  if (typeof window === 'undefined') return 'my.getchatters.com';
  
  const hostname = window.location.hostname;
  
  // If we're on a dev environment (e.g., dev-001.getchatters.com)
  if (hostname.includes('-') && hostname.includes('.getchatters.com')) {
    const prefix = hostname.split('.getchatters.com')[0];
    return `${prefix}.my.getchatters.com`;
  }
  
  // Default production domain
  return 'my.getchatters.com';
};

export const getMarketingDomain = () => {
  if (typeof window === 'undefined') return 'getchatters.com';
  
  const hostname = window.location.hostname;
  
  // If we're on a dev environment (e.g., dev-001.my.getchatters.com)
  if (hostname.includes('-') && hostname.includes('.my.getchatters.com')) {
    const prefix = hostname.split('.my.getchatters.com')[0];
    return `${prefix}.getchatters.com`;
  }
  
  // Default production domain
  return 'getchatters.com';
};

export const getDashboardUrl = (path = '') => {
  const domain = getDashboardDomain();
  const protocol = window?.location?.protocol || 'https:';
  return `${protocol}//${domain}${path}`;
};

export const getMarketingUrl = (path = '') => {
  const domain = getMarketingDomain();
  const protocol = window?.location?.protocol || 'https:';
  return `${protocol}//${domain}${path}`;
};