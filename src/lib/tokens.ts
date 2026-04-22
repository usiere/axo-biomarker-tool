export const tokens = {
  colors: {
    background: '#FAFAF9',
    ink: '#0A0A0A',
    border: '#E7E5E4',
    muted: '#78716C',
    mutedLight: '#A8A29E',
    hover: '#F5F5F4',

    // Status colors
    optimal: '#15803D',
    normal: '#CA8A04',
    outOfRange: '#B91C1C',

    // Grays for subtle elements
    gray: {
      50: '#F9F9F8',
      100: '#F5F5F4',
      200: '#E7E5E4',
      300: '#D6D3D1',
      400: '#A8A29E',
      500: '#78716C',
      600: '#57534E',
      700: '#44403C',
      800: '#292524',
      900: '#1C1917',
    }
  },

  typography: {
    // Font sizes - globally smaller
    text: {
      xs: '10.5px',
      sm: '11.5px',
      base: '13.5px',
      lg: '14px',
      xl: '16px',
      '2xl': '20px',
      '3xl': '24px',
      '4xl': '32px',
      '5xl': '48px',
      '6xl': '56px',
    },

    // Letter spacing
    tracking: {
      tight: '-0.03em',
      normal: '0em',
      wide: '0.05em',
      wider: '0.15em',
    }
  },

  spacing: {
    grain: '1.5%', // Opacity for grain texture
  }
} as const;