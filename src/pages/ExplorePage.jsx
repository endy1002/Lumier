import { useEffect, useState } from 'react';
import AudiobookSection from '../components/explore/AudiobookSection';
import AuthorInfo from '../components/explore/AuthorInfo';
import { useAuth } from '../hooks/useAuth';
import { fetchExploreAuthors } from '../services/explore';
import { useLanguage } from '../context/LanguageContext';

export default function ExplorePage() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    let mounted = true;

    const loadExploreData = async () => {
      try {
        const authorData = await fetchExploreAuthors();

        if (!mounted) {
          return;
        }

        setAuthors(authorData);
      } catch {
        if (mounted) {
          setAuthors([]);
        }
      }
    };

    loadExploreData();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div>
      <section className="relative overflow-hidden bg-[#101a2f]">
        <img
          src="/images/hero/explorebg.jpg"
          alt=""
          className="w-full h-auto object-contain"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#0f1a31]/78 via-[#0f1a31]/64 to-[#0f1a31]/42" />
        <div className="absolute inset-0 z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center">
          <h1 className="font-golan text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-white leading-tight max-w-3xl italic drop-shadow-[0_3px_16px_rgba(0,0,0,0.4)]">
            {t('Nơi tâm hồn vui hơn qua những con chữ', 'Where words make the soul lighter')}
          </h1>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
        <section>
          <AudiobookSection googleId={user?.googleId} />
        </section>

        <section>
          <AuthorInfo authors={authors} />
        </section>
      </div>
    </div>
  );
}
