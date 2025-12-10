/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#0a7ea4';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#0B1620',
    background: '#F7FAFC',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#151718',
    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

export const AppColors = {
  // Pink‑purple pastel theme (hồng ánh tím)
  // Core palette
  primary: '#E69FF6',        // pastel pink-purple (main)
  primaryLight: '#F9E8FB',   // very light/airy pink tint
  primaryDark: '#9B3FBF',    // darker purple for CTAs
  primaryGradient: ['#E69FF6', '#D08BF8'] as const,
  brandGradient: ['#E69FF6', '#B573FF'] as const,

  // Contrast / surface tokens
  background: '#FFF7FB',     // app background (soft pinkish white)
  surface: '#FFFFFF',        // cards and surfaces
  surfaceElevated: '#FFF9FE',

  // Text colors
  textPrimary: '#231428',    // deep muted purple for high contrast
  textSecondary: '#5F4660',
  textMuted: '#9F84A8',

  // On-colors (what color to use on top of primary / surface)
  onPrimary: '#FFFFFF',
  onSurface: '#231428',

  // Utility
  disabled: '#CBBED0',
  divider: '#F3E8F7',
};

export default { Colors, Fonts, AppColors };
