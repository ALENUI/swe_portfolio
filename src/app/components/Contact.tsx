import { useEffect, useState } from 'react';
import { ArrowUpRight, Check, Copy, Mail } from 'lucide-react';
import { profile } from '../data/profile';
import { SectionHeading, sectionClass } from './SectionHeading';
import { SocialIcon } from './SocialIcon';
import { buttonPrimary, buttonSecondary, card } from './styles';

// Optional form backend (e.g. https://formspree.io/f/xxxx). Without one there is
// no form: a form that can't actually deliver a message is worse than none.
const FORM_ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined;

const fieldClass =
  'w-full bg-background border border-border rounded-xl px-4 py-3 text-base text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors disabled:opacity-60';

function copyWithSelection(text: string) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    return document.execCommand('copy');
  } catch {
    return false;
  } finally {
    textarea.remove();
  }
}

function CopyEmailButton({ email }: { email: string }) {
  const [state, setState] = useState<'idle' | 'copied' | 'failed'>('idle');

  useEffect(() => {
    if (state === 'idle') return;
    const timer = setTimeout(() => setState('idle'), 2000);
    return () => clearTimeout(timer);
  }, [state]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setState('copied');
    } catch {
      // Clipboard API is unavailable in some in-app browsers and insecure contexts.
      setState(copyWithSelection(email) ? 'copied' : 'failed');
    }
  };

  return (
    <button type="button" onClick={copy} className={buttonSecondary}>
      {state === 'copied' ? <Check size={16} aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
      <span aria-live="polite">
        {state === 'copied' ? 'Copied' : state === 'failed' ? "Couldn't copy" : 'Copy address'}
      </span>
    </button>
  );
}

function ContactForm() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const update = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [field]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch(FORM_ENDPOINT!, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(formData),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus('sent');
      setFormData({ name: '', email: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  if (status === 'sent') {
    return (
      <div role="status" className={`${card} text-center`}>
        <h3 className="font-display text-xl font-semibold text-foreground">Thanks, your message was sent.</h3>
        <p className="mt-2 text-muted-foreground">I'll reply to the email address you gave.</p>
        <button
          type="button"
          onClick={() => setStatus('idle')}
          className="mt-6 text-sm text-primary font-medium underline-offset-4 hover:underline"
        >
          Send another message
        </button>
      </div>
    );
  }

  const sending = status === 'sending';
  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="contact-name" className="block text-sm font-medium mb-2 text-foreground">
          Name
        </label>
        <input id="contact-name" name="name" type="text" autoComplete="name" required maxLength={100}
          value={formData.name} onChange={update('name')} className={fieldClass} disabled={sending} />
      </div>
      <div>
        <label htmlFor="contact-email" className="block text-sm font-medium mb-2 text-foreground">
          Email
        </label>
        <input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={200}
          value={formData.email} onChange={update('email')} className={fieldClass} disabled={sending} />
      </div>
      <div>
        <label htmlFor="contact-message" className="block text-sm font-medium mb-2 text-foreground">
          Message
        </label>
        <textarea id="contact-message" name="message" required rows={5} maxLength={5000}
          value={formData.message} onChange={update('message')} className={`${fieldClass} resize-y min-h-32`} disabled={sending} />
      </div>

      {status === 'error' && (
        <p role="alert" className="text-sm text-destructive">
          Your message couldn't be sent. Check your connection and try again
          {profile.email && <>, or email me at <a href={`mailto:${profile.email}`} className="underline">{profile.email}</a></>}.
        </p>
      )}

      <button type="submit" disabled={sending} className={`${buttonPrimary} w-full disabled:opacity-60 disabled:cursor-not-allowed`}>
        {sending ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}

export function Contact() {
  if (!profile.email && profile.socials.length === 0) return null;

  return (
    <section id="contact" aria-labelledby="contact-title" className={sectionClass}>
      <div className="max-w-4xl mx-auto">
        <SectionHeading
          id="contact-title"
          title="Contact"
          description={
            profile.availableForWork
              ? "I'm open to new opportunities. Email is the best way to reach me."
              : 'Email is the best way to reach me.'
          }
        />

        <div className={FORM_ENDPOINT ? 'grid md:grid-cols-2 gap-12 md:gap-16 [&>*]:min-w-0' : ''}>
          <div>
            {profile.email && (
              <div className="mb-10">
                <a
                  href={`mailto:${profile.email}`}
                  className="inline-flex items-center gap-3 font-display text-2xl md:text-3xl font-semibold text-foreground hover:text-primary transition-colors break-all"
                >
                  <Mail size={24} aria-hidden="true" className="text-primary flex-shrink-0" />
                  {profile.email}
                </a>
                <div className="mt-6 flex flex-col sm:flex-row gap-3">
                  <a href={`mailto:${profile.email}`} className={buttonPrimary}>
                    Send an email
                  </a>
                  <CopyEmailButton email={profile.email} />
                </div>
              </div>
            )}

            {profile.socials.length > 0 && (
              <ul className="divide-y divide-border border-y border-border">
                {profile.socials.map((social) => (
                  <li key={social.label}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer me"
                      className="group flex items-center gap-4 py-4 text-foreground"
                    >
                      <span className="text-muted-foreground group-hover:text-primary transition-colors">
                        <SocialIcon label={social.label} />
                      </span>
                      <span className="w-24 text-sm text-muted-foreground">{social.label}</span>
                      <span className="flex-1 min-w-0 font-medium truncate group-hover:text-primary transition-colors">
                        {social.handle}
                      </span>
                      <ArrowUpRight size={16} aria-hidden="true" className="text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {FORM_ENDPOINT && <ContactForm />}
        </div>
      </div>
    </section>
  );
}
