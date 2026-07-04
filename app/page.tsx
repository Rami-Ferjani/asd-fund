import { TopNav } from "./(home)/_components/top-nav";
import { HeroSection } from "./(home)/_components/hero-section";
import { ProgressSection } from "./(home)/_components/progress-section";
import { RecentDonorsSection } from "./(home)/_components/recent-donors-section";
import { ChallengeBoard } from "./(home)/_components/challenge-board";
import { ContributionSection } from "./(home)/_components/contribution-section";
import { ImpactSection } from "./(home)/_components/impact-section";
import { SiteFooter } from "./(home)/_components/site-footer";

export default function HomePage() {
  return (
    <div dir="rtl" lang="ar" className="flex flex-col flex-1">
      <TopNav />
      <main className="flex-grow">
        <HeroSection />
        <ProgressSection />
        <RecentDonorsSection />
        <ChallengeBoard />
        <ContributionSection />
        <ImpactSection />
      </main>
      <SiteFooter />
    </div>
  );
}