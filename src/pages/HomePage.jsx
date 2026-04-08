import HeroSection from '../components/home/HeroSection';
import StorySection from '../components/home/StorySection';
import SpecsSection from '../components/home/SpecsSection';
import BentoGrid from '../components/home/BentoGrid';

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <SpecsSection />
      <StorySection />
      <BentoGrid />
    </div>
  );
}
