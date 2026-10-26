import { useCallback, useEffect, useMemo, useState } from 'react';
import { ExternalLink, LogOut, Moon, Sun } from 'lucide-react';
import { validateContent, type Content } from '../app/data/content';
import { buttonPrimary, buttonSecondary, card, field, iconButton, textLink } from '../app/components/styles';
import { toggleTheme } from '../app/theme';
import { GitHubError, REPO, REPO_URL, getLogin, readTextFile, toBase64, writeFile } from './github';
import { JobsEditor, SkillsEditor, WorksEditor, type PendingImage } from './editors';
import { Checkbox, ErrorList } from './ui';

const TOKEN_KEY = 'portfolio-admin-token';
const TABS = [
  { id: 'jobs', label: 'Jobs' },
  { id: 'works', label: 'Works' },
  { id: 'skills', label: 'Skills' },
] as const;
type Tab = (typeof TABS)[number]['id'];

const siteHome = import.meta.env.BASE_URL;

function storedToken() {
  try {
    return sessionStorage.getItem(TOKEN_KEY) ?? localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

function storeToken(token: string | null, remember = false) {
  try {
    sessionStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(TOKEN_KEY);
    if (token) (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
  } catch {
    // Storage blocked: the session just won't survive a reload.
  }
}

/** Keeps the file's "$comment" header and a stable key order, so diffs stay readable. */
function serialize(content: Content, comment?: string) {
  const { experienceSummary, experience, works, skills } = content;
  return `${JSON.stringify({ ...(comment && { $comment: comment }), experienceSummary, experience, works, skills }, null, 2)}\n`;
}

function normalize(raw: Partial<Content>): Content {
  return {
    experienceSummary: typeof raw.experienceSummary === 'string' ? raw.experienceSummary : '',
    experience: Array.isArray(raw.experience) ? raw.experience : [],
    works: Array.isArray(raw.works) ? raw.works : [],
    skills: Array.isArray(raw.skills) ? raw.skills : [],
  };
}

function changedSections(before: Content, after: Content) {
  const sections: string[] = [];
  if (before.experienceSummary !== after.experienceSummary || JSON.stringify(before.experience) !== JSON.stringify(after.experience)) sections.push('jobs');
  if (JSON.stringify(before.works) !== JSON.stringify(after.works)) sections.push('works');
  if (JSON.stringify(before.skills) !== JSON.stringify(after.skills)) sections.push('skills');
  return sections;
}

function SignIn({ onSignedIn }: { onSignedIn: (token: string, remember: boolean) => Promise<void> }) {
  const [token, setToken] = useState('');
  const [remember, setRemember] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  return (
    <main id="main" className="min-h-screen flex items-center justify-center px-5 py-16">
      <div className={`${card} w-full max-w-xl space-y-6`}>
        <div>
          <h1 className="font-display text-3xl font-bold">Portfolio admin</h1>
          <p className="mt-2 text-muted-foreground">
            Sign in with a GitHub token that can edit <strong className="text-foreground">{REPO.owner}/{REPO.name}</strong>. Changes are
            committed to the repository and the site rebuilds automatically.
          </p>
        </div>

        <details className="rounded-xl border border-border px-4 py-3 text-sm">
          <summary className="cursor-pointer font-medium">How to create a token (once)</summary>
          <ol className="mt-3 list-decimal pl-5 space-y-1.5 text-muted-foreground">
            <li>
              Open{' '}
              <a className={textLink} href="https://github.com/settings/personal-access-tokens/new" target="_blank" rel="noopener noreferrer">
                GitHub → new fine-grained token
              </a>
              .
            </li>
            <li>Name it “Portfolio admin” and pick an expiration (90 days is a good default).</li>
            <li>
              Repository access: <em>Only select repositories</em> → <strong className="text-foreground">{REPO.name}</strong>.
            </li>
            <li>
              Permissions → Repository permissions → <strong className="text-foreground">Contents: Read and write</strong>.
            </li>
            <li>Generate the token, copy it, and paste it below.</li>
          </ol>
        </details>

        <form
          className="space-y-4"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setError('');
            try {
              await onSignedIn(token.trim(), remember);
            } catch (err) {
              setError(err instanceof Error ? err.message : 'Sign-in failed.');
              setBusy(false);
            }
          }}
        >
          <div>
            <label htmlFor="token" className="block text-sm font-medium mb-1.5">
              GitHub token
            </label>
            <input
              id="token"
              type="password"
              autoComplete="off"
              spellCheck={false}
              required
              className={field}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="github_pat_…"
            />
          </div>
          <Checkbox label="Remember me on this device (don't use on shared computers)" checked={remember} onChange={setRemember} />
          {error && <ErrorList errors={[error]} />}
          <button type="submit" disabled={busy || !token.trim()} className={`${buttonPrimary} w-full disabled:opacity-60`}>
            {busy ? 'Signing in…' : 'Sign in'}
          </button>
        </form>
        <p className="text-xs text-muted-foreground">
          The token stays in this browser and is only ever sent to GitHub. Sign out to remove it.
        </p>
      </div>
    </main>
  );
}

export default function AdminApp() {
  const [token, setToken] = useState<string | null>(storedToken);
  const [login, setLogin] = useState('');
  const [loadState, setLoadState] = useState<'idle' | 'loading' | 'ready' | 'error'>(token ? 'loading' : 'idle');
  const [loadError, setLoadError] = useState('');
  const [baseline, setBaseline] = useState<Content | null>(null);
  const [draft, setDraft] = useState<Content | null>(null);
  const [comment, setComment] = useState<string>();
  const [sha, setSha] = useState('');
  const [pendingImages, setPendingImages] = useState(new Map<string, PendingImage>());
  const [tab, setTab] = useState<Tab>('jobs');
  const [publishState, setPublishState] = useState<'idle' | 'publishing' | 'published'>('idle');
  const [publishErrors, setPublishErrors] = useState<string[]>([]);
  const [conflict, setConflict] = useState(false);

  const load = useCallback(async (t: string) => {
    setLoadState('loading');
    const [user, file] = await Promise.all([getLogin(t), readTextFile(t, REPO.contentPath)]);
    const parsed = JSON.parse(file.text) as Partial<Content> & { $comment?: string };
    const content = normalize(parsed);
    setLogin(user);
    setComment(parsed.$comment);
    setBaseline(content);
    setDraft(content);
    setSha(file.sha);
    setPendingImages(new Map());
    setConflict(false);
    setPublishErrors([]);
    setLoadState('ready');
  }, []);

  // Resume a stored session.
  useEffect(() => {
    if (!token || loadState !== 'loading' || baseline) return;
    load(token).catch((err) => {
      if (err instanceof GitHubError && err.status === 401) {
        storeToken(null);
        setToken(null);
        setLoadState('idle');
        return;
      }
      setLoadError(err instanceof Error ? err.message : 'Could not load content.');
      setLoadState('error');
    });
  }, [token, loadState, baseline, load]);

  const dirty = useMemo(
    () => !!draft && !!baseline && (serialize(draft) !== serialize(baseline) || pendingImages.size > 0),
    [draft, baseline, pendingImages],
  );

  // Warn before leaving with unpublished edits.
  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const update = (next: Content) => {
    setDraft(next);
    setPublishState('idle');
    setPublishErrors([]);
  };

  const signOut = () => {
    if (dirty && !window.confirm('You have unpublished changes. Sign out and discard them?')) return;
    storeToken(null);
    setToken(null);
    setBaseline(null);
    setDraft(null);
    setLoadState('idle');
  };

  const discard = () => {
    if (!window.confirm('Discard all unpublished changes?')) return;
    setDraft(baseline);
    setPendingImages(new Map());
    setPublishErrors([]);
  };

  const publish = async () => {
    if (!draft || !baseline || !token) return;
    const problems = validateContent(draft);
    if (problems.length > 0) {
      setPublishErrors(problems);
      return;
    }
    setPublishState('publishing');
    setPublishErrors([]);
    try {
      // Upload only the images that are still used after editing.
      const used = new Set(draft.works.flatMap((w) => (w.image ? [`public/${w.image.src}`] : [])));
      for (const image of pendingImages.values()) {
        if (used.has(image.path)) await writeFile(token, image.path, image.base64, `Add cover image ${image.path.split('/').pop()}`, 'lookup');
      }
      const sections = changedSections(baseline, draft);
      const message = `Update ${sections.length ? sections.join(', ') : 'content'} from admin`;
      const newSha = await writeFile(token, REPO.contentPath, toBase64(serialize(draft, comment)), message, sha);
      setSha(newSha);
      setBaseline(draft);
      setPendingImages(new Map());
      setPublishState('published');
    } catch (err) {
      setPublishState('idle');
      if (err instanceof GitHubError && err.status === 409) setConflict(true);
      setPublishErrors([err instanceof Error ? err.message : 'Publishing failed.']);
    }
  };

  const header = (
    <header className="border-b border-border px-5 md:px-8">
      <div className="max-w-4xl mx-auto h-16 flex items-center justify-between gap-4">
        <a href={siteHome} className="flex items-center gap-2 rounded-md">
          <span aria-hidden="true" className="w-2 h-2 rounded-full bg-primary" />
          <span className="font-semibold tracking-widest uppercase text-sm">Admin</span>
        </a>
        <div className="flex items-center gap-2">
          {login && <span className="hidden sm:inline text-sm text-muted-foreground mr-2">@{login}</span>}
          <a href={siteHome} target="_blank" rel="noopener noreferrer" className={iconButton} aria-label="View site (opens in a new tab)" title="View site">
            <ExternalLink size={16} aria-hidden="true" />
          </a>
          <button type="button" onClick={toggleTheme} aria-label="Toggle dark mode" title="Toggle dark mode" className={iconButton}>
            <Sun size={16} className="hidden dark:block" aria-hidden="true" />
            <Moon size={16} className="dark:hidden" aria-hidden="true" />
          </button>
          {token && (
            <button type="button" onClick={signOut} aria-label="Sign out" title="Sign out" className={iconButton}>
              <LogOut size={16} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </header>
  );

  if (!token || loadState === 'idle') {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {header}
        <SignIn
          onSignedIn={async (t, remember) => {
            await load(t);
            storeToken(t, remember);
            setToken(t);
          }}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {header}
      <main id="main" className="px-5 md:px-8 py-10 pb-40">
        <div className="max-w-4xl mx-auto">
          {loadState === 'loading' && <p className="text-muted-foreground" role="status">Loading content from GitHub…</p>}

          {loadState === 'error' && (
            <div className="space-y-4">
              <ErrorList errors={[loadError]} />
              <div className="flex gap-3">
                <button type="button" className={buttonPrimary} onClick={() => token && load(token).catch((e) => setLoadError(e.message))}>
                  Try again
                </button>
                <button type="button" className={buttonSecondary} onClick={signOut}>
                  Sign out
                </button>
              </div>
            </div>
          )}

          {loadState === 'ready' && draft && (
            <>
              <h1 className="font-display text-3xl md:text-4xl font-bold">Edit portfolio</h1>
              <p className="mt-2 text-muted-foreground">
                Changes stay in this browser until you publish. Publishing commits them to GitHub, and the site updates about two minutes later.
              </p>

              <div role="tablist" aria-label="Sections" className="mt-8 mb-8 flex gap-2 border-b border-border">
                {TABS.map((t) => (
                  <button
                    key={t.id}
                    id={`tab-${t.id}`}
                    role="tab"
                    type="button"
                    aria-selected={tab === t.id}
                    aria-controls={`panel-${t.id}`}
                    onClick={() => setTab(t.id)}
                    className={`-mb-px px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                      tab === t.id ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {t.label}{' '}
                    <span className="text-xs text-muted-foreground">
                      {t.id === 'jobs' ? draft.experience.length : t.id === 'works' ? draft.works.length : draft.skills.length}
                    </span>
                  </button>
                ))}
              </div>

              <section id={`panel-${tab}`} role="tabpanel" aria-labelledby={`tab-${tab}`}>
                {tab === 'jobs' && <JobsEditor content={draft} update={update} />}
                {tab === 'works' && (
                  <WorksEditor
                    content={draft}
                    update={update}
                    pendingImages={pendingImages}
                    addPendingImage={(image) => setPendingImages((m) => new Map(m).set(image.path, image))}
                  />
                )}
                {tab === 'skills' && <SkillsEditor content={draft} update={update} />}
              </section>
            </>
          )}
        </div>
      </main>

      {loadState === 'ready' && (dirty || publishState !== 'idle' || publishErrors.length > 0) && (
        <div className="fixed bottom-0 inset-x-0 z-40 border-t border-border bg-background/95 backdrop-blur-md px-5 md:px-8 py-4">
          <div className="max-w-4xl mx-auto space-y-3">
            <ErrorList errors={publishErrors} />
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm" role="status" aria-live="polite">
                {publishState === 'publishing' && 'Publishing to GitHub…'}
                {publishState === 'published' && !dirty && (
                  <>
                    Published. The site updates in about two minutes.{' '}
                    <a className={textLink} href={`${REPO_URL}/actions`} target="_blank" rel="noopener noreferrer">
                      Watch the deploy
                    </a>
                  </>
                )}
                {publishState === 'idle' && dirty && 'You have unpublished changes.'}
              </p>
              <div className="flex gap-3">
                {conflict ? (
                  <button
                    type="button"
                    className={buttonSecondary}
                    onClick={() => window.confirm('Reload the latest content from GitHub? Your unpublished edits will be lost.') && token && load(token)}
                  >
                    Reload latest
                  </button>
                ) : (
                  dirty && (
                    <button type="button" className={buttonSecondary} onClick={discard} disabled={publishState === 'publishing'}>
                      Discard
                    </button>
                  )
                )}
                {dirty && !conflict && (
                  <button type="button" className={`${buttonPrimary} disabled:opacity-60`} onClick={publish} disabled={publishState === 'publishing'}>
                    {publishState === 'publishing' ? 'Publishing…' : 'Publish'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
