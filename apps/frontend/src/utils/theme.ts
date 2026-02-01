// White-label theme configuration
export interface ThemeConfig {
  primaryColor: string;
  accentColor: string;
  logoUrl?: string;
  brandName: string;
  faviconUrl?: string;
}

// Default theme (Callvia Certo)
export const defaultTheme: ThemeConfig = {
  primaryColor: '#3b82f6', // Blue
  accentColor: '#22c55e', // Green
  brandName: 'Callvia Certo',
};

// Apply theme to the document
export function applyTheme(theme: Partial<ThemeConfig>) {
  const root = document.documentElement;
  
  if (theme.primaryColor) {
    // Convert hex to RGB for generating color shades
    const rgb = hexToRgb(theme.primaryColor);
    if (rgb) {
      // Generate color palette
      root.style.setProperty('--color-primary-50', lighten(rgb, 0.95));
      root.style.setProperty('--color-primary-100', lighten(rgb, 0.9));
      root.style.setProperty('--color-primary-200', lighten(rgb, 0.8));
      root.style.setProperty('--color-primary-300', lighten(rgb, 0.6));
      root.style.setProperty('--color-primary-400', lighten(rgb, 0.4));
      root.style.setProperty('--color-primary-500', theme.primaryColor);
      root.style.setProperty('--color-primary-600', darken(rgb, 0.1));
      root.style.setProperty('--color-primary-700', darken(rgb, 0.2));
      root.style.setProperty('--color-primary-800', darken(rgb, 0.3));
      root.style.setProperty('--color-primary-900', darken(rgb, 0.4));
    }
  }
  
  if (theme.accentColor) {
    const rgb = hexToRgb(theme.accentColor);
    if (rgb) {
      root.style.setProperty('--color-accent-50', lighten(rgb, 0.95));
      root.style.setProperty('--color-accent-100', lighten(rgb, 0.9));
      root.style.setProperty('--color-accent-200', lighten(rgb, 0.8));
      root.style.setProperty('--color-accent-300', lighten(rgb, 0.6));
      root.style.setProperty('--color-accent-400', lighten(rgb, 0.4));
      root.style.setProperty('--color-accent-500', theme.accentColor);
      root.style.setProperty('--color-accent-600', darken(rgb, 0.1));
      root.style.setProperty('--color-accent-700', darken(rgb, 0.2));
      root.style.setProperty('--color-accent-800', darken(rgb, 0.3));
      root.style.setProperty('--color-accent-900', darken(rgb, 0.4));
    }
  }
  
  if (theme.brandName) {
    document.title = theme.brandName;
  }
  
  if (theme.faviconUrl) {
    const link = document.querySelector("link[rel*='icon']") as HTMLLinkElement || document.createElement('link');
    link.type = 'image/x-icon';
    link.rel = 'shortcut icon';
    link.href = theme.faviconUrl;
    document.getElementsByTagName('head')[0].appendChild(link);
  }
}

// Utility functions
function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null;
}

function lighten(rgb: { r: number; g: number; b: number }, factor: number): string {
  const r = Math.round(rgb.r + (255 - rgb.r) * factor);
  const g = Math.round(rgb.g + (255 - rgb.g) * factor);
  const b = Math.round(rgb.b + (255 - rgb.b) * factor);
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

function darken(rgb: { r: number; g: number; b: number }, factor: number): string {
  const r = Math.round(rgb.r * (1 - factor));
  const g = Math.round(rgb.g * (1 - factor));
  const b = Math.round(rgb.b * (1 - factor));
  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// Fetch tenant theme from API
export async function fetchTenantTheme(tenantId: string): Promise<ThemeConfig> {
  try {
    // TODO: Replace with actual API call
    const response = await fetch(`/api/v1/tenants/${tenantId}/white-label`);
    if (response.ok) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to fetch tenant theme:', error);
  }
  return defaultTheme;
}
