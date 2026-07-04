export function ImpactSection() {
  return (
    <section id="impact" className="bg-[#fcf9f8] py-16 sm:py-20 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="font-[family-name:var(--font-anton)] uppercase text-[28px] leading-[34px] sm:text-[32px] sm:leading-[40px] text-[#006b3f] text-center mb-16 sm:mb-20">
          علاش حاجتنا بالحافلة هذه
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-[#fcf9f8] p-8 border border-[#bdcabe] hover:border-[#006b3f] border-b-4 hover:border-b-[#fed17b] transition-all flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#008751] text-white flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-3xl no-rtl">
                groups
              </span>
            </div>
            <h3 className="font-bold text-[20px] leading-[28px] text-[#1c1b1b]">
              سفر فريق الشباب
            </h3>
            <p className="text-[16px] leading-[24px] text-[#3e4a41]">
              توفير نقل مضمون لأكاديميات الشباب متاعنا للمقابلات لبرة، باش
              نضمنوا لكل موهبة شابة القدرة على المنافسة.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#fcf9f8] p-8 border border-[#bdcabe] hover:border-[#006b3f] border-b-4 hover:border-b-[#fed17b] transition-all flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#008751] text-white flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-3xl no-rtl">
                health_and_safety
              </span>
            </div>
            <h3 className="font-bold text-[20px] leading-[28px] text-[#1c1b1b]">
              سلامة الملاعبية
            </h3>
            <p className="text-[16px] leading-[24px] text-[#3e4a41]">
              كيران عصرية ومجهزة تضمن لملاعبيتنا سفر آمن ويوصلوا مرتاحين،
              حاضرين باش يعطيو ما عندهم.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#fcf9f8] p-8 border border-[#bdcabe] hover:border-[#006b3f] border-b-4 hover:border-b-[#fed17b] transition-all flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[#008751] text-white flex items-center justify-center mb-2">
              <span className="material-symbols-outlined text-3xl no-rtl">
                workspace_premium
              </span>
            </div>
            <h3 className="font-bold text-[20px] leading-[28px] text-[#1c1b1b]">
              روح الفريق
            </h3>
            <p className="text-[16px] leading-[24px] text-[#3e4a41]">
              السفر مع بعضنا يبني الرفقة. الكار تولي المقر متاعنا المتنقل،
              وتعزز الوحدة وفخر النادي في كل رحلة.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}