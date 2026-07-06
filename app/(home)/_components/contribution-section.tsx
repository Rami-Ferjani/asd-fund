export function ContributionSection() {
  return (
    <section
      id="contribute"
      className="bg-[#f6f3f2] py-16 sm:py-20 lg:py-20 border-y-2 border-[#e5e2e1]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="font-[family-name:var(--font-anton)] uppercase text-[28px] leading-[34px] sm:text-[32px] sm:leading-[40px] text-[#006b3f] mb-6">
          كيفاش تساهم
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ── RIB ── */}
          <div className="flex flex-col items-center gap-4 p-6 bg-[#fcf9f8] rounded-sm border border-[#bdcabe]">
            <span className="material-symbols-outlined text-[#006b3f] text-3xl no-rtl">
              account_balance
            </span>
            <h3 className="font-bold text-[20px] leading-[28px] text-[#1c1b1b]">
              تحويل بنكي (RIB)
            </h3>
            <p
              className="text-[16px] leading-[24px] text-[#3e4a41] font-bold tracking-wider"
              dir="ltr"
            >
              FR76 1360 6000 7231 3343 7700 069
            </p>
          </div>

          {/* ── Contact person ── */}
          <div className="flex flex-col items-center gap-4 p-6 bg-[#fcf9f8] rounded-sm border border-[#bdcabe]">
            <span className="material-symbols-outlined text-[#006b3f] text-3xl no-rtl">
              person
            </span>
            <h3 className="font-bold text-[20px] leading-[28px] text-[#1c1b1b]">
              المسؤول عن التبرعات
            </h3>
            <p className="text-[16px] leading-[24px] text-[#3e4a41]">
              Samir Chergui
            </p>
          </div>

          {/* ── WhatsApp ── */}
          <div className="flex flex-col items-center gap-4 p-6 bg-[#fcf9f8] rounded-sm border border-[#bdcabe]">
            <span className="material-symbols-outlined text-[#006b3f] text-3xl no-rtl">
              chat
            </span>
            <h3 className="font-bold text-[20px] leading-[28px] text-[#1c1b1b]">
              الهاتف / واتساب
            </h3>
            <a
              className="text-[16px] leading-[24px] text-[#006b3f] hover:text-[#7a590c] transition-colors font-bold"
              dir="ltr"
              href="https://wa.me/33661625842"
            >
              +33 6 61 62 58 42
            </a>
          </div>
        </div>
        <p className="mt-8 text-[18px] leading-[28px] text-[#3e4a41] italic">
          بعد مساهمتك، ابعثلنا ميساج باش تاخذ بلاصتك في التحدي!
        </p>
      </div>
    </section>
  );
}
