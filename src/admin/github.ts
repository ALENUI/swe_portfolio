/** Minimal GitHub REST client for the admin: read and commit files in one repository. */

export const REPO = {
  owner: 'ALENUI',
  name: 'swe_portfolio',
  branch: 'main',
  contentPath: 'src/app/data/content.json',
  imageDir: 'public/works', // served at <site>/works/
};

export const REPO_URL = `https://github.com/${REPO.owner}/${REPO.name}`;
const API = 'https://api.github.com';

export class GitHubError extends Error {
  constructor(
    public status: number,
    message: string,
  ) {
    super(message);
  }
}

async function request<T>(token: string, path: string, init: RequestInit = {}): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${API}${path}`, {
      ...init,
      headers: {
        Accept: 'application/vnd.github+json',
        Authorization: `Bearer ${token}`,
        'X-GitHub-Api-Version': '2022-11-28',
        ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      },
    });
  } catch {
    throw new GitHubError(0, "Couldn't reach GitHub. Check your internet connection and try again.");
  }
  if (res.ok) return res.json() as Promise<T>;

  const body = (await res.json().catch(() => ({}))) as { message?: string };
  const repo = `${REPO.owner}/${REPO.name}`;
  switch (res.status) {
    case 401:
      throw new GitHubError(401, 'GitHub rejected this token. It may be mistyped, revoked or expired.');
    case 403:
      if (res.headers.get('x-ratelimit-remaining') === '0') {
        throw new GitHubError(403, 'GitHub rate limit reached. Wait a few minutes and try again.');
      }
      throw new GitHubError(403, `This token isn't allowed to do that. It needs "Contents: Read and write" access to ${repo}.`);
    case 404:
      throw new GitHubError(
        404,
        `This token can't see ${repo}. When creating it, choose "Only select repositories" and pick ${REPO.name}, and give it "Contents: Read and write".`,
      );
    case 409:
      throw new GitHubError(
        409,
        'The content changed on GitHub since you loaded it (perhaps from another tab). Reload to get the latest version.',
      );
    default:
      throw new GitHubError(res.status, body.message ? `GitHub error: ${body.message}` : `GitHub error (${res.status}).`);
  }
}

export function toBase64(text: string) {
  const bytes = new TextEncoder().encode(text);
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

function fromBase64(base64: string) {
  return new TextDecoder().decode(Uint8Array.from(atob(base64.replace(/\s/g, '')), (c) => c.charCodeAt(0)));
}

export async function getLogin(token: string) {
  const user = await request<{ login: string }>(token, '/user');
  return user.login;
}

const contentsPath = (path: string) =>
  `/repos/${REPO.owner}/${REPO.name}/contents/${path.split('/').map(encodeURIComponent).join('/')}`;

export async function readTextFile(token: string, path: string) {
  try {
    const file = await request<{ content: string; sha: string }>(
      token,
      `${contentsPath(path)}?ref=${encodeURIComponent(REPO.branch)}`,
    );
    return { text: fromBase64(file.content), sha: file.sha };
  } catch (e) {
    if (!(e instanceof GitHubError) || e.status !== 404) throw e;
    // GitHub says "not found" both when the token can't see the repo and when the
    // file is missing. If the repo itself is visible, the file isn't pushed yet.
    await request(token, `/repos/${REPO.owner}/${REPO.name}`);
    throw new GitHubError(
      404,
      `The token works, but ${path} isn't on the "${REPO.branch}" branch on GitHub yet. Push your latest changes, then sign in again.`,
    );
  }
}

/** SHA of an existing file, or undefined if it doesn't exist yet. */
async function existingSha(token: string, path: string) {
  try {
    const file = await request<{ sha: string }>(token, `${contentsPath(path)}?ref=${encodeURIComponent(REPO.branch)}`);
    return file.sha;
  } catch (e) {
    if (e instanceof GitHubError && e.status === 404) return undefined;
    throw e;
  }
}

/**
 * Creates or updates a file in one commit. Pass `sha` (from when the file was read)
 * to make GitHub reject the write if someone changed the file in the meantime.
 */
export async function writeFile(
  token: string,
  path: string,
  base64: string,
  message: string,
  sha?: string | 'lookup',
) {
  const currentSha = sha === 'lookup' ? await existingSha(token, path) : sha;
  const result = await request<{ content: { sha: string } }>(token, contentsPath(path), {
    method: 'PUT',
    body: JSON.stringify({ message, content: base64, branch: REPO.branch, ...(currentSha ? { sha: currentSha } : {}) }),
  });
  return result.content.sha;
}
