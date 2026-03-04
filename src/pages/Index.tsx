import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/landing/HeroSection";
import HowItWorks from "@/components/landing/HowItWorks";
import ExampleStores from "@/components/landing/ExampleStores";
import CaptionGenerator from "@/components/landing/CaptionGenerator";

const Index = () => (
  <div className="flex min-h-screen flex-col">
    <Navbar />
    <main className="flex-1">
      <HeroSection />
      <CaptionGenerator />
      <HowItWorks />
      <ExampleStores />
    </main>
    <Footer />
  </div>
);

export default Index;
