/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors:{
        // primary: s"var(--color-primary-text) / <alpha-value>",
        primary: "oklch(from var(--color-primary-text) l c h / <alpha-value>)",
        secondary: "oklch(from var(--color-secondary-text) l c h / <alpha-value>)",
        secondaryHover: "oklch(from var(--color-secondary-text-hover) l c h / <alpha-value>)",
        hover: "oklch(from var(--color-hover) l c h / <alpha-value>)",
        btn: "oklch(from var(--color-btn) l c h / <alpha-value>)",
        btnSubtle: "oklch(from var(--color-btn-subtle) l c h / <alpha-value>)",
        btnText: "oklch(from var(--color-btn-text) l c h / <alpha-value>)",
        btnHover: "oklch(from var(--color-btn-hover) l c h / <alpha-value>)",
        sidebar: "oklch(from var(--color-sidebar) l c h / <alpha-value>)",
        feedBtn: "oklch(from var(--color-feed-btn) l c h / <alpha-value>)",
        feedTypeBtnHover: "oklch(from var(--color-feedtype-btn-hover) l c h / <alpha-value>)",
        feedColumnBG: "oklch(from var(--color-fc-bg) l c h / <alpha-value>)",
        postBG: "oklch(from var(--color-post-bg) l c h / <alpha-value>)",
        postMsg: "oklch(from var(--color-post-msg) l c h / <alpha-value>)",
        postFocusBG: "oklch(from var(--color-post-focus-bg) l c h / <alpha-value>)",
        outline: "oklch(from var(--color-border) l c h / <alpha-value>)",
        outlineLighter: "oklch(from var(--color-border-lighter) l c h / <alpha-value>)",
        banner: "oklch(from var(--color-banner) l c h / <alpha-value>)",
        focusBG: "oklch(from var(--color-user-focus-bg) l c h / <alpha-value>)",
        disabled: "oklch(from var(--color-disabled) l c h / <alpha-value>)",
        disabledBG: "oklch(from var(--color-disabled-bg) l c h / <alpha-value>)",
        toggleButton: "oklch(from var(--color-toggle-button) l c h / <alpha-value>)",
        toggleGutter: "oklch(from var(--color-toggle-gutter) l c h / <alpha-value>)",
        checkboxHover: "oklch(from var(--color-checkbox-hover) l c h / <alpha-value>)",
        feedHighlight: "oklch(from var(--color-feed-highlight) l c h / <alpha-value>)",
        viewportBG: "oklch(from var(--color-viewport-background) l c h / <alpha-value>)",
        messageDismiss: "oklch(from var(--color-message-dismiss) l c h / <alpha-value>)",
        loginHighlight: "oklch(from var(--color-login-highlight) l c h / <alpha-value>)",
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

