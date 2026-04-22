@import "tailwindcss";
@import "tw-animate-css";

@custom-variant dark (&:is(.dark *));

/*
 * MeNova Health — Biophilic Wellness Modernism
 * Design tokens: Deep Forest Green #1A3C2E, Terracotta #C4714A, Cream #FAF7F2
 * Typography: Playfair Display (display/serif) + DM Sans (body/UI)
 */

@theme inline {
  --radius-sm: calc(var(--radius) - 4px);
  --radius-md: calc(var(--radius) - 2px);
  --radius-lg: var(--radius);
  --radius-xl: calc(var(--radius) + 4px);
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-card: var(--card);
  --color-card-foreground: var(--card-foreground);
  --color-popover: var(--popover);
  --color-popover-foreground: var(--popover-foreground);
  --color-primary: var(--primary);
  --color-primary-foreground: var(--primary-foreground);
  --color-secondary: var(--secondary);
  --color-secondary-foreground: var(--secondary-foreground);
  --color-muted: var(--muted);
  --color-muted-foreground: var(--muted-foreground);
  --color-accent: var(--accent);
  --color-accent-foreground: var(--accent-foreground);
  --color-destructive: var(--destructive);
  --color-destructive-foreground: var(--destructive-foreground);
  --color-border: var(--border);
  --color-input: var(--input);
  --color-ring: var(--ring);
  --color-chart-1: var(--chart-1);
  --color-chart-2: var(--chart-2);
  --color-chart-3: var(--chart-3);
  --color-chart-4: var(--chart-4);
  --color-chart-5: var(--chart-5);
  --color-sidebar: var(--sidebar);
  --color-sidebar-foreground: var(--sidebar-foreground);
  --color-sidebar-primary: var(--sidebar-primary);
  --color-sidebar-primary-foreground: var(--sidebar-primary-foreground);
  --color-sidebar-accent: var(--sidebar-accent);
  --color-sidebar-accent-foreground: var(--sidebar-accent-foreground);
  --color-sidebar-border: var(--sidebar-border);
  --color-sidebar-ring: var(--sidebar-ring);

  /* Custom brand tokens */
  --color-forest: oklch(0.24 0.07 155);
  --color-forest-dark: oklch(0.18 0.07 155);
  --color-forest-light: oklch(0.38 0.07 155);
  --color-terracotta: oklch(0.60 0.12 42);
  --color-terracotta-dark: oklch(0.50 0.12 42);
  --color-sage: oklch(0.55 0.06 155);
  --color-cream: oklch(0.98 0.01 90);
  --color-cream-dark: oklch(0.94 0.015 90);
  --color-charcoal: oklch(0.22 0.005 65);
}

:root {
  --radius: 0.5rem;
  --background: oklch(0.98 0.01 90);
  --foreground: oklch(0.22 0.005 65);
  --card: oklch(1 0 0);
  --card-foreground: oklch(0.22 0.005 65);
  --popover: oklch(1 0 0);
  --popover-foreground: oklch(0.22 0.005 65);
  --primary: oklch(0.24 0.07 155);
  --primary-foreground: oklch(0.98 0.01 90);
  --secondary: oklch(0.94 0.015 90);
  --secondary-foreground: oklch(0.22 0.005 65);
  --muted: oklch(0.94 0.01 90);
  --muted-foreground: oklch(0.50 0.01 65);
  --accent: oklch(0.60 0.12 42);
  --accent-foreground: oklch(0.98 0.01 90);
  --destructive: oklch(0.577 0.245 27.325);
  --destructive-foreground: oklch(0.985 0 0);
  --border: oklch(0.88 0.01 90);
  --input: oklch(0.88 0.01 90);
  --ring: oklch(0.24 0.07 155);
  --chart-1: oklch(0.24 0.07 155);
  --chart-2: oklch(0.60 0.12 42);
  --chart-3: oklch(0.55 0.06 155);
  --chart-4: oklch(0.38 0.07 155);
  --chart-5: oklch(0.50 0.12 42);
  --sidebar: oklch(0.98 0.01 90);
  --sidebar-foreground: oklch(0.22 0.005 65);
  --sidebar-primary: oklch(0.24 0.07 155);
  --sidebar-primary-foreground: oklch(0.98 0.01 90);
  --sidebar-accent: oklch(0.94 0.015 90);
  --sidebar-accent-foreground: oklch(0.22 0.005 65);
  --sidebar-border: oklch(0.88 0.01 90);
  --sidebar-ring: oklch(0.24 0.07 155);
}

