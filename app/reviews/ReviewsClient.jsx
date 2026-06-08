"use client";

import React, { useRef } from "react";
import { Star, Quote, ArrowLeft, ArrowRight } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";

// Mock data to match the image for the top grid
const mockReviews = [
  {
    id: 1,
    type: "dark",
    rating: 4,
    quote: "\"myFit has really helped me reach my goals. The programs have been quite the guide.",
    author: "Margaret Wanjiru",
    role: "Weight Loss Program",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150"
  },
  {
    id: 2,
    type: "light",
    rating: 4,
    quote: "\"myfit's ability to help you create an actionable fitness journey is truly impressive.\"",
    author: "Alex Mosirimani",
    role: "Personal Training Program",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150"
  },
  {
    id: 3,
    type: "image",
    rating: 4,
    quote: "\"The nutrition programs are perfect to the T! The results have been nothing short of amazing.",
    author: "Jenny Magugi",
    role: "Nutrition Program",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150",
    bgImage: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=800&h=1200", 
    stats: [
      { value: "32%", label: "lead generation" },
      { value: "32%", label: "lead generation" }
    ]
  },
  {
    id: 4,
    type: "light",
    rating: 4,
    quote: "\"I have always struggled to stay consistent with my fitness journey, but myFit has made it easier than ever before. The community is so supportive, and the workout plans are tailored to my needs. \"",
    author: "Abel Rotich",
    role: "Fat Loss Program",
    avatar: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=150&h=150"
  },
  {
    id: 5,
    type: "dark",
    rating: 4,
    quote: "\"With myFit, I've achieved sustainable weight loss and feel more energetic than ever before. The personalized guidance and supportive community have been instrumental in my transformation.\"",
    author: "David Kamau",
    role: "Fat Loss Program",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=150&h=150"
  }
];

const RatingStars = ({ rating }) => {
  return (
    <div className="flex gap-1 mb-8">
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          className={`w-5 h-5 ${i < rating ? "fill-[#e35a38] text-[#e35a38]" : "fill-gray-400/30 text-gray-400/30"}`}
        />
      ))}
    </div>
  );
};

export default function ReviewsClient({ dbReviews }) {
  return (
    <div className="min-h-screen  text-[#1a1c17] p-8 md:p-16 lg:p-24 selection:bg-[#1a1c17] selection:text-[#f4f3f0]">
      <div className="max-w-[1400px] mx-auto">

        {/* Header Section */}
        <header className="mb-20">
          <div className="flex justify-between items-center mb-12">
            <div className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest">
              <span className="text-xl leading-none">✦</span> myfit
            </div>

            <Link href="/" className="flex items-center gap-2 text-sm font-bold hover:opacity-70 transition-opacity bg-black text-white px-4 py-2 rounded-full">
              <ArrowLeft className="w-4 h-4" />Home
            </Link>
          </div>

          <h1 className="text-[2rem] sm:text-[3rem] md:text-[4rem] lg:text-[5rem] font-semibold leading-[0.85] tracking-tighter mb-12">
            Reviews
          </h1>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gray-300 pb-12">
            <h2 className="text-xl md:text-3xl font-bold tracking-tight">©myfit</h2>
            <p className="text-gray-500 max-w-sm text-sm leading-relaxed">
              20+ Clients Trusted us to improve their marketing strategies...
            </p>
          </div>
        </header>

        {/* Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Column 1 */}
          <div className="flex flex-col gap-6">
            <div className="bg-[#1e1e1e] text-white p-6 md:p-10 rounded-sm flex flex-col justify-between shadow-sm min-h-[300px] md:min-h-[350px]">
              <div>
                <RatingStars rating={mockReviews[0].rating} />
                <p className="text-[1.1rem] leading-relaxed mb-12 text-gray-200">
                  {mockReviews[0].quote}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <img src={mockReviews[0].avatar} alt={mockReviews[0].author} className="w-12 h-12 rounded-sm object-cover" />
                <div>
                  <h4 className="font-semibold text-white">{mockReviews[0].author}</h4>
                  <p className="text-sm text-gray-400">{mockReviews[0].role}</p>
                </div>
              </div>
            </div>

            <div className="bg-white text-[#1a1c17] p-6 md:p-10 rounded-sm flex flex-col justify-between shadow-sm min-h-[300px] md:min-h-[350px] border border-gray-100">
              <div>
                <RatingStars rating={mockReviews[1].rating} />
                <p className="text-[1.1rem] leading-relaxed mb-12 text-gray-800">
                  {mockReviews[1].quote}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <img src={mockReviews[1].avatar} alt={mockReviews[1].author} className="w-12 h-12 rounded-sm object-cover" />
                <div>
                  <h4 className="font-semibold text-[#1a1c17]">{mockReviews[1].author}</h4>
                  <p className="text-sm text-gray-500">{mockReviews[1].role}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Column 2 */}
          <div className="flex flex-col gap-6 h-full">
            <div className="relative bg-[#1e1e1e] text-white p-6 md:p-10 rounded-sm flex flex-col justify-end shadow-sm overflow-hidden min-h-[500px] lg:min-h-[724px] h-full">
              <img
                src="https://images.unsplash.com/photo-1534308143481-c55f00be8bd7?q=80&w=1000&auto=format&fit=crop"
                alt="Background"
                className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-luminosity"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#151515] via-[#151515]/80 to-transparent" />

              <div className="relative z-10 flex flex-col h-full justify-end">
                <RatingStars rating={mockReviews[2].rating} />
                <p className="text-[1.1rem] leading-relaxed mb-10 text-gray-200">
                  {mockReviews[2].quote}
                </p>

                <div className="grid grid-cols-2 gap-8 mb-10 border-b border-gray-700/50 pb-8">
                  {mockReviews[2].stats.map((stat, i) => (
                    <div key={i}>
                      <h3 className="text-4xl font-bold mb-2 text-white">{stat.value}</h3>
                      <p className="text-sm text-gray-400">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center gap-4">
                  <img src={mockReviews[2].avatar} alt={mockReviews[2].author} className="w-12 h-12 rounded-sm object-cover" />
                  <div>
                    <h4 className="font-semibold text-white">{mockReviews[2].author}</h4>
                    <p className="text-sm text-gray-400">{mockReviews[2].role}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Column 3 */}
          <div className="flex flex-col gap-6">
            <div className="bg-white text-[#1a1c17] p-6 md:p-10 rounded-sm flex flex-col justify-between shadow-sm min-h-[300px] md:min-h-[350px] border border-gray-100">
              <div>
                <RatingStars rating={mockReviews[3].rating} />
                <p className="text-[1.1rem] leading-relaxed mb-12 text-gray-800">
                  {mockReviews[3].quote}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <img src={mockReviews[3].avatar} alt={mockReviews[3].author} className="w-12 h-12 rounded-sm object-cover" />
                <div>
                  <h4 className="font-semibold text-[#1a1c17]">{mockReviews[3].author}</h4>
                  <p className="text-sm text-gray-500">{mockReviews[3].role}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#1e1e1e] text-white p-6 md:p-10 rounded-sm flex flex-col justify-between shadow-sm min-h-[300px] md:min-h-[350px]">
              <div>
                <RatingStars rating={mockReviews[4].rating} />
                <p className="text-[1.1rem] leading-relaxed mb-12 text-gray-200">
                  {mockReviews[4].quote}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <img src={mockReviews[4].avatar} alt={mockReviews[4].author} className="w-12 h-12 rounded-sm object-cover" />
                <div>
                  <h4 className="font-semibold text-white">{mockReviews[4].author}</h4>
                  <p className="text-sm text-gray-400">{mockReviews[4].role}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Horizontal Scroll Section (Database Reviews) */}
      <HorizontalScrollCarousel dbReviews={dbReviews} />
    </div>
  );
}

