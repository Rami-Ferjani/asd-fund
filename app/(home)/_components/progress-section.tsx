"use client";

import { useHomeData } from "./use-home-data";
import { Skeleton } from "@/components/ui/skeleton";
import { formatEur } from "@/lib/format";
import { FUNDRAISING_GOAL_EUR, CAMPAIGN_DEADLINE_ISO } from "@/lib/constants";

function daysRemaining(): number {
  const now = Date.now();
  const deadline = new Date(CAMPAIGN_DEADLINE_ISO).getTime();
  const diff = deadline - now;
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

export function ProgressSection() {
  const data = useHomeData();

  if (!data) {
    return (
      <section className="bg-[#f6f3f2] py-16 sm:py-20 lg:py-20 border-y-2 border-[#e5e2e1]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#fcf9f8] p-8 border-2 border-[#bdcabe] rounded-sm">
            <Skeleton className="h-[120px] w-full" />
          </div>
        </div>
      </section>
    );
  }

  const { totalRaised, donorCount } = data;
  const pct = Math.min(100, (totalRaised / FUNDRAISING_GOAL_EUR) * 100);

  return (
    <section
      id="progress"
      className="bg-[#f6f3f2] py-16 sm:py-20 lg:py-20 border-y-2 border-[#e5e2e1]"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 bg-[#fcf9f8] p-8 border-2 border-[#bdcabe] rounded-sm">
          <div className="flex flex-col sm:flex-row-reverse justify-between items-end gap-4">
            {/* Right (RTL start): raised */}
            <div className="text-right">
              <span className="font-[family-name:var(--font-anton)] text-[40px] leading-[48px] sm:text-[48px] sm:leading-[56px] text-[#006b3f]">
                {formatEur(totalRaised)}
              </span>{" "}
              <span className="text-[18px] leading-[28px] text-[#3e4a41]">
                تجمعوا من هدف {FUNDRAISING_GOAL_EUR.toLocaleString("en-IE")}{" "}
                يورو
              </span>
            </div>

            {/* Left: stats */}
            <div className="text-left">
              <div className="font-bold text-[20px] leading-[28px] text-[#7a590c]">
                {donorCount} داعمين
              </div>
              <div className="font-bold text-[20px] leading-[28px] text-[#ba1a1a]">
                {daysRemaining()} يوم مازالو
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div
            className="w-full h-6 bg-[#e5e2e1] rounded-full overflow-hidden border border-[#bdcabe] relative"
            dir="ltr"
          >
            <div
              className="h-full bg-[#006b3f] relative transition-all duration-700"
              style={{ width: `${pct}%` }}
            >
              <div className="absolute right-0 top-0 bottom-0 w-12 bg-gradient-to-l from-[#fed17b] to-transparent opacity-80" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
