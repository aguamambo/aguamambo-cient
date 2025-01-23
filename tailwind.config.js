/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{html,ts}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        'deep-dark': '#1f2937',
        'medium-dark': '#152026',
        'light-mode': '#FFFFFF',
        'primary-dark-text': '#F0F0F0',
        'primary-light-text': '#333333',
        'scrollbar-thumb': '#21B4FD',
        'scrollbar-track': '#21B4FD'
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
  plugins: [
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
}