@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
    font-family: 'DM Sans', system-ui, sans-serif;
  }
  h1, h2, h3, h4 {
    font-family: 'Playfair Display', Georgia, serif;
  }
  button:not(:disabled),
  [role="button"]:not([aria-disabled="true"]),
  [type="button"]:not(:disabled),
  [type="submit"]:not(:disabled),
  [type="reset"]:not(:disabled),
  a[href],
  select:not(:disabled),
  input[type="checkbox"]:not(:disabled),
  input[type="radio"]:not(:disabled) {
    @apply cursor-pointer;
  }
}

@layer components {
  .container {
    width: 100%;
    margin-left: auto;
    margin-right: auto;
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .flex {
    min-height: 0;
    min-width: 0;
  }

  @media (min-width: 640px) {
    .container {
      padding-left: 1.5rem;
      padding-right: 1.5rem;
    }
  }

  @media (min-width: 1024px) {
    .container {
      padding-left: 2rem;
      padding-right: 2rem;
      max-width: 1280px;
    }
  }

  /* Scroll animations */
  .fade-up {
    opacity: 0;
    transform: translateY(24px);
    transition: opacity 0.6s ease, transform 0.6s ease;
  }
  .fade-up.visible {
    opacity: 1;
    transform: translateY(0);
  }

  /* Marquee animation */
  @keyframes marquee {
    0% { transform: translateX(0); }
    100% { transform: translateX(-50%); }
  }
  .animate-marquee {
    animation: marquee 30s linear infinite;
  }

  /* Pill badge */
  .badge-forest {
    background-color: oklch(0.24 0.07 155 / 0.12);
    color: oklch(0.24 0.07 155);
    font-family: 'DM Sans', sans-serif;
    font-size: 0.7rem;
    font-weight: 600;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    display: inline-block;
  }

  /* Terracotta CTA button */
  .btn-terracotta {
    background-color: oklch(0.60 0.12 42);
    color: white;
    font-family: 'DM Sans', sans-serif;
    font-weight: 600;
    font-size: 0.875rem;
    letter-spacing: 0.05em;
    padding: 0.75rem 2rem;
    border-radius: 9999px;
    transition: background-color 0.2s ease, transform 0.15s ease;
    display: inline-block;
    text-decoration: none;
  }
  .btn-terracotta:hover {
    background-color: oklch(0.50 0.12 42);
    transform: translateY(-1px);
  }

  /* Forest CTA button */
  .btn-forest {
    background-color: oklch(0.24 0.07 155);
    color: oklch(0.98 0.01 90);
    font-family: 'DM Sans', sans-serif;
    font-weight: 600;
    font-size: 0.875rem;
    letter-spacing: 0.05em;
    padding: 0.75rem 2rem;
    border-radius: 9999px;
    transition: background-color 0.2s ease, transform 0.15s ease;
    display: inline-block;
    text-decoration: none;
  }
  .btn-forest:hover {
    background-color: oklch(0.18 0.07 155);
    transform: translateY(-1px);
  }

  /* Outline forest button */
  .btn-outline-forest {
    background-color: transparent;
    color: oklch(0.24 0.07 155);
    border: 1.5px solid oklch(0.24 0.07 155);
    font-family: 'DM Sans', sans-serif;
    font-weight: 600;
    font-size: 0.875rem;
    letter-spacing: 0.05em;
    padding: 0.75rem 2rem;
    border-radius: 9999px;
    transition: all 0.2s ease;
    display: inline-block;
    text-decoration: none;
  }
  .btn-outline-forest:hover {
    background-color: oklch(0.24 0.07 155);
    color: oklch(0.98 0.01 90);
  }

  /* Card hover */
  .card-hover {
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }
  .card-hover:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 32px oklch(0.24 0.07 155 / 0.12);
  }

  /* Section divider wave */
  .wave-divider svg {
    display: block;
  }
}
