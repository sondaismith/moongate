/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors:{
        primary: "var(--color-primary-text)",
        secondary: "var(--color-secondary-text)",
        secondaryHover: "var(--color-secondary-text-hover)",
        hover: "var(--color-hover)",
        btnText: "var(--color-btn-text)",
        sidebar: "var(--color-sidebar)",
        feedBtn: "var(--color-feed-btn)",
        feedColumnBG: "var(--color-fc-bg)",
        postBG: "var(--color-post-bg)",
        postMsg: "var(--color-post-msg)",
        postFocusBG: "var(--color-post-focus-bg)",
        outline: "var(--color-border)",
        outlineLighter: "var(--color-border-lighter)",
        banner: "var(--color-banner)",
        focusBG: "var(--color-user-focus-bg)",
        disabled: "var(--color-disabled)",
        toggleButton: "var(--color-toggle-button)",
        toggleGutter: "var(--color-toggle-gutter)",
        feedHighlight: "var(--color-feed-highlight)",
      },
      fontSize:{
        feedPostName: '0.75rem',
        feedTimestamp: '0.5rem', // 8px
      },
      dropShadow:{
        'md-harder': '0 4px 4px rgba(0, 0, 0, 0.75)'
      }
    },
  },
  plugins: [],
}

