import { InstagramIcon } from "@/components/icons/lucide-instagram";

export function SiteFooter() {
  return (
    <footer className="bg-[#313030] border-t-4 border-[#7a590c] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 grid grid-cols-1 md:grid-cols-3 gap-6 text-right">
        <div className="flex flex-col gap-4">
          <div className="font-[family-name:var(--font-anton)] uppercase text-[40px] leading-[48px] sm:text-[48px] sm:leading-[56px] text-[#ffdea5]">
            Association Sportive de Djerba
          </div>
          <p className="text-[#ffdea5] text-[16px] leading-[24px] opacity-80">
            © 2024 ASD Soccer Club - Building Our Future Together
          </p>
        </div>
        <div className="flex flex-col gap-4 text-left items-start justify-end">
          <a
            href="https://www.instagram.com/ramiferjani/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-[#ffdea5] text-[14px] leading-[20px] opacity-80 hover:opacity-100 transition-opacity"
          >
            <InstagramIcon className="h-4 w-4" />
            <span>developed by Rami Ferjani @ramiferjani</span>
          </a>
        </div>
        <div className="flex flex-col gap-4" />
      </div>
    </footer>
  );
}