// theme.js
import { createTheme } from '@mui/material/styles';

const wineColors = {
  primary: '#8b3a3a', // Dark red (wine color)
  secondary: '#FFD700', // Gold
  accent: '#6A5ACD', // Slate blue
  background: '#F5F5F5', // Light background
  text: {
    primary: '#333333', // Dark gray for primary text
    secondary: '#666666', // Medium gray for secondary text
  },
  // Additional Colors
  lightRed: '#D64D4D', // Light red (to contrast with dark red)
  softPink: '#FFB6C1', // Soft pink (to soften the palette)
  oliveGreen: '#556B2F', // Olive green (natural, wine-related)
 // warmBeige: '#F5F5DC', // Warm beige (neutral for backgrounds)
  deepBlue: '#00008B', // Deep blue (to enhance the accent)
  burgundy: '#800020', // Burgundy (rich wine color)
  cream: '#FFFDD0', // Cream (light, neutral color)
  charcoal: '#444444', // Charcoal gray (for darker text)
  mutedGold: '#DAA520', // Muted gold (darker tone for secondary accents)
  lavender: '#E6E6FA', // Lavender (soft accent color)
  success: '#28a745', // Success green
  danger: '#dc3545', // Danger red
  info: '#17a2b8', // Info blue
  warning: '#ffc107', // Warning yellow
  light: '#f8f9fa', // Light background for buttons
  dark: '#343a40', // Dark text color
  muted: '#6c757d', // Muted gray for subtle elements
};

const theme = createTheme({
  palette: {
    primary: {
      main: wineColors.primary,
      light: wineColors.lightRed,
      dark: wineColors.burgundy,
    },
    secondary: {
      main: wineColors.secondary,
      light: wineColors.mutedGold,
      dark: '#b59400', // Darker gold for contrast
    },
    background: {
      default: wineColors.background,
      paper: wineColors.background, // Background for paper components
    },
    text: {
      primary: wineColors.text.primary,
      secondary: wineColors.text.secondary,
    },
    success: {
      main: wineColors.success,
    },
    danger: {
      main: wineColors.danger,
    },
    info: {
      main: wineColors.info,
    },
    warning: {
      main: wineColors.warning,
    },
  },
  typography: {
    fontFamily: '"Georgia", "serif"', // Elegant font for a sophisticated feel
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      color: wineColors.primary,
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      color: wineColors.primary,
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 500,
      color: wineColors.primary,
    },
    body1: {
      fontSize: '1rem',
      color: wineColors.text.primary,
    },
    button: {
      textTransform: 'none', // Remove uppercase transformation
      fontWeight: 600,
      color: '#FFFFFF',
      borderRadius: '8px',
    },
  },
});

export default theme;
