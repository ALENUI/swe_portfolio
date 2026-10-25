import { useState } from 'react';
import { ArrowUpRight, Github, Linkedin, Mail, MapPin } from 'lucide-react';
import { profile } from '../data/profile';
import { SectionHeading } from './SectionHeading';

// Optional form backend (e.g. https://formspree.io/f/xxxx). Without it the
// form opens the visitor's email client with the message pre-filled.
const FORM_ENDPOINT = import.meta.env.VITE_CONTACT_ENDPOINT as string | undefined;

type Status = 'idle' | 'sending' | 'sent' | 'error';

const contactMethods = [
  { label: 'Email', value: profile.email, link: `mailto:${profile.email}`, icon: Mail },
  ...profile.socials.map((s) => ({
    label: s.label,
    value: s.handle,
    link: s.url,
    icon: s.label === 'GitHub' ? Github : Linkedin,
  })),
];

const fieldClass =
  'w-full bg-card border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground/70 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-colors duration-300 text-sm md:text-base disabled:opacity-60';

export function Contact() {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<Status>('idle');

  const update = (field: keyof typeof formData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setFormData({ ...formData, [field]: e.target.value });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!FORM_ENDPOINT) {
      const subject = encodeURIComponent(`Portfolio inquiry from ${formData.name}`);
      const body = encodeURIComponent(`${formData.message}\n\n— ${formData.name} (${formData.email})`);
      window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
      setStatus('sent');
      return;
    }

    setStatus('sending');
    try {
      const res = await fetch(FORM_ENDPOINT, {
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

  return (
    <section id="contact" aria-labelledby="contact-title" className="py-20 md:py-32 px-5 md:px-8 relative bg-muted/30">
      <div className="max-w-4xl mx-auto">
        <SectionHeading
          id="contact-title"
          eyebrow="Connect"
          title="Let's Work Together"
          description="I'm always interested in hearing about new projects and opportunities."
          tone="accent"
        />

        <div className="grid md:grid-cols-2 gap-12 md:gap-16">
          {/* Contact Info */}
          <div className="reveal" style={{ '--reveal-delay': '0.1s' } as React.CSSProperties}>
            <h3 className="font-display text-lg md:text-xl font-semibold mb-5 md:mb-6 text-foreground">Get in Touch</h3>
            <ul className="space-y-3 md:space-y-4 mb-6 md:mb-8">
              {contactMethods.map(({ label, value, link, icon: Icon }) => {
                const external = link.startsWith('http');
                return (
                  <li key={label}>
                    <a
                      href={link}
                      {...(external && { target: '_blank', rel: 'noopener noreferrer me' })}
                      className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/50 transition-colors duration-300 group"
                    >
                      <span className="w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <Icon size={18} aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-xs md:text-sm text-muted-foreground">{label}</span>
                        <span className="block text-sm md:text-base text-foreground font-medium group-hover:text-primary transition-colors duration-300 truncate">
                          {value}
                        </span>
                      </span>
                      <ArrowUpRight
                        size={18}
                        aria-hidden="true"
                        className="text-primary opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300 flex-shrink-0"
                      />
                    </a>
                  </li>
                );
              })}
            </ul>

            <div className="bg-card/60 border border-border rounded-xl p-5 md:p-6 space-y-3">
              <div className="flex items-center gap-2 text-sm md:text-base text-foreground font-semibold">
                <MapPin size={16} className="text-primary" aria-hidden="true" />
                {profile.location.city}, {profile.location.region}
              </div>
              {profile.availableForWork && (
                <div className="flex items-center gap-2">
                  <span aria-hidden="true" className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <span className="text-xs md:text-sm text-muted-foreground font-medium">Open to opportunities</span>
                </div>
              )}
            </div>
          </div>

          {/* Contact Form */}
          <div className="reveal" style={{ '--reveal-delay': '0.2s' } as React.CSSProperties}>
            {status === 'sent' ? (
              <div role="status" className="text-center py-14 md:py-16 px-6 bg-card rounded-2xl border border-border">
                <div className="mx-auto mb-4 w-14 h-14 flex items-center justify-center rounded-full bg-primary/10 text-primary text-2xl">
                  ✓
                </div>
                <h3 className="font-display text-xl md:text-2xl font-semibold mb-2 text-primary">
                  {FORM_ENDPOINT ? 'Message Sent!' : 'Almost there!'}
                </h3>
                <p className="text-muted-foreground text-sm md:text-base mb-6">
                  {FORM_ENDPOINT
                    ? "Thanks for reaching out. I'll get back to you soon."
                    : 'Your email app should open with the message ready to send.'}
                </p>
                <button
                  type="button"
                  onClick={() => setStatus('idle')}
                  className="text-sm text-primary font-medium hover:underline underline-offset-4"
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6">
                <div>
                  <label htmlFor="contact-name" className="block text-sm mb-2 text-foreground">
                    Name
                  </label>
                  <input
                    id="contact-name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    value={formData.name}
                    onChange={update('name')}
                    className={fieldClass}
                    placeholder="Your name"
                    disabled={status === 'sending'}
                  />
                </div>

                <div>
                  <label htmlFor="contact-email" className="block text-sm mb-2 text-foreground">
                    Email
                  </label>
                  <input
                    id="contact-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={formData.email}
                    onChange={update('email')}
                    className={fieldClass}
                    placeholder="your.email@example.com"
                    disabled={status === 'sending'}
                  />
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-sm mb-2 text-foreground">
                    Message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={update('message')}
                    className={`${fieldClass} resize-none`}
                    placeholder="Tell me about your project..."
                    disabled={status === 'sending'}
                  />
                </div>

                {status === 'error' && (
                  <p role="alert" className="text-sm text-destructive">
                    Something went wrong. Please try again or email me directly at {profile.email}.
                  </p>
                )}

                <button
                  type="submit"
                  disabled={status === 'sending'}
                  className="w-full bg-primary text-primary-foreground rounded-full px-8 py-4 font-semibold hover:shadow-lg hover:shadow-primary/25 transition-shadow duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base"
                >
                  {status === 'sending' ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
