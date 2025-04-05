
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
				},
				locallink: {
					primary: '#2F855A', // green-700 (changed from blue to green)
					secondary: '#38A169', // green-600
					accent: '#805AD5', // violet-600
					background: '#F0FFF4', // green-50
					foreground: '#22543D', // green-900
					success: '#10B981', // emerald-500
					warning: '#F59E0B', // amber-500
					error: '#EF4444', // red-500
					muted: '#4A5568', // gray-600
				},
				nature: {
					leaf: '#48BB78', // green-500
					forest: '#276749', // green-800
					mountain: '#718096', // gray-500
					sky: '#4299E1', // blue-500
					earth: '#D69E2E', // yellow-600
					water: '#3182CE', // blue-600
					sunset: '#ED8936', // orange-500
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'pulse-ping': {
					'0%, 100%': { transform: 'scale(1)', opacity: '1' },
					'50%': { transform: 'scale(1.2)', opacity: '0.7' },
				},
				'fade-in': {
					'0%': { opacity: '0' },
					'100%': { opacity: '1' },
				},
				'slide-up': {
					'0%': { transform: 'translateY(10px)', opacity: '0' },
					'100%': { transform: 'translateY(0)', opacity: '1' },
				},
				'sway': {
					'0%, 100%': { transform: 'rotate(-3deg)' },
					'50%': { transform: 'rotate(3deg)' },
				},
				'float': {
					'0%, 100%': { transform: 'translateY(0)' },
					'50%': { transform: 'translateY(-10px)' },
				},
				'shimmer': {
					'0%': { backgroundPosition: '-200% 0' },
					'100%': { backgroundPosition: '200% 0' },
				},
				'leaves-fall': {
					'0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
					'100%': { transform: 'translateY(100px) rotate(45deg)', opacity: '0' },
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'pulse-ping': 'pulse-ping 2s ease-in-out infinite',
				'fade-in': 'fade-in 0.5s ease-out',
				'slide-up': 'slide-up 0.3s ease-out',
				'sway': 'sway 6s ease-in-out infinite',
				'float': 'float 4s ease-in-out infinite',
				'shimmer': 'shimmer 3s linear infinite',
				'leaves-fall': 'leaves-fall 10s linear infinite',
			},
			backgroundImage: {
				'gradient-forest': 'linear-gradient(to bottom, #276749, #48BB78)',
				'gradient-sunset': 'linear-gradient(to right, #ED8936, #F6AD55)',
				'gradient-mountain': 'linear-gradient(to bottom, #A0AEC0, #F7FAFC)',
				'gradient-sky': 'linear-gradient(184.1deg, #EBF8FF 44.7%, #BEE3F8 67.2%)',
				'texture-paper': "url('/textures/paper.png')",
				'texture-wood': "url('/textures/wood.png')",
			},
			fontFamily: {
				'nature': ['"Playfair Display"', 'serif'],
				'adventure': ['"Montserrat"', 'sans-serif'],
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
