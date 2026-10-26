/**
 * Single source of truth for the portfolio's content and SEO metadata.
 * Used by the React components and by the build-time prerender
 * (page <head>, JSON-LD, sitemap, robots.txt).
 *
 * Sections with no entries (experience, projects) are hidden automatically,
 * and removed from the navigation.
 */

export interface Job {
  company: string;
  companyLocation?: string;
  role: string;
  start: string; // 'YYYY-MM'
  end: string | null; // null = current position
  highlights: string[];
  tech?: string[];
}

export interface Degree {
  degree: string;
  school: string;
  start: string;
  end: string;
}

export interface Project {
  name: string;
  summary: string;
  tech: string[];
  url?: string; // live site
  repo?: string; // source code
}

export interface Social {
  label: 'GitHub' | 'LinkedIn' | 'Instagram';
  handle: string;
  url: string;
}

export const profile = {
  name: 'Alenui Rovis Mbah',
  shortName: 'ALENUI',
  alternateNames: ['Alenui Rovis', 'ALENUI'],
  jobTitle: 'Computer Engineer',
  headline: 'Front-end developer and UI/UX designer',
  intro:
    'I build responsive web apps with React and TypeScript, and lead UI/UX and brand design at Nexura Innovations.',
  // ~150 characters: what search engines show under the title.
  description:
    'Alenui Rovis Mbah is a computer engineer in Bamenda, Cameroon: a front-end developer working in React and TypeScript, and a UI/UX and brand designer.',
  about: [
    "I'm a computer engineer based in Bamenda, Cameroon. Most of my work is on the front end: building responsive web apps in React and TypeScript, wiring them up to APIs, and designing the interfaces in Figma before they get built.",
    'I studied computer science at the College of Technology, University of Bamenda, then did a master’s in data science, which is where my interest in machine learning comes from. Away from the keyboard I play guitar.',
  ],
  location: { city: 'Bamenda', region: 'North West', country: 'Cameroon', countryCode: 'CM' },
  availableForWork: true,

  // Replace with your custom domain once it is set up (the deploy workflow
  // also detects it automatically from the GitHub Pages settings).
  siteUrl: 'https://alenui.github.io/swe_portfolio',
  locale: 'en_US',

  email: 'rovisalenui@gmail.com',
  socials: [
    { label: 'GitHub', handle: 'ALENUI', url: 'https://github.com/ALENUI' },
    { label: 'LinkedIn', handle: 'Alenui Rovis', url: 'https://www.linkedin.com/in/alenui-rovis-23569727b/' },
    { label: 'Instagram', handle: '@alenui_graphics', url: 'https://www.instagram.com/alenui_graphics/' },
  ] as Social[],

  // Most recent first.
  experience: [
    {
      company: 'Galsie',
      companyLocation: 'Lebanon',
      role: 'Front-End Developer (Contract)',
      start: '2025-08',
      end: null,
      highlights: [
        'Building the views of the Galsite web application in HTML, CSS and TypeScript',
        'Implementing the view models in TypeScript',
      ],
      tech: ['TypeScript', 'HTML', 'CSS'],
    },
    {
      company: 'Nexura Innovations Ltd',
      companyLocation: 'Cameroon',
      role: 'UI/UX and Brand Design Lead',
      start: '2025-07',
      end: null,
      highlights: [
        'Lead and supervise the design team',
        'Shape the visual direction and concepts for client projects',
        'Design brand identities, and UI for web and mobile apps',
      ],
      tech: ['Figma', 'UI/UX', 'Branding'],
    },
    {
      company: 'DigitalSphere Inc.',
      companyLocation: 'Cameroon',
      role: 'Front-End Developer',
      start: '2024-01',
      end: null,
      highlights: [
        'Build responsive, dynamic web interfaces in React',
        'Worked on more than two dozen projects, from first concept to launch',
        'Debug and profile front-end code to improve performance',
      ],
      tech: ['React', 'JavaScript', 'TypeScript'],
    },
    {
      company: 'AFRIITECH',
      companyLocation: 'Bamenda, Cameroon',
      role: 'Front-End Developer Intern',
      start: '2022-07',
      end: '2022-08',
      highlights: [
        'Designed and built interactive web components with PHP and JavaScript',
        'Learned UI/UX design principles in Figma',
      ],
      tech: ['PHP', 'JavaScript', 'Figma'],
    },
  ] as Job[],

  education: [
    {
      degree: 'Master of Technology in Computer Science (Data Science)',
      school: 'College of Technology, University of Bamenda',
      start: '2023',
      end: '2025',
    },
    {
      degree: 'Bachelor of Technology in Computer Science',
      school: 'College of Technology, University of Bamenda',
      start: '2020',
      end: '2023',
    },
  ] as Degree[],

  // TODO: add 2–4 projects you're proud of (with links). The section is hidden while empty.
  projects: [] as Project[],

  skills: {
    Languages: ['TypeScript', 'JavaScript', 'PHP', 'Python', 'HTML', 'CSS'],
    'Frameworks & tools': ['React', 'Tailwind CSS', 'REST APIs', 'Git', 'Vite'],
    Design: ['Figma', 'UI/UX design', 'Brand identity'],
    Spoken: ['English (native)', 'French (learning)'],
  } as Record<string, string[]>,
};

const formatMonth = (value: string) => {
  const [year, month] = value.split('-');
  if (!month) return year;
  return new Date(Number(year), Number(month) - 1).toLocaleString('en-US', { month: 'short', year: 'numeric' });
};

export const formatPeriod = (job: Job) => `${formatMonth(job.start)} – ${job.end ? formatMonth(job.end) : 'Present'}`;
