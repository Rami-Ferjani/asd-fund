export function HeroSection() {
  return (
    <section
      id="hero"
      className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-20 grid grid-cols-1 lg:grid-cols-2 gap-6 items-center"
    >
      {/* ── Text column ── */}
      <div className="flex flex-col gap-6 z-10 text-right">
        <h1 className="font-[family-name:var(--font-anton)] uppercase leading-tight text-[40px] leading-[44px] sm:text-[56px] sm:leading-[60px] lg:text-[72px] lg:leading-[80px] text-[#006b3f]">
          وصلوا ASD للثنية:
          <br />
          <span className="text-[#fed17b]">
            اليد في اليد نشريو حافلة للجمعية
          </span>
        </h1>

        <div className="flex flex-col gap-4 text-[18px] leading-[28px] text-[#3e4a41] max-w-lg">
          <p>
            تسعى الجمعية الرياضية بجربة إلى اقتناء حافلة خاصة تضمن تنقل مريح
            وآمن للاعبينا في كل المباريات ⚽️✨
          </p>
          <p className="font-bold text-[#006b3f]">🎯 هدفنا: 21 ألف يورو</p>
          <p>
            هذا المشروع هو خطوة مهمة لمستقبل الجمعية... وبدعمكم نقدروا نوصلوا
            🙏
          </p>
          <p>
            🤝 كل مساهمة، كل مشاركة، وكل كلمة دعم تقرّبنا أكثر من تحقيق هذا
            الحلم
          </p>
        </div>

        <div className="flex gap-4 mt-4 justify-start flex-row-reverse">
          <a
            href="#contribute"
            className="bg-[#fed17b] text-[#1c1b1b] font-bold text-[14px] tracking-[0.05em] uppercase px-8 py-4 rounded-sm hover:bg-[#008751] hover:text-white transition-colors border-2 border-transparent min-h-[44px] inline-flex items-center"
          >
            تبرع توة
          </a>
          <a
            href="#impact"
            className="bg-transparent text-[#006b3f] border-2 border-[#006b3f] font-bold text-[14px] tracking-[0.05em] uppercase px-8 py-4 rounded-sm hover:bg-[#006b3f] hover:text-white transition-colors min-h-[44px] inline-flex items-center"
          >
            اعرف أكثر
          </a>
        </div>
      </div>

      {/* ── Bus image ── */}
      <div className="relative h-[300px] sm:h-[400px] lg:h-[600px] w-full rounded-xl overflow-hidden border-2 border-[#006b3f]">
        <img
          alt="ASD Soccer Club Team Bus"
          className="absolute inset-0 w-full h-full object-cover"
          src="/images/car.jpeg"
        />
      </div>
    </section>
  );
}