/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class', // Added darkMode configuration
  theme: {
    extend: {
      colors: {
        // Custom colors from your existing config
        'deep-dark': '#1f2937',
        'medium-dark': '#152026',
        'light-mode': '#FFFFFF',
        'primary-dark-text': '#F0F0F0',
        'primary-light-text': '#333333',
        'scrollbar-thumb': '#21B4FD',
        'scrollbar-track': '#21B4FD',

        // Shadcn-inspired color palette (you can adjust these hex values)
        border: 'hsl(214.3 31.8% 91.4%)', // A light grey for borders
        input: 'hsl(214.3 31.8% 91.4%)',  // Similar to border for input fields
        ring: 'hsl(222.2 84% 4.9%)',     // A dark color for focus rings

        background: 'hsl(0 0% 100%)',    // White for light mode background
        foreground: 'hsl(222.2 84% 4.9%)', // Dark text on light background

        primary: 'hsl(222.2 47.4% 11.2%)', // A dark blue/charcoal for primary actions
        'primary-foreground': 'hsl(210 20% 98%)', // Light text on primary background

        secondary: 'hsl(210 40% 96.1%)', // A light grey for secondary actions
        'secondary-foreground': 'hsl(222.2 47.4% 11.2%)', // Dark text on secondary background

        destructive: 'hsl(0 84.2% 60.2%)', // A red for destructive actions
        'destructive-foreground': 'hsl(210 20% 98%)', // Light text on destructive background

        accent: 'hsl(210 40% 96.1%)',    // Similar to secondary for accents/hover states
        'accent-foreground': 'hsl(222.2 47.4% 11.2%)', // Dark text on accent background

        popover: 'hsl(0 0% 100%)',       // White for popover background
        'popover-foreground': 'hsl(222.2 47.4% 11.2%)', // Dark text on popover background

        card: 'hsl(0 0% 100%)',          // White for card background
        'card-foreground': 'hsl(222.2 47.4% 11.2%)', // Dark text on card background
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: 0 },
          '100%': { opacity: 1 },
        },
      }
    },
  },
  plugins: [ // Added your plugins configuration
    function ({ addUtilities }) {
      addUtilities({
        '.scrollbar-hide': {
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.scrollbar-custom': {
          'scrollbar-width': 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: '#21B4FD',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: '#21B4FD',
            borderRadius: '9999px',
          },
        },
      });
    },
  ],
};
