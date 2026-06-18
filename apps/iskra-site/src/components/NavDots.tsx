import { useScrollSection, scrollToSection } from '../hooks/useScrollSection';
import { sections } from '../lib/content';
import type { SectionId } from '../types';

export function NavDots() {
  const sectionIds = sections.map((s) => s.id);
  const activeId = useScrollSection(sectionIds, 0.4);

  return (
    <nav className="fixed right-4 top-1/2 -translate-y-1/2 z-50 hidden md:flex flex-col gap-3">
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => scrollToSection(section.id as SectionId)}
          className="group flex items-center justify-end gap-3 outline-none"
          aria-label={`Перейти к разделу ${section.label}`}
        >
          <span className="text-xs text-iskra-muted opacity-0 group-hover:opacity-100 transition-opacity font-mono">
            {section.shortLabel}
          </span>
          <span
            className={`block w-2 h-2 rounded-full transition-all duration-300 ${
              activeId === section.id
                ? 'bg-iskra-primary scale-150 shadow-[0_0_10px_rgba(255,122,0,0.6)]'
                : 'bg-white/20 group-hover:bg-white/40'
            }`}
          />
        </button>
      ))}
    </nav>
  );
}
