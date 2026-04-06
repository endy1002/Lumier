import { BRAND } from '../../config/constants';

export default function MarqueeBanner() {
  const text = BRAND.disclaimer;

  // We loop the text a few times to ensure it covers screens of all sizes within a single track
  const trackContent = [...Array(5)].map((_, i) => (
    <span
      key={i}
      className="font-san text-xs tracking-wider mx-12 uppercase"
    >
      {text}
      <span className="mx-6 text-brand-amber">✦</span>
    </span>
  ));

  return (
    <div className="bg-brand-navy text-white overflow-hidden py-2.5 flex whitespace-nowrap group">
      {/* First track */}
      <div className="flex animate-marquee shrink-0 group-hover:[animation-play-state:paused]">
        {trackContent}
      </div>
      {/* Second identical track that follows immediately after the first */}
      <div className="flex animate-marquee shrink-0 group-hover:[animation-play-state:paused]" aria-hidden="true">
        {trackContent}
      </div>
    </div>
  );
}
