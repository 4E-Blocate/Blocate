import Features from '@/components/Features';
import Statistics from '@/components/Statistics';
import Footer from '@/components/Footer';
import Company from '@/components/Company';
import Testimony from '@/components/Testimony';
import Navbar from '@/components/Navbar';
import DashboardPreview from '@/components/DashboardPreview';
import HeroHome from '@/components/HeroHome';

export default function App() {
  return (
    <div className="min-h-screen bg-white text-[#1D1D1F] font-sans selection:bg-[#E4A6ED] selection:text-white">
      <Navbar />
      <HeroHome />
      <DashboardPreview />
      <Statistics />
      <Features />
      <Company />
      <Testimony />
      <Footer />
    </div>
  );
}