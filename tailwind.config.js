const defaultTheme = require("tailwindcss/defaultTheme");

/** @type {import('tailwindcss').Config} */
module.exports = {
    darkMode: ["class"],
    content: [
        "./vendor/laravel/framework/src/Illuminate/Pagination/resources/views/*.blade.php",
        "./storage/framework/views/*.php",
        "./resources/views/**/*.blade.php",
        "./resources/ts/**/*.tsx",
    ],

    theme: {
        extend: {
            fontFamily: {
                sans: ["Nunito", ...defaultTheme.fontFamily.sans],
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 4px)",
                sm: "calc(var(--radius) - 8px)",
                xl: "calc(var(--radius) + 8px)",
                "2xl": "calc(var(--radius) + 16px)",
                "3xl": "calc(var(--radius) + 24px)",
            },
            colors: {
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",

                // Custom colors dari design system
                "primary-soft": "hsl(var(--primary-soft))",
                "primary-glow": "hsl(var(--primary-glow))",
                sky: "hsl(var(--sky))",
                mint: "hsl(var(--mint))",
                peach: "hsl(var(--peach))",
                lavender: "hsl(var(--lavender))",

                primary: {
                    DEFAULT: "hsl(var(--primary))",
                    foreground: "hsl(var(--primary-foreground))",
                },
                secondary: {
                    DEFAULT: "hsl(var(--secondary))",
                    foreground: "hsl(var(--secondary-foreground))",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "hsl(var(--accent))",
                    foreground: "hsl(var(--accent-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
            },
            boxShadow: {
                soft: "var(--shadow-soft)",
                card: "var(--shadow-card)",
                float: "var(--shadow-float)",
            },

            keyframes: {
                "accordion-down": {
                    from: {
                        height: "0",
                    },
                    to: {
                        height: "var(--radix-accordion-content-height)",
                    },
                },
                "accordion-up": {
                    from: {
                        height: "var(--radix-accordion-content-height)",
                    },
                    to: {
                        height: "0",
                    },
                },
                float: {
                    "0%, 100%": { transform: "translateY(0)" },
                    "50%": { transform: "translateY(-8px)" },
                },
                blob: {
                    "0%, 100%": { transform: "translate(0, 0) scale(1)" },
                    "33%": { transform: "translate(20px, -30px) scale(1.1)" },
                    "66%": { transform: "translate(-20px, 20px) scale(0.95)" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                float: "float 4s ease-in-out infinite",
                blob: "blob 12s ease-in-out infinite",
            },
        },
    },

    plugins: [require("@tailwindcss/forms"), require("tailwindcss-animate")],
};
