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
  // Sea‑blue cosmetic theme
  // Core palette
  primary: '#0EA5C9',        // sea blue (main)
  primaryLight: '#E6FBFD',   // very light sea tint
  primaryDark: '#057A90',    // darker sea for CTAs
  primaryGradient: ['#0EA5C9', '#2DD4BF'] as const,
  brandGradient: ['#0EA5C9', '#06B6D4'] as const,

  // Contrast / surface tokens
  background: '#F3FBFD',     // app background (soft sea white)
  surface: '#FFFFFF',        // cards and surfaces
  surfaceElevated: '#FBFEFF',

  // Text colors
  textPrimary: '#04323A',    // deep teal for high contrast
  textSecondary: '#3D6B73',
  textMuted: '#7AA1A6',

  // On-colors (what color to use on top of primary / surface)
  onPrimary: '#FFFFFF',
  onSurface: '#04323A',

  // Utility
  disabled: '#BFD7D9',
  divider: '#E6F7F8',
};

export default { Colors, Fonts, AppColors };
