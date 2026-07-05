"use client";

import { useHomeData } from "./use-home-data";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { formatEur, formatDate } from "@/lib/format";

export function RecentDonorsSection() {
  const data = useHomeData();

  if (!data) {
    return (
      <section className="bg-[#f6f3f2] py-16 sm:py-20 lg:py-20 border-b-2 border-[#e5e2e1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-6 items-center">
            <Skeleton className="h-[40px] w-[200px] rounded-full" />
            <div className="w-full max-w-3xl flex flex-col gap-4">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-[72px] w-full rounded-sm" />
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  const { latestDonations } = data;

  if (latestDonations.length === 0) {
    return (
      <section className="bg-[#f6f3f2] py-16 sm:py-20 lg:py-20 border-b-2 border-[#e5e2e1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-[#3e4a41]">
          لا توجد تبرعات بعد. كون أول داعم!
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#f6f3f2] py-16 sm:py-20 lg:py-20 border-b-2 border-[#e5e2e1]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 items-center">
          {/* Tab pill */}
          <div className="flex bg-[#f0eded] p-1 rounded-full mb-4">
            <button className="px-8 py-2 bg-[#fcf9f8] text-[#006b3f] font-bold text-[14px] tracking-[0.05em] rounded-full shadow-sm min-h-[44px]">
              أحدث التبرعات
            </button>
          </div>

          {/* Donor cards */}
          <div className="w-full max-w-3xl flex flex-col gap-4">
            {latestDonations.map((d) => (
              <div
                key={d._id}
                className="bg-[#fcf9f8] p-4 border border-[#bdcabe] rounded-sm flex items-center justify-between shadow-sm flex-wrap gap-3"
              >
                <div className="flex items-center gap-4">
                  <Avatar className="w-12 h-12 rounded-sm">
                    <AvatarImage
                      src={d.donor?.imageUrl}
                      alt={d.donor?.name ?? ""}
                    />
                    <AvatarFallback className="bg-[#7a590c] text-white rounded-sm">
                      <span className="material-symbols-outlined no-rtl text-[20px]">
                        sports_soccer
                      </span>
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col">
                    <span className="font-bold text-[20px] leading-[28px] text-[#1c1b1b] uppercase">
                      {d.donor?.name ?? "Anonymous"}
                    </span>
                    <span className="text-[16px] leading-[24px] text-[#3e4a41] opacity-70">
                      {formatDate(d.createdAt)}
                    </span>
                  </div>
                </div>
                <div className="bg-[#313030] text-[#fcf9f8] px-4 py-1 rounded-full font-[family-name:var(--font-anton)] text-[20px]">
                  {formatEur(d.amount)}
                </div>
              </div>
            ))}
          </div>

          {/* View All */}
          <a
            href="#challenge"
            className="mt-8 border-2 border-[#313030] text-[#313030] font-bold text-[14px] tracking-[0.05em] uppercase px-12 py-3 rounded-sm hover:bg-[#313030] hover:text-[#fcf9f8] transition-colors min-h-[44px] inline-flex items-center"
          >
            عرض كل الداعمين
          </a>
        </div>
      </div>
    </section>
  );
}