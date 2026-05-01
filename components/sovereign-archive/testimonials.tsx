"use client";

import Image from "next/image";

export interface Testimonial {
  quote: string;
  author: string;
  role: string;
  imageSrc?: string;
  rating?: number;
}

interface TestimonialsProps {
  id?: string;
  sectionLabel?: string;
  title: string;
  testimonials: Testimonial[];
  stats?: Array<{ value: string; label: string }>;
}

export function TestimonialsSection({
  id,
  sectionLabel = "Testimonials",
  title = "Trusted by the world's most demanding legal teams.",
  testimonials = [],
  stats = [
    { value: "500+", label: "Firms" },
    { value: "Fortune 100", label: "Trusted" },
  ],
}: TestimonialsProps) {
  const [featuredTestimonial, ...otherTestimonials] = testimonials;

  const renderStars = () => {
    return Array.from({ length: 5 }).map((_, i) => (
      <span key={i} className="text-lg text-[#00D384]">
        ★
      </span>
    ));
  };

  return (
    <section id={id} className="bg-white py-20 lg:py-28">
      <div className="mx-auto max-w-7xl px-6 md:px-8">
        <div className="mb-16 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="mb-2 block text-xs font-bold uppercase tracking-[0.24em] text-[#006d42]">
              {sectionLabel}
            </span>
            <h2 className="max-w-2xl text-4xl font-black text-[#002147] md:text-5xl">
              {title}
            </h2>
          </div>
          {stats && stats.length > 0 && (
            <div className="flex gap-8">
              {stats.map((stat, idx) => (
                <div key={idx} className="text-center">
                  <div className="text-2xl font-black text-[#002147]">
                    {stat.value}
                  </div>
                  <div className="text-xs text-slate-500 uppercase font-semibold tracking-widest">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {featuredTestimonial && (
          <div className="rounded-[2rem] border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-10 shadow-lg">
            <div className="mb-6 flex gap-1">{renderStars()}</div>
            <p className="mb-8 text-2xl font-bold leading-relaxed text-[#002147] italic">
              {`"${featuredTestimonial.quote}"`}
            </p>
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#002147] text-sm font-bold text-white">
                {featuredTestimonial.author
                  .split(" ")
                  .map((part) => part[0])
                  .slice(0, 2)
                  .join("")}
              </div>
              <div>
                <div className="font-bold text-[#002147]">
                  {featuredTestimonial.author}
                </div>
                <div className="text-sm text-slate-500">
                  {featuredTestimonial.role}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {otherTestimonials.map((testimonial, idx) => (
            <div
              key={idx}
              className="flex flex-col rounded-[1.75rem] border border-slate-200 p-8 shadow-sm transition hover:shadow-md"
            >
              <div className="flex gap-1 mb-6">{renderStars()}</div>
              <p className="mb-8 flex-1 font-medium leading-relaxed text-slate-700">
                {`"${testimonial.quote}"`}
              </p>
              <div className="mt-auto flex items-center gap-4 border-t border-slate-100 pt-6">
                {testimonial.imageSrc && (
                  <Image
                    alt={testimonial.author}
                    className="h-12 w-12 rounded-full bg-slate-200 object-cover"
                    src={testimonial.imageSrc}
                    width={48}
                    height={48}
                  />
                )}
                <div>
                  <div className="text-sm font-bold text-[#002147]">
                    {testimonial.author}
                  </div>
                  <div className="text-xs text-slate-500">
                    {testimonial.role}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
