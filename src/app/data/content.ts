/**
 * Editable content (jobs, works, skills), stored in content.json so the /admin
 * page can update it through GitHub. validateContent() runs both in the admin
 * before publishing and in the build, so invalid content never reaches the site.
 */
import raw from './content.json';

export const JOB_TYPES = ['Full-time', 'Part-time', 'Contract', 'Freelance', 'Internship'] as const;
export const WORK_CATEGORIES = ['Development', 'Design'] as const;

export type JobType = (typeof JOB_TYPES)[number];
export type WorkCategory = (typeof WORK_CATEGORIES)[number];

export interface Job {
  company: string;
  companyUrl?: string;
  companyLocation?: string;
  role: string;
  type?: JobType;
  start: string; // 'YYYY-MM', or 'YYYY' when the month isn't known
  end: string | null; // null = current position
  highlights: string[];
  tech?: string[];
}

export interface Work {
  title: string;
  category: WorkCategory;
  year?: string;
  inProgress?: boolean;
  summary: string;
  tags: string[];
  // Cover image under public/, e.g. 'works/thinksy.png' (16:9 works best).
  image?: { src: string; alt: string };
  links: { label: string; url: string }[];
  hidden?: boolean; // kept in content.json but left off the site
}

export interface SkillGroup {
  group: string;
  items: string[];
}

export interface Content {
  experienceSummary: string;
  experience: Job[];
  works: Work[];
  skills: SkillGroup[];
}

export const DATE_PATTERN = /^\d{4}(-(0[1-9]|1[0-2]))?$/;
const YEAR_PATTERN = /^\d{4}$/;

export function isHttpUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:';
  } catch {
    return false;
  }
}

const isNonEmptyString = (value: unknown): value is string => typeof value === 'string' && value.trim().length > 0;
const isStringList = (value: unknown): value is string[] => Array.isArray(value) && value.every(isNonEmptyString);

/** Returns a list of human-readable problems; an empty list means the content is valid. */
export function validateContent(content: unknown): string[] {
  const errors: string[] = [];
  const c = content as Partial<Content> | null;
  if (!c || typeof c !== 'object') return ['Content must be an object.'];

  if (typeof c.experienceSummary !== 'string') errors.push('Experience summary must be text.');

  if (!Array.isArray(c.experience)) {
    errors.push('Experience must be a list.');
  } else {
    const seen = new Set<string>();
    c.experience.forEach((job, i) => {
      const where = `Job ${i + 1}${isNonEmptyString(job?.company) ? ` (${job.company})` : ''}`;
      if (!isNonEmptyString(job?.company)) errors.push(`${where}: company is required.`);
      if (!isNonEmptyString(job?.role)) errors.push(`${where}: role is required.`);
      if (job?.companyUrl !== undefined && !isHttpUrl(job.companyUrl)) errors.push(`${where}: company website must be a full http(s) URL.`);
      if (job?.companyLocation !== undefined && typeof job.companyLocation !== 'string') errors.push(`${where}: location must be text.`);
      if (job?.type !== undefined && !(JOB_TYPES as readonly string[]).includes(job.type)) errors.push(`${where}: unknown employment type "${job.type}".`);
      if (typeof job?.start !== 'string' || !DATE_PATTERN.test(job.start)) errors.push(`${where}: start must be YYYY or YYYY-MM.`);
      if (job?.end !== null && (typeof job?.end !== 'string' || !DATE_PATTERN.test(job.end))) {
        errors.push(`${where}: end must be YYYY or YYYY-MM, or empty for a current role.`);
      } else if (job?.end && typeof job.start === 'string' && job.end.slice(0, job.start.length) < job.start.slice(0, job.end.length)) {
        errors.push(`${where}: end date is before the start date.`);
      }
      if (!isStringList(job?.highlights)) errors.push(`${where}: highlights must be a list of non-empty lines.`);
      if (job?.tech !== undefined && !isStringList(job.tech)) errors.push(`${where}: technologies must be non-empty names.`);
      const key = `${job?.company}|${job?.start}`;
      if (seen.has(key)) errors.push(`${where}: another job has the same company and start date.`);
      seen.add(key);
    });
  }

  if (!Array.isArray(c.works)) {
    errors.push('Works must be a list.');
  } else {
    const seen = new Set<string>();
    c.works.forEach((work, i) => {
      const where = `Work ${i + 1}${isNonEmptyString(work?.title) ? ` (${work.title})` : ''}`;
      if (!isNonEmptyString(work?.title)) errors.push(`${where}: title is required.`);
      if (!(WORK_CATEGORIES as readonly string[]).includes(work?.category)) errors.push(`${where}: category must be one of ${WORK_CATEGORIES.join(', ')}.`);
      if (work?.year !== undefined && (typeof work.year !== 'string' || !YEAR_PATTERN.test(work.year))) errors.push(`${where}: year must be four digits.`);
      if (work?.inProgress !== undefined && typeof work.inProgress !== 'boolean') errors.push(`${where}: "in progress" must be true or false.`);
      if (work?.hidden !== undefined && typeof work.hidden !== 'boolean') errors.push(`${where}: "hidden" must be true or false.`);
      if (!isNonEmptyString(work?.summary)) errors.push(`${where}: summary is required.`);
      if (!Array.isArray(work?.tags) || !work.tags.every(isNonEmptyString)) errors.push(`${where}: tags must be non-empty names.`);
      if (work?.image !== undefined) {
        const { src, alt } = work.image ?? ({} as Work['image'] & object);
        if (!isNonEmptyString(src) || src.startsWith('/') || src.includes('..')) errors.push(`${where}: image path must be relative to public/, e.g. works/name.png.`);
        if (!isNonEmptyString(alt)) errors.push(`${where}: image needs a description (alt text).`);
      }
      if (!Array.isArray(work?.links)) {
        errors.push(`${where}: links must be a list.`);
      } else {
        work.links.forEach((link, j) => {
          if (!isNonEmptyString(link?.label)) errors.push(`${where}, link ${j + 1}: label is required.`);
          if (!isNonEmptyString(link?.url) || !isHttpUrl(link.url)) errors.push(`${where}, link ${j + 1}: URL must be a full http(s) address.`);
        });
      }
      if (seen.has(work?.title)) errors.push(`${where}: another work has the same title.`);
      seen.add(work?.title);
    });
  }

  if (!Array.isArray(c.skills)) {
    errors.push('Skills must be a list of groups.');
  } else {
    const seen = new Set<string>();
    c.skills.forEach((group, i) => {
      const where = `Skill group ${i + 1}${isNonEmptyString(group?.group) ? ` (${group.group})` : ''}`;
      if (!isNonEmptyString(group?.group)) errors.push(`${where}: name is required.`);
      if (!isStringList(group?.items)) errors.push(`${where}: skills must be non-empty names.`);
      if (seen.has(group?.group)) errors.push(`${where}: another group has the same name.`);
      seen.add(group?.group);
    });
  }

  return errors;
}

export const content = raw as unknown as Content;
