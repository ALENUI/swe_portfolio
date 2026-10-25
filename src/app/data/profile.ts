/**
 * Single source of truth for the portfolio's content and SEO metadata.
 * Everything here is used both by the React components and by the
 * build-time prerender (page <head>, JSON-LD, sitemap, robots.txt).
 */

export interface Job {
  company: string;
  role: string;
  start: string;
  end: string | null; // null = current position
  description: string;
  achievements: string[];
  tech: string[];
}

export const profile = {
  name: 'ALENUI',
  role: 'Computer Engineer',
  jobTitle: 'Senior Software Engineer',
  tagline: 'Building scalable systems and elegant solutions for complex problems',
  // ~150 characters: what search engines show under the title.
  description:
    'ALENUI is a computer engineer and senior software engineer building scalable cloud systems, microservices and data platforms with Go, TypeScript and Kubernetes.',
  keywords: [
    'ALENUI',
    'software engineer',
    'computer engineer',
    'full stack developer',
    'cloud infrastructure',
    'microservices',
    'Kubernetes',
    'Go',
    'TypeScript',
    'React',
    'portfolio',
  ],
  location: { city: 'San Francisco', region: 'CA', country: 'US' },
  availableForWork: true,

  // Default public URL. The deploy workflow overrides it with the real
  // GitHub Pages / custom domain URL via the SITE_URL environment variable.
  siteUrl: 'https://alenui.github.io/swe_portfolio',
  locale: 'en_US',

  email: 'alenui@engineer.dev',
  socials: [
    { label: 'GitHub', handle: 'github.com/ALENUI', url: 'https://github.com/ALENUI' },
    { label: 'LinkedIn', handle: 'linkedin.com/in/alenui', url: 'https://www.linkedin.com/in/alenui' },
  ],

  stats: [
    { value: '10+', label: 'Years Experience' },
    { value: '48+', label: 'Projects Delivered' },
    { value: '25+', label: 'Technologies' },
  ],

  experience: [
    {
      company: 'TechCorp Innovation Labs',
      role: 'Senior Software Engineer',
      start: '2021',
      end: null,
      description:
        'Leading cloud infrastructure initiatives and architecting scalable microservices platforms.',
      achievements: [
        'Architected the company-wide microservices platform',
        'Led the migration of production workloads to Kubernetes',
        'Reduced deployment time by 70% through CI/CD optimization',
        'Mentored 5 junior developers',
      ],
      tech: ['Kubernetes', 'Go', 'React', 'PostgreSQL', 'AWS'],
    },
    {
      company: 'DataStream Solutions',
      role: 'Full Stack Engineer',
      start: '2018',
      end: '2021',
      description:
        'Developed real-time data processing pipelines and dashboards for data visualization and analytics.',
      achievements: [
        'Built a real-time pipeline processing 10M+ events daily',
        'Created the customer-facing analytics dashboard',
        'Improved query performance by 300%',
      ],
      tech: ['Python', 'Node.js', 'Redis', 'MongoDB', 'Docker'],
    },
    {
      company: 'StartupVenture Inc',
      role: 'Software Developer',
      start: '2016',
      end: '2018',
      description: 'Core team member building the MVP from scratch.',
      achievements: [
        'Implemented authentication and user management',
        'Integrated payment processing',
        'Scaled the platform to 50K+ users',
      ],
      tech: ['Ruby on Rails', 'Vue.js', 'MySQL', 'Heroku'],
    },
  ] satisfies Job[],

  philosophy: [
    "I believe in writing code that's not just functional, but elegant and maintainable. Every line should serve a purpose, and every system should be designed with scalability and resilience in mind.",
    'My approach combines deep technical expertise with a strong focus on collaboration. The best solutions emerge when engineers work together towards a shared vision.',
    'Continuous learning is at the core of my practice. I stay at the forefront through experimentation, open-source contributions, and knowledge sharing.',
  ],

  skills: {
    Languages: ['JavaScript', 'TypeScript', 'Python', 'Go', 'Java', 'Ruby'],
    Frontend: ['React', 'Vue.js', 'Next.js', 'Tailwind CSS', 'Redux'],
    Backend: ['Node.js', 'Django', 'Flask', 'Express', 'FastAPI'],
    Databases: ['PostgreSQL', 'MongoDB', 'Redis', 'Elasticsearch'],
    DevOps: ['Docker', 'Kubernetes', 'AWS', 'GCP', 'Terraform'],
    Tools: ['Git', 'Linux', 'Nginx', 'Kafka', 'Prometheus'],
  } as Record<string, string[]>,
};

export const formatPeriod = (job: Job) => `${job.start} – ${job.end ?? 'Present'}`;
