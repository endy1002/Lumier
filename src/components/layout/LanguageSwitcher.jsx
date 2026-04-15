import { useLanguage } from '../../context/LanguageContext';

export default function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="relative">
      <label htmlFor="language-switcher" className="sr-only">
        Language
      </label>
      <select
        id="language-switcher"
        value={language}
        onChange={(e) => setLanguage(e.target.value)}
        className="h-8 rounded-lg border border-brand-cream-dark bg-white px-2.5 text-[11px] font-semibold tracking-wide text-brand-charcoal hover:border-brand-amber focus:outline-none focus:ring-2 focus:ring-brand-amber/40"
      >
        <option value="vi">VI</option>
        <option value="en">EN</option>
      </select>
    </div>
  );
}
