
import { Header } from "@/components/layouts/user/Header";
import { HeroSlider } from "@/components/home/HeroSlider";
import { Slogan } from "@/components/home/Slogan";
import { HotelList } from "@/components/home/HotelList";
import { Footer } from "@/components/layouts/user/Footer";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <Header />

      {/* Main Content */}
      <main className="flex-1">
        {/* Hero Slider */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <HeroSlider />
        </div>

        {/* Slogan/Features */}
        <Slogan />

        {/* Featured Hotels */}
        <HotelList />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
