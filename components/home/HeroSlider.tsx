"use client";

import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, MapPin, Calendar, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Slide {
  id: number;
  image: string;
  title: string;
  subtitle: string;
}

const slides: Slide[] = [
  {
    id: 1,
    image: "https://media-cdn.tripadvisor.com/media/photo-s/16/1a/ea/54/hotel-presidente-4s.jpg",
    title: "Khám phá Thế Giới",
    subtitle: "Tìm kiếm khách sạn tốt nhất tại hơn 100 quốc gia",
  },
  {
    id: 2,
    image: "https://vn.sheratonhanoi.com/resourcefiles/homeimages/porte-cochere.jpg?version=12032025030920",
    title: "Lưu Trú Sang Trọng",
    subtitle: "Trải nghiệm dịch vụ 5 sao với giá cạnh tranh",
  },
  {
    id: 3,
    image: "https://bluediamondluxuryhotel.com.vn/wp-content/themes/yootheme/cache/ee/review-luxury-hotel-tai-tp-hcm-ee6a3318.jpeg",
    title: "Đặt Phòng Dễ Dàng",
    subtitle: "Chỉ vài cú click để hoàn thành chuyến đi của bạn",
  },
];

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [checkIn, setCheckIn] = useState("");
  const [checkOut, setCheckOut] = useState("");
  const [guests, setGuests] = useState("2");
  const [destination, setDestination] = useState("");

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (destination) params.append("location", destination);
    if (checkIn) params.append("checkIn", checkIn);
    if (checkOut) params.append("checkOut", checkOut);
    if (guests) params.append("guests", guests);
    
    window.location.href = `/hotels?${params.toString()}`;
  };

  const slide = slides[currentSlide];

  return (
    <section className="relative h-96 md:h-[500px] overflow-hidden rounded-lg">
      {/* Slider Background */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-all duration-500"
        style={{
          backgroundImage: `url(${slide.image})`,
        }}
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      {/* Content */}
      <div className="relative h-full flex flex-col items-center justify-center text-white px-4">
        <div className="text-center mb-12 max-w-2xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{slide.title}</h1>
          <p className="text-lg md:text-xl text-gray-100">{slide.subtitle}</p>
        </div>

        {/* Search Form */}
        <form
          onSubmit={handleSearch}
          className="w-full max-w-4xl bg-white rounded-lg p-4 md:p-6 shadow-lg"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
            {/* Destination */}
            <div className="flex items-center gap-2 bg-gray-50 rounded px-3 py-2">
              <MapPin className="h-5 w-5 text-primary flex-shrink-0" />
              <Input
                type="text"
                placeholder="Địa điểm"
                value={destination}
                onChange={(e) => setDestination(e.target.value)}
                className="bg-transparent border-none outline-none flex-1 text-gray-900 placeholder-gray-600"
              />
            </div>

            {/* Check In */}
            <div className="flex items-center gap-2 bg-gray-50 rounded px-3 py-2">
              <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
              <Input
                type="date"
                value={checkIn}
                onChange={(e) => setCheckIn(e.target.value)}
                className="bg-transparent border-none outline-none flex-1 text-gray-900"
              />
            </div>

            {/* Check Out */}
            <div className="flex items-center gap-2 bg-gray-50 rounded px-3 py-2">
              <Calendar className="h-5 w-5 text-primary flex-shrink-0" />
              <Input
                type="date"
                value={checkOut}
                onChange={(e) => setCheckOut(e.target.value)}
                className="bg-transparent border-none outline-none flex-1 text-gray-900"
              />
            </div>

            {/* Guests */}
            <div className="flex items-center gap-2 bg-gray-50 rounded px-3 py-2">
              <Users className="h-5 w-5 text-primary flex-shrink-0" />
              <Select value={guests} onValueChange={setGuests}>
                <SelectTrigger className="border-none outline-none bg-transparent text-gray-900">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num} khách
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Search Button */}
            <Button type="submit" className="w-full">
              Tìm kiếm
            </Button>
          </div>
        </form>
      </div>

      {/* Navigation Arrows */}
      <button
        onClick={handlePrevSlide}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-all"
        aria-label="Previous slide"
      >
        <ChevronLeft className="h-6 w-6" />
      </button>

      <button
        onClick={handleNextSlide}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 text-white p-2 rounded-full transition-all"
        aria-label="Next slide"
      >
        <ChevronRight className="h-6 w-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={`h-2 rounded-full transition-all ${
              index === currentSlide
                ? "bg-white w-8"
                : "bg-white/50 w-2 hover:bg-white/75"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
