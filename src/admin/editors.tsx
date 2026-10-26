import { useEffect, useState } from 'react';
import { ArrowDown, ArrowUp, ImagePlus, Plus, Trash2, X } from 'lucide-react';
import {
  JOB_TYPES,
  WORK_CATEGORIES,
  validateContent,
  type Content,
  type Job,
  type SkillGroup,
  type Work,
  type WorkCategory,
} from '../app/data/content';
import { card } from '../app/components/styles';
import { Checkbox, FormCard, ItemList, Select, TextArea, TextInput, smallButton, splitCommas, splitLines } from './ui';

const empty: Content = { experienceSummary: '', experience: [], works: [], skills: [] };

/** Validates one item with the site's own rules, without the "Job 1 (...):" prefix. */
const itemErrors = (partial: Partial<Content>) =>
  validateContent({ ...empty, ...partial }).map((e) => e.replace(/^(Job|Work|Skill group) 1( \([^)]*\))?(, |: )/, ''));

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

// ---------------------------------------------------------------- Jobs

function JobForm({ job, done }: { job: Job | null; done: (saved?: Job) => void }) {
  const [role, setRole] = useState(job?.role ?? '');
  const [company, setCompany] = useState(job?.company ?? '');
  const [companyUrl, setCompanyUrl] = useState(job?.companyUrl ?? '');
  const [location, setLocation] = useState(job?.companyLocation ?? '');
  const [type, setType] = useState<string>(job?.type ?? '');
  const [start, setStart] = useState(job?.start ?? '');
  const [current, setCurrent] = useState(job ? job.end === null : true);
  const [end, setEnd] = useState(job?.end ?? '');
  const [highlights, setHighlights] = useState((job?.highlights ?? []).join('\n'));
  const [tech, setTech] = useState((job?.tech ?? []).join(', '));
  const [errors, setErrors] = useState<string[]>([]);

  const save = () => {
    const techList = splitCommas(tech);
    const saved: Job = {
      company: company.trim(),
      ...(companyUrl.trim() && { companyUrl: companyUrl.trim() }),
      ...(location.trim() && { companyLocation: location.trim() }),
      role: role.trim(),
      ...(type && { type: type as Job['type'] }),
      start: start.trim(),
      end: current ? null : end.trim(),
      highlights: splitLines(highlights),
      ...(techList.length > 0 && { tech: techList }),
    };
    const problems = itemErrors({ experience: [saved] }).map(capitalize);
    setErrors(problems);
    if (problems.length === 0) done(saved);
  };

  return (
    <FormCard title={job ? `Edit ${job.role}` : 'New job'} errors={errors} onSave={save} onCancel={() => done()}>
      <div className="grid sm:grid-cols-2 gap-5">
        <TextInput label="Role" required value={role} onChange={setRole} placeholder="Front-End Developer" />
        <TextInput label="Company" required value={company} onChange={setCompany} placeholder="Galsie" />
        <TextInput label="Company website" value={companyUrl} onChange={setCompanyUrl} placeholder="https://example.com" hint="Optional. Makes the company name a link." />
        <TextInput label="Location" value={location} onChange={setLocation} placeholder="Douala, Cameroon" />
        <Select
          label="Employment type"
          value={type}
          onChange={setType}
          options={[{ value: '', label: 'Not shown' }, ...JOB_TYPES.map((t) => ({ value: t, label: t }))]}
        />
        <TextInput label="Start" required value={start} onChange={setStart} placeholder="2025-08" hint="YYYY-MM, or YYYY if you don't want the month shown." />
        <div className="sm:col-span-2 flex flex-col gap-3">
          <Checkbox label="I currently work here" checked={current} onChange={setCurrent} />
          {!current && <TextInput label="End" required value={end} onChange={setEnd} placeholder="2025-12" hint="YYYY-MM or YYYY." />}
        </div>
      </div>
      <TextArea
        label="Highlights"
        value={highlights}
        onChange={setHighlights}
        rows={5}
        hint="One per line. Start with a verb: “Built…”, “Led…”, “Reduced…”. Numbers make them stronger."
      />
      <TextInput label="Technologies" value={tech} onChange={setTech} placeholder="React, TypeScript, Figma" hint="Comma-separated." />
    </FormCard>
  );
}

