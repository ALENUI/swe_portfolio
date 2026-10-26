import { Github, Instagram, Linkedin } from 'lucide-react';
import type { Social } from '../data/profile';

const icons = { GitHub: Github, LinkedIn: Linkedin, Instagram };

export function SocialIcon({ label, size = 18 }: { label: Social['label']; size?: number }) {
  const Icon = icons[label];
  return <Icon size={size} aria-hidden="true" />;
}
