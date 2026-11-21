import Banner from "@/components/homepage/Banner";
import HowItWorks from "@/components/homepage/HowItWorks";
import StakeholderSection from "@/components/homepage/Stakeholder";
import StatSection from "@/components/homepage/StatSection";

export default function Home() {
  return (
    <div>
      <Banner/>
      <StatSection/>
      <StakeholderSection/>
      <HowItWorks/>
    </div>
  );
}