export function JobsEditor({ content, update }: { content: Content; update: (c: Content) => void }) {
  return (
    <div className="space-y-8">
      <TextArea
        label="Experience summary"
        value={content.experienceSummary}
        onChange={(experienceSummary) => update({ ...content, experienceSummary })}
        rows={3}
        hint="Shown under the Experience heading. Leave empty to hide it."
      />
      <ItemList<Job>
        items={content.experience}
        onChange={(experience) => update({ ...content, experience })}
        itemLabel="job"
        addAt="start"
        summary={(job) => ({
          title: `${job.role} · ${job.company}`,
          subtitle: `${job.start} – ${job.end ?? 'Present'}${job.type ? ` · ${job.type}` : ''}`,
        })}
        form={(job, done) => <JobForm job={job} done={done} />}
      />
      <p className="text-sm text-muted-foreground">Most recent first: the site shows jobs in this order.</p>
    </div>
  );
}

// ---------------------------------------------------------------- Works

export interface PendingImage {
  path: string; // repo path, e.g. public/works/thinksy.png
  base64: string;
  previewUrl: string;
}

const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // after resizing
const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // what the browser will try to resize
const MAX_IMAGE_WIDTH = 1600; // covers show at most ~800px wide, so this is sharp on 2x screens
const IMAGE_TYPES: Record<string, string> = { 'image/png': 'png', 'image/jpeg': 'jpg', 'image/webp': 'webp' };

const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/[\s_]+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 60) || 'work';

/** Scales screenshots and photos down to MAX_IMAGE_WIDTH so the site doesn't ship multi-megabyte covers. */
async function shrinkImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  if (bitmap.width <= MAX_IMAGE_WIDTH) return file;
  const canvas = document.createElement('canvas');
  canvas.width = MAX_IMAGE_WIDTH;
  canvas.height = Math.round((bitmap.height * MAX_IMAGE_WIDTH) / bitmap.width);
  const ctx = canvas.getContext('2d')!;
  ctx.imageSmoothingQuality = 'high';
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, file.type, 0.85));
  return blob && blob.size < file.size ? blob : file;
}

const readAsBase64 = (file: Blob) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result).split(',')[1]);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

