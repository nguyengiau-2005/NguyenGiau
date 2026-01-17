/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#219ec8';
const tintColorDark = '#fff';

export const Colors = {
  light: {
    text: '#0d61b0',
    background: '#F7FAFC',
    tint: tintColorLight,
    icon: '#687076',
    tabIconDefault: '#687076',
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#ECEDEE',
    background: '#5ab9e9',
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
  // Deep Navy-Blue Professional Theme (Xanh navy chuyên nghiệp)
  // Core palette
  primary: '#3570d6',        // deep navy blue (main - trầm tính)
  primaryLight: '#EDF2F7',   // light blue-gray tint
  primaryDark: '#7e9ddb',    // very dark navy for CTAs
  primaryGradient: ['#2D3748', '#4A5568'] as const,
  brandGradient: ['#2D3748', '#1A202C'] as const,

  // Contrast / surface tokens
  background: '#F7FAFC',     // clean light background
  surface: '#FFFFFF',        // pure white for cards
  surfaceElevated: '#F8FAFC',

  // Text colors - trầm tính và dễ đọc
  textPrimary: '#1A202C',    // very dark for high contrast
  textSecondary: '#4A5568',
  textMuted: '#718096',

  // On-colors (what color to use on top of primary / surface)
  onPrimary: '#FFFFFF',
  onSurface: '#1A202C',

  // Utility - màu trầm
  disabled: '#A0AEC0',
  divider: '#E2E8F0',
};

export default { Colors, Fonts, AppColors };
