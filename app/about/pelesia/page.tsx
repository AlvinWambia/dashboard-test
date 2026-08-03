import Image from "next/image";
import pele from "@/components/images/pelebg.png";
import Link from "next/link";

export default function AboutPelesia() {
  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* Navbar */}
      <nav className="w-full px-6 py-6 flex justify-between items-center max-w-7xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight hover:opacity-80 transition-opacity">
          <span className="text-2xl">⠿</span>myFit
        </Link>
        <Link href="/" className="px-6 py-2.5 bg-black text-white text-sm font-medium rounded-full hover:bg-gray-800 transition shadow-sm">
          Back to Home
        </Link>
      </nav>

      <div className="max-w-6xl mx-auto px-6 py-8 md:py-16">
        {/* Top Header */}
        <h1 className="text-[12vw] md:text-[10rem] font-bold tracking-tighter text-center leading-none mb-12">
          About Pelesia
        </h1>

        {/* Divider and Years */}
        <div className="border-t border-gray-200 pt-6 mb-16 md:mb-24 flex justify-between text-xs text-gray-500 font-medium">
          <span>2015</span>
          <span>2025</span>
        </div>

        {/* Bracketed Text */}
        <div className="max-w-4xl mx-auto text-center md:text-right text-2xl md:text-4xl font-medium leading-[1.2] mb-16 md:mb-24 tracking-tight">
          [  Hi there,
          How are you? Coach P here.
          Well my name is Pelesia Wambia, a certified fitness coach and sports and wellness enthusiasist. I specfically work with women and my mission is to help women feel confident and comfortable under their skin without compromising their health.
          I focus mainly on women's strength training, body toning, nutrition goals and overall health.
          ]
        </div>

        {/* Large Image */}
        <div className="relative w-full max-w-4xl mx-auto aspect-square md:aspect-[4/3] bg-gray-100 mb-16 md:mb-24 overflow-hidden rounded-sm">
          <Image
            src={pele}
            alt="Pelesia - Lead Instructor"
            fill
            className="object-cover"
            priority
          />
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
          <div className="flex flex-col">
            <span className="text-4xl md:text-5xl font-bold mb-2">10</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Years of experience</span>
          </div>
          <div className="flex flex-col">
            <span className="text-4xl md:text-5xl font-bold mb-2">500+</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Lives transformed</span>
          </div>
          <div className="flex flex-col">
            <span className="text-4xl md:text-5xl font-bold mb-2">100%</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Commitment</span>
          </div>
          <div className="flex flex-col">
            <span className="text-4xl md:text-5xl font-bold mb-2">3+</span>
            <span className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">Certifications</span>
          </div>
        </div>
      </div>
    </div>
  );
}
