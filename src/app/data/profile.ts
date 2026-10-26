/**
 * Profile details and SEO metadata. Jobs, works and skills live in content.json
 * (editable from /admin) and are merged in below. Used by the React components
 * and by the build-time prerender (page <head>, JSON-LD, sitemap, robots.txt).
 *
 * Sections with no entries (experience, works) are hidden automatically,
 * and removed from the navigation.
 */
import { content, type Job } from './content';

export type { Job, Work, WorkCategory, SkillGroup } from './content';

export interface Degree {
  degree: string;
  school: string;
  start: string;
  end: string;
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



  ...content,
  works: content.works.filter((w) => !w.hidden),

  spokenLanguages: [
    { name: 'English', level: 'native' },
    { name: 'French', level: 'learning' },
  ],
};

const formatMonth = (value: string) => {
  const [year, month] = value.split('-');
  if (!month) return year;
  return new Date(Number(year), Number(month) - 1).toLocaleString('en-US', { month: 'short', year: 'numeric' });
};

export const formatPeriod = (job: Job) => `${formatMonth(job.start)} – ${job.end ? formatMonth(job.end) : 'Present'}`;
