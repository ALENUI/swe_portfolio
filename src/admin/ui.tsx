import { useId, useState, type ReactNode } from 'react';
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from 'lucide-react';
import { buttonPrimary, buttonSecondary, card, field } from '../app/components/styles';

export const smallButton =
  'inline-flex items-center justify-center gap-1.5 h-9 px-3 rounded-full border border-border text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-40 disabled:pointer-events-none';

interface FieldProps {
  label: string;
  hint?: string;
  required?: boolean;
  children: (id: string, describedBy?: string) => ReactNode;
}

export function Field({ label, hint, required, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-foreground mb-1.5">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </label>
      {children(id, hintId)}
      {hint && (
        <p id={hintId} className="mt-1.5 text-xs text-muted-foreground">
          {hint}
        </p>
      )}
    </div>
  );
}

export function TextInput({
  label,
  hint,
  required,
  value,
  onChange,
  placeholder,
  disabled,
}: Omit<FieldProps, 'children'> & { value: string; onChange: (v: string) => void; placeholder?: string; disabled?: boolean }) {
  return (
    <Field label={label} hint={hint} required={required}>
      {(id, describedBy) => (
        <input
          id={id}
          aria-describedby={describedBy}
          className={field}
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </Field>
  );
}

export function TextArea({
  label,
  hint,
  required,
  value,
  onChange,
  rows = 4,
  placeholder,
}: Omit<FieldProps, 'children'> & { value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <Field label={label} hint={hint} required={required}>
      {(id, describedBy) => (
        <textarea
          id={id}
          aria-describedby={describedBy}
          className={`${field} resize-y`}
          rows={rows}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </Field>
  );
}

export function Select({
  label,
  hint,
  required,
  value,
  onChange,
  options,
}: Omit<FieldProps, 'children'> & { value: string; onChange: (v: string) => void; options: { value: string; label: string }[] }) {
  return (
    <Field label={label} hint={hint} required={required}>
      {(id, describedBy) => (
        <select id={id} aria-describedby={describedBy} className={field} value={value} onChange={(e) => onChange(e.target.value)}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      )}
    </Field>
  );
}

export function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex items-center gap-2 text-sm text-foreground cursor-pointer">
      <input
        type="checkbox"
        className="w-4 h-4 accent-[var(--primary)]"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      {label}
    </label>
  );
}

export function ErrorList({ errors }: { errors: string[] }) {
  if (errors.length === 0) return null;
  return (
    <div role="alert" className="rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
      <p className="font-semibold">Please fix the following:</p>
      <ul className="mt-1 list-disc pl-5 space-y-0.5">
        {errors.map((e) => (
          <li key={e}>{e}</li>
        ))}
      </ul>
    </div>
  );
}

/** Form shell with Save / Cancel used by the item editors. */
export function FormCard({
  title,
  errors,
  onSave,
  onCancel,
  children,
}: {
  title: string;
  errors: string[];
  onSave: () => void;
  onCancel: () => void;
  children: ReactNode;
}) {
  return (
    <form
      className={`${card} space-y-5 border-primary/50`}
      onSubmit={(e) => {
        e.preventDefault();
        onSave();
      }}
    >
      <h3 className="font-display text-xl font-semibold">{title}</h3>
      {children}
      <ErrorList errors={errors} />
      <div className="flex flex-wrap gap-3">
        <button type="submit" className={buttonPrimary}>
          Save
        </button>
        <button type="button" onClick={onCancel} className={buttonSecondary}>
          Cancel
        </button>
      </div>
    </form>
  );
}

interface ItemListProps<T> {
  items: T[];
  onChange: (items: T[]) => void;
  itemLabel: string; // e.g. "job"
  addAt: 'start' | 'end';
  summary: (item: T) => { title: string; subtitle?: string };
  form: (item: T | null, done: (saved?: T) => void) => ReactNode;
}

/** List with add / edit / reorder / delete; only one item is edited at a time. */
export function ItemList<T>({ items, onChange, itemLabel, addAt, summary, form }: ItemListProps<T>) {
  const [editing, setEditing] = useState<number | 'new' | null>(null);

  const move = (from: number, to: number) => {
    const next = [...items];
    const [item] = next.splice(from, 1);
    next.splice(to, 0, item);
    onChange(next);
  };

  const finishEdit = (index: number | 'new') => (saved?: T) => {
    if (saved) {
      if (index === 'new') onChange(addAt === 'start' ? [saved, ...items] : [...items, saved]);
      else onChange(items.map((item, i) => (i === index ? saved : item)));
    }
    setEditing(null);
  };

  const remove = (index: number) => {
    const { title } = summary(items[index]);
    if (window.confirm(`Delete the ${itemLabel} "${title}"? You can still discard changes before publishing.`)) {
      onChange(items.filter((_, i) => i !== index));
    }
  };

  const addButton = (
    <button type="button" onClick={() => setEditing('new')} disabled={editing !== null} className={smallButton}>
      <Plus size={16} aria-hidden="true" /> Add {itemLabel}
    </button>
  );

  return (
    <div className="space-y-4">
      {addAt === 'start' && (editing === 'new' ? form(null, finishEdit('new')) : addButton)}

      {items.length === 0 && editing !== 'new' && (
        <p className="text-muted-foreground">No {itemLabel}s yet. The section stays hidden on the site until you add one.</p>
      )}

      <ol className="space-y-3">
        {items.map((item, i) => {
          if (editing === i) return <li key={i}>{form(item, finishEdit(i))}</li>;
          const { title, subtitle } = summary(item);
          return (
            <li key={i} className={`${card} !p-4 md:!p-5 flex flex-wrap items-center gap-3`}>
              <div className="flex-1 min-w-48">
                <p className="font-semibold text-foreground wrap-anywhere">{title}</p>
                {subtitle && <p className="text-sm text-muted-foreground wrap-anywhere">{subtitle}</p>}
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" className={smallButton} disabled={editing !== null} onClick={() => setEditing(i)}>
                  <Pencil size={14} aria-hidden="true" /> Edit
                </button>
                <button
                  type="button"
                  className={smallButton}
                  disabled={editing !== null || i === 0}
                  onClick={() => move(i, i - 1)}
                  aria-label={`Move "${title}" up`}
                >
                  <ArrowUp size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={smallButton}
                  disabled={editing !== null || i === items.length - 1}
                  onClick={() => move(i, i + 1)}
                  aria-label={`Move "${title}" down`}
                >
                  <ArrowDown size={14} aria-hidden="true" />
                </button>
                <button
                  type="button"
                  className={`${smallButton} hover:!border-destructive hover:!text-destructive`}
                  disabled={editing !== null}
                  onClick={() => remove(i)}
                  aria-label={`Delete "${title}"`}
                >
                  <Trash2 size={14} aria-hidden="true" />
                </button>
              </div>
            </li>
          );
        })}
      </ol>

      {addAt === 'end' && (editing === 'new' ? form(null, finishEdit('new')) : addButton)}
    </div>
  );
}

/** Helpers for list-style inputs. */
export const splitLines = (text: string) =>
  text
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean);
export const splitCommas = (text: string) =>
  text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
