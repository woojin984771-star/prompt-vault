import { Bot, Briefcase, Palette, Code2, BookOpen, Compass, type LucideIcon } from 'lucide-react';

export const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'AI & Prompt': Bot,
  'Business': Briefcase,
  'Creation': Palette,
  'Development': Code2,
  'Knowledge': BookOpen,
  'Life': Compass,
};

export const DEFAULT_CATEGORY_ICON: LucideIcon = Bot;