function WorkForm({
  work,
  done,
  pendingImages,
  addPendingImage,
}: {
  work: Work | null;
  done: (saved?: Work) => void;
  pendingImages: Map<string, PendingImage>;
  addPendingImage: (image: PendingImage) => void;
}) {
  const [title, setTitle] = useState(work?.title ?? '');
  const [category, setCategory] = useState<WorkCategory>(work?.category ?? 'Development');
  const [year, setYear] = useState(work?.year ?? String(new Date().getFullYear()));
  const [inProgress, setInProgress] = useState(work?.inProgress ?? false);
  const [summary, setSummary] = useState(work?.summary ?? '');
  const [tags, setTags] = useState((work?.tags ?? []).join(', '));
  const [links, setLinks] = useState((work?.links ?? []).map((l) => `${l.label} | ${l.url}`).join('\n'));
  const [image, setImage] = useState(work?.image);
  const [newImage, setNewImage] = useState<PendingImage | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const pending = image ? pendingImages.get(`public/${image.src}`) : undefined;
  const previewSrc = newImage?.previewUrl ?? pending?.previewUrl ?? (image ? `${import.meta.env.BASE_URL}${image.src}` : null);

  const chooseImage = async (file: File | undefined) => {
    if (!file) return;
    const ext = IMAGE_TYPES[file.type];
    if (!ext) return setErrors(['Cover image must be a PNG, JPG or WebP file.']);
    if (file.size > MAX_UPLOAD_BYTES) return setErrors(['That image is too large. Use one under 20 MB.']);
    let image: Blob;
    try {
      image = await shrinkImage(file);
    } catch {
      return setErrors(["Couldn't read that image. Try exporting it again as PNG or JPG."]);
    }
    if (image.size > MAX_IMAGE_BYTES) return setErrors(['Cover image is still over 2 MB after resizing. Export it as JPG instead.']);
    const src = `works/${slugify(title || file.name.replace(/\.\w+$/, ''))}-${Date.now().toString(36)}.${ext}`;
    setNewImage({ path: `public/${src}`, base64: await readAsBase64(image), previewUrl: URL.createObjectURL(image) });
    setImage({ src, alt: image?.alt ?? '' });
    setErrors([]);
  };

  const save = () => {
    const parsedLinks = splitLines(links).map((line) => {
      const [label, ...rest] = line.split('|');
      return { label: (rest.length ? label : '').trim(), url: (rest.length ? rest.join('|') : label).trim() };
    });
    const tagList = splitCommas(tags);
    const saved: Work = {
      title: title.trim(),
      category,
      ...(year.trim() && { year: year.trim() }),
      ...(inProgress && { inProgress: true }),
      summary: summary.trim(),
      tags: tagList,
      ...(image && { image: { src: image.src, alt: image.alt.trim() } }),
      links: parsedLinks,
      ...(work?.hidden && { hidden: true }),
    };
    const problems = itemErrors({ works: [saved] }).map(capitalize);
    setErrors(problems);
    if (problems.length > 0) return;
    if (newImage) addPendingImage(newImage);
    done(saved);
  };

  return (
    <FormCard title={work ? `Edit ${work.title}` : 'New work'} errors={errors} onSave={save} onCancel={() => done()}>
      <div className="grid sm:grid-cols-2 gap-5">
        <TextInput label="Title" required value={title} onChange={setTitle} />
        <Select
          label="Category"
          value={category}
          onChange={(v) => setCategory(v as WorkCategory)}
          options={WORK_CATEGORIES.map((c) => ({ value: c, label: c }))}
        />
        <TextInput label="Year" value={year} onChange={setYear} placeholder="2025" hint="Four digits. Leave empty to hide." />
        <div className="flex items-end pb-3">
          <Checkbox label="Still in progress" checked={inProgress} onChange={setInProgress} />
        </div>
      </div>
      <TextArea label="Summary" required value={summary} onChange={setSummary} rows={4} hint="2–3 sentences: what it is, who it's for, and what you did." />
      <TextInput label="Tags" value={tags} onChange={setTags} placeholder="React, TypeScript, Figma" hint="Comma-separated." />
      <TextArea
        label="Links"
        value={links}
        onChange={setLinks}
        rows={3}
        placeholder={'Live site | https://example.com\nSource code | https://github.com/ALENUI/project'}
        hint="One per line, as: Label | https://address"
      />

      <div className="space-y-3">
        <p className="text-sm font-medium text-foreground">Cover image</p>
        {previewSrc && (
          <img src={previewSrc} alt="" className="w-full max-w-md aspect-video object-cover rounded-xl border border-border bg-muted" />
        )}
        <div className="flex flex-wrap gap-2">
          <label className={`${smallButton} cursor-pointer`}>
            <ImagePlus size={14} aria-hidden="true" /> {image ? 'Replace image' : 'Add image'}
            <input type="file" accept="image/png,image/jpeg,image/webp" className="sr-only" onChange={(e) => chooseImage(e.target.files?.[0])} />
          </label>
          {image && (
            <button
              type="button"
              className={smallButton}
              onClick={() => {
                setImage(undefined);
                setNewImage(null);
              }}
            >
              <X size={14} aria-hidden="true" /> Remove image
            </button>
          )}
        </div>
        {image && (
          <TextInput
            label="Image description"
            required
            value={image.alt}
            onChange={(alt) => setImage({ ...image, alt })}
            placeholder="Thinksy dashboard showing study groups"
            hint="Describe what the image shows, for screen readers and search engines."
          />
        )}
        <p className="text-xs text-muted-foreground">PNG, JPG or WebP, ideally 16:9. Large images are resized to 1600px wide before upload. Works without an image get a placeholder cover.</p>
      </div>
    </FormCard>
  );
}