const HorizontalScrollCarousel = ({ dbReviews }) => {
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: targetRef,
  });

  const x = useTransform(scrollYProgress, [0, 1], ["0%", "-65%"]);

  return (
    <section ref={targetRef} className="relative md:h-[300vh] mt-16 md:mt-32">
      <div className="md:sticky md:top-0 flex flex-col md:flex-row md:h-screen md:items-center overflow-hidden max-w-[1400px] mx-auto">

        {/* Left Fixed Content */}
        <div className="relative w-full md:w-[400px] flex-shrink-0 px-8 lg:px-0 z-20 bg-white py-8 md:h-full flex flex-col justify-center">
          <Quote className="w-16 h-16 md:w-24 md:h-24 text-gray-300 fill-gray-300 rotate-180 mb-6 md:mb-8" />
          <h2 className="text-3xl md:text-5xl font-bold mb-8 md:mb-16 leading-tight text-[#1a1c17]">
            What our<br />customers are<br />saying
          </h2>

          <div className="hidden md:flex items-center gap-4 text-gray-400">
            <ArrowLeft className="w-5 h-5" />
            <div className="h-[2px] w-32 bg-gray-300 relative">
              <div className="absolute top-0 left-0 h-full w-1/3 bg-black"></div>
            </div>
            <ArrowRight className="w-5 h-5 text-black" />
          </div>
        </div>

        {/* Scrolling Cards */}
        <motion.div style={{ x }} className="flex gap-8 px-8 md:pl-24 overflow-x-auto md:overflow-visible pb-12 md:pb-0 snap-x md:snap-none max-md:!transform-none">
          {dbReviews && dbReviews.length > 0 ? (
            dbReviews.map((review, i) => {
              const authorName = review.profiles?.full_name || "Verified Buyer";
              const avatar = review.profiles?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=random`;
              const programName = review.programs?.name || "Program";
              const date = new Date(review.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });

              return (
                <div key={review.id || i} className="flex flex-col w-[300px] md:w-[450px] flex-shrink-0 overflow-hidden snap-center">
                  <div className="bg-white rounded-[1rem] p-8 relative shadow-sm h-[320px] flex flex-col justify-between">
                    <div className="absolute -bottom-4 left-10 w-8 h-8 bg-white" style={{ clipPath: 'polygon(0 0, 0% 100%, 100% 0)' }}></div>

                    <p className="text-gray-600 text-[1.1rem] leading-relaxed line-clamp-5">
                      "{review.review_text}"
                    </p>

                    <div className="flex gap-1 mt-auto">
                      {[...Array(5)].map((_, j) => (
                        <Star key={j} className={`w-5 h-5 ${j < review.rating ? 'fill-[#2bc48a] text-[#2bc48a]' : 'fill-gray-200 text-gray-200'}`} />
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-4 mt-10 ml-6">
                    <img
                      src={avatar}
                      alt={authorName}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                    <div>
                      <h4 className="font-bold text-[#1a1c17] text-sm flex items-center gap-2">
                        {authorName}
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap">
                          {programName}
                        </span>
                      </h4>
                      <p className="text-xs text-gray-500">{date}</p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
             <p className="text-gray-500 italic pl-8">No reviews yet. Check back soon!</p>
          )}
        </motion.div>

      </div>
    </section>
  );
};
