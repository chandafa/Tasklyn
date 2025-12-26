# **App Name**: TaskVerse

## Core Features:

- Dashboard Overview: Display stats (total tasks, completed today, overdue, upcoming), a full-month calendar view highlighting days with tasks, and progress bars for completion rates.
- Task List Management: Enable adding, editing, and deleting tasks with filtering (All/Active/Completed/Overdue/Upcoming), search, and sorting (Date/Priority/Name).
- Task Details Modal: Provide a modal for detailed task information: title, description, priority (Low/Med/High), due date picker, subtasks checklist, progress bar (0-100%), tags/categories, and status toggle (Pending/In Progress/Completed).
- Calendar Integration: Implement a full calendar view (react-big-calendar or shadcn calendar) where users can click dates to add tasks, drag & drop tasks to different dates, and toggle between weekly/monthly views.
- User Authentication: Secure user accounts for personalized task management and data privacy.
- PWA Support: Enable Progressive Web App (PWA) features using next-pwa for installability and offline access.
- Smart Tagging Tool: AI-powered tool to suggest relevant tags based on the task description, streamlining organization and search.

## Style Guidelines:

- Primary color: Dark background (#0a0a0a) for a premium, elegant feel.
- Secondary color: Card background (#1a1a1a) to maintain the dark theme consistency.
- Tertiary color: Lighter card background (#2a2a2a) to create visual hierarchy.
- Accent color: Indigo (#6366f1) for interactive elements and highlights.
- Font: 'Inter' (sans-serif) for a clean and modern look.
- Gradients: subtle gradients on headings for visual appeal.
- Glassmorphism: Apply backdrop-blur-xl, bg-black/20, border border-white/10 to cards for a frosted glass effect.
- Responsive design: mobile-first approach using Tailwind CSS breakpoints.
- Page Layout: Left sidebar (mobile collapsible), main content with a responsive grid, header with search + notifications.
- Framer Motion: use hover scale effects, slide-in animations, and animated progress bar fills.