export function WorksEditor({
  content,
  update,
  pendingImages,
  addPendingImage,
}: {
  content: Content;
  update: (c: Content) => void;
  pendingImages: Map<string, PendingImage>;
  addPendingImage: (image: PendingImage) => void;
}) {
  return (
    <ItemList<Work>
      items={content.works}
      onChange={(works) => update({ ...content, works })}
      itemLabel="work"
      addAt="end"
      summary={(w) => ({
        title: w.title,
        subtitle: [w.category, w.year, w.inProgress ? 'In progress' : null, w.image ? 'has image' : null].filter(Boolean).join(' · '),
      })}
      form={(work, done) => (
        <WorkForm work={work} done={done} pendingImages={pendingImages} addPendingImage={addPendingImage} />
      )}
      visibility={{
        isHidden: (w) => w.hidden === true,
        setHidden: ({ hidden: _, ...w }, hidden) => (hidden ? { ...w, hidden: true } : w),
      }}
    />
  );
}

// ---------------------------------------------------------------- Skills

/** Skill groups are edited in place; items are typed as a comma-separated list. */
function SkillGroupRow({
  group,
  index,
  count,
  onChange,
  onMove,
  onRemove,
}: {
  group: SkillGroup;
  index: number;
  count: number;
  onChange: (g: SkillGroup) => void;
  onMove: (to: number) => void;
  onRemove: () => void;
}) {
  // Keep the raw text while typing so commas and spaces aren't swallowed.
  const [itemsText, setItemsText] = useState(group.items.join(', '));
  useEffect(() => {
    if (splitCommas(itemsText).join('|') !== group.items.join('|')) setItemsText(group.items.join(', '));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [group.items]);

  const label = group.group || `group ${index + 1}`;
  return (
    <li className={`${card} !p-4 md:!p-5 space-y-3`}>
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex-1 min-w-48">
          <TextInput label="Group name" required value={group.group} onChange={(name) => onChange({ ...group, group: name })} />
        </div>
        <div className="flex gap-2 pb-1.5">
          <button type="button" className={smallButton} disabled={index === 0} onClick={() => onMove(index - 1)} aria-label={`Move "${label}" up`}>
            <ArrowUp size={14} aria-hidden="true" />
          </button>
          <button type="button" className={smallButton} disabled={index === count - 1} onClick={() => onMove(index + 1)} aria-label={`Move "${label}" down`}>
            <ArrowDown size={14} aria-hidden="true" />
          </button>
          <button type="button" className={`${smallButton} hover:!border-destructive hover:!text-destructive`} onClick={onRemove} aria-label={`Delete "${label}"`}>
            <Trash2 size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
      <TextInput
        label="Skills"
        value={itemsText}
        onChange={(text) => {
          setItemsText(text);
          onChange({ ...group, items: splitCommas(text) });
        }}
        placeholder="React, Tailwind CSS, Vite"
        hint="Comma-separated, in the order they should appear."
      />
    </li>
  );
}

export function SkillsEditor({ content, update }: { content: Content; update: (c: Content) => void }) {
  const groups = content.skills;
  const set = (skills: SkillGroup[]) => update({ ...content, skills });
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Spoken languages are listed separately and edited in <code className="text-foreground">profile.ts</code>.
      </p>
      <ol className="space-y-3">
        {groups.map((group, i) => (
          <SkillGroupRow
            key={i}
            group={group}
            index={i}
            count={groups.length}
            onChange={(g) => set(groups.map((x, j) => (j === i ? g : x)))}
            onMove={(to) => {
              const next = [...groups];
              const [moved] = next.splice(i, 1);
              next.splice(to, 0, moved);
              set(next);
            }}
            onRemove={() => {
              if (window.confirm(`Delete the skill group "${group.group || `group ${i + 1}`}"?`)) set(groups.filter((_, j) => j !== i));
            }}
          />
        ))}
      </ol>
      <button type="button" className={smallButton} onClick={() => set([...groups, { group: '', items: [] }])}>
        <Plus size={16} aria-hidden="true" /> Add skill group
      </button>
    </div>
  );
}
