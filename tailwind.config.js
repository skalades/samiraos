import defaultTheme from 'tailwindcss/defaultTheme';
import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
    content: [
        './vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php',
        './storage/framework/views/*.php',
        './resources/views/**/*.blade.php',
        './resources/js/**/*.jsx',
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ['"Hanken Grotesk"', ...defaultTheme.fontFamily.sans],
                mono: ['"JetBrains Mono"', ...defaultTheme.fontFamily.mono],
            },
            colors: {
                surface: '#f8f9ff',
                'surface-dim': '#cbdbf5',
                'surface-bright': '#f8f9ff',
                'surface-container-lowest': '#ffffff',
                'surface-container-low': '#eff4ff',
                'surface-container': '#e5eeff',
                'surface-container-high': '#dce9ff',
                'surface-container-highest': '#d3e4fe',
                'on-surface': '#0b1c30',
                'on-surface-variant': '#5d3f3b',
                'inverse-surface': '#213145',
                'inverse-on-surface': '#eaf1ff',
                outline: '#926f69',
                'outline-variant': '#e7bdb6',
                'surface-tint': '#c00301',
                primary: '#910000',
                'on-primary': '#ffffff',
                'primary-container': '#be0000', // Sami Raos Bold Red
                'on-primary-container': '#ffcac2',
                'inverse-primary': '#ffb4a8',
                secondary: '#5d5e61', // Deep Charcoal
                'on-secondary': '#ffffff',
                'secondary-container': '#e2e2e5',
                'on-secondary-container': '#636467',
                tertiary: '#434648',
                'on-tertiary': '#ffffff',
                'tertiary-container': '#5b5e60',
                'on-tertiary-container': '#d5d7d9',
                error: '#ba1a1a',
                'on-error': '#ffffff',
                'error-container': '#ffdad6',
                'on-error-container': '#93000a',
                'primary-fixed': '#ffdad4',
                'primary-fixed-dim': '#ffb4a8',
                'on-primary-fixed': '#410000',
                'on-primary-fixed-variant': '#930000',
                'secondary-fixed': '#e2e2e5',
                'secondary-fixed-dim': '#c6c6c9',
                'on-secondary-fixed': '#1a1c1e',
                'on-secondary-fixed-variant': '#454749',
                'tertiary-fixed': '#e0e3e5',
                'tertiary-fixed-dim': '#c4c7c9',
                'on-tertiary-fixed': '#191c1e',
                'on-tertiary-fixed-variant': '#444749',
                background: '#f8f9ff',
                'on-background': '#0b1c30',
                'surface-variant': '#d3e4fe',
                // Semantic Colors
                success: '#10b981', // Emerald
                warning: '#f59e0b', // Amber
                neutral: '#64748b', // Slate grey
            },
            fontSize: {
                'label-caps': ['12px', { lineHeight: '16px', letterSpacing: '0.05em', fontWeight: '700' }],
                'data-mono': ['13px', { lineHeight: '16px', fontWeight: '500' }],
                'body-md': ['14px', { lineHeight: '20px', fontWeight: '400' }],
                'body-lg': ['16px', { lineHeight: '24px', fontWeight: '400' }],
                'headline-sm': ['18px', { lineHeight: '24px', fontWeight: '600' }],
                'headline-md': ['24px', { lineHeight: '32px', fontWeight: '600' }],
                'headline-lg': ['32px', { lineHeight: '40px', letterSpacing: '-0.02em', fontWeight: '700' }],
            },
            borderRadius: {
                sm: '0.125rem',
                DEFAULT: '0.25rem',
                md: '0.375rem',
                lg: '0.5rem',
                xl: '0.75rem',
                full: '9999px',
            },
            spacing: {
                'gutter': '1.5rem',
                'margin-page': '2rem',
                'stack-sm': '0.5rem',
                'stack-md': '1rem',
                'stack-lg': '1.5rem',
            },
            maxWidth: {
                'container-max': '1440px',
            },
            boxShadow: {
                'level-1': '0 1px 3px 0 rgba(0, 0, 0, 0.04)',
                'level-2': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            }
        },
    },

    plugins: [forms],
};
