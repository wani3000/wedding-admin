"use client";

import Image from "next/image";
import { useState, useCallback, memo, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollReveal } from "../ui/ScrollReveal";
import { Copy, ChevronDown } from "lucide-react";
import { copyToClipboard } from "@/lib/utils/clipboard";
import type { WeddingContent, AccountInfo } from "@/lib/content/types";

function getBankIconSrc(bank: string) {
  if (bank.includes("카카오")) return "/icon/bank/kakaobank.png";
  if (bank.includes("기업")) return "/icon/bank/ibk.png";
  if (bank.includes("하나")) return "/icon/bank/hana.png";
  if (bank.includes("국민")) return "/icon/bank/kookmin.png";
  if (bank.includes("농협")) return "/icon/bank/nh.png";
  if (bank.includes("신한")) return "/icon/bank/shinhan.png";
  if (bank.includes("우리")) return "/icon/bank/woori.png";
  if (bank.includes("토스")) return "/icon/bank/toss.png";
  return null;
}

const AccountDropdown = memo(function AccountDropdown({
  title,
  accounts,
  isOpen,
  onToggle,
  onCopy,
}: {
  title: string;
  accounts: AccountInfo[];
  isOpen: boolean;
  onToggle: () => void;
  onCopy: (account: string, holder: string) => void;
}) {
  return (
    <div className="w-full bg-white">
      <div
        onClick={onToggle}
        className={`w-full flex items-center justify-between py-6 transition-colors hover:bg-gray-50/50 cursor-pointer ${isOpen ? "md:border-b md:border-gray-100" : ""}`}
      >
        <span className="text-xl md:text-2xl font-sans text-gray-900">
          {title}
        </span>
        <ChevronDown
          className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
        />
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.21, 0.47, 0.32, 0.98] }}
            className="overflow-hidden"
          >
            <div className="py-4 space-y-6">
              {accounts.map((account, index) => {
                const bankIconSrc = getBankIconSrc(account.bank);

                return (
                  <div key={`${account.account}-${index}`} className="px-1">
                    <div className="mb-3">
                      <span className="text-sm font-sans font-semibold uppercase tracking-widest text-gray-900">
                        {account.name}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-3 pl-0.5">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-gray-100">
                          {bankIconSrc && (
                            <Image
                              src={bankIconSrc}
                              alt={account.bank}
                              fill
                              className="object-cover"
                            />
                          )}
                        </div>
                        <div className="space-y-1.5 min-w-0">
                          <div className="text-xl md:text-2xl font-sans tracking-tight text-gray-900 break-all">
                            {account.account}
                          </div>
                          <div className="text-base text-gray-900 font-sans font-light">
                            {account.bank} · {account.holder}
                          </div>
                        </div>
                      </div>
                      <div
                        onPointerDown={(e) => {
                          e.stopPropagation();
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          onCopy(account.account, account.holder);
                        }}
                        className="flex shrink-0 items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-all rounded-full bg-black text-white hover:bg-gray-800 cursor-pointer select-none"
                      >
                        <Copy className="w-3.5 h-3.5" />
                        <span className="font-sans">복사</span>
                      </div>
                    </div>
                    {index !== accounts.length - 1 && (
                      <div className="mt-6 border-t border-gray-50" />
                    )}
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
});

export function Account({
  content,
}: {
  content: WeddingContent["accountSection"];
}) {
  const [groomDropdownOpen, setGroomDropdownOpen] = useState(false);
  const [brideDropdownOpen, setBrideDropdownOpen] = useState(false);
  const toastRef = useRef<HTMLDivElement>(null);
  const toastTextRef = useRef<HTMLSpanElement>(null);

  const handleCopy = useCallback((account: string, holder: string) => {
    copyToClipboard(account, () => {
      if (toastRef.current && toastTextRef.current) {
        toastTextRef.current.textContent = `${holder} 님의 계좌번호가 복사되었어요`;
        toastRef.current.style.opacity = "1";
        toastRef.current.style.transform = "translate(-50%, 0)";
        setTimeout(() => {
          if (toastRef.current) {
            toastRef.current.style.opacity = "0";
            toastRef.current.style.transform = "translate(-50%, 20px)";
          }
        }, 2000);
      }
    });
  }, []);

  const toggleGroom = useCallback(() => {
    setGroomDropdownOpen((prev) => !prev);
  }, []);

  const toggleBride = useCallback(() => {
    setBrideDropdownOpen((prev) => !prev);
  }, []);

  return (
    <section className="px-4 py-20 md:px-8 md:py-28 lg:px-10 lg:py-32 bg-white">
      <div className="mx-auto max-w-6xl">
        <ScrollReveal width="100%">
          <div className="flex flex-col gap-10 mb-16 md:mb-20">
            <div className="flex flex-col gap-6">
              <h2 className="font-sans text-[28px] font-medium leading-[1.33] tracking-tight md:text-[38px] lg:text-[46px] text-gray-900">
                {content.title}
              </h2>
              <div className="flex flex-col gap-2">
                <p className="text-base md:text-lg text-gray-600 font-sans leading-relaxed max-w-2xl whitespace-pre-line">
                  {content.descriptionTop}
                </p>
                <p className="text-base md:text-lg text-gray-600 font-sans leading-relaxed max-w-2xl whitespace-pre-line">
                  {content.descriptionBottom}
                </p>
              </div>
            </div>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-0 md:gap-8">
          <ScrollReveal delay={0.2} width="100%">
            <div className="border-t border-gray-900/10">
              <AccountDropdown
                title={content.groomTitle}
                accounts={content.groomAccounts}
                isOpen={groomDropdownOpen}
                onToggle={toggleGroom}
                onCopy={handleCopy}
              />
            </div>
          </ScrollReveal>

          <ScrollReveal delay={0.3} width="100%">
            <div className="border-t border-gray-900/10">
              <AccountDropdown
                title={content.brideTitle}
                accounts={content.brideAccounts}
                isOpen={brideDropdownOpen}
                onToggle={toggleBride}
                onCopy={handleCopy}
              />
            </div>
          </ScrollReveal>
        </div>
      </div>

      <div
        ref={toastRef}
        className="fixed bottom-28 left-1/2 z-[9999] transition-all duration-300 pointer-events-none"
        style={{ opacity: 0, transform: "translate(-50%, 20px)" }}
      >
        <div className="bg-black text-white px-6 py-3 rounded-lg shadow-lg font-sans text-sm whitespace-nowrap">
          <span ref={toastTextRef}>계좌번호가 복사되었어요</span>
        </div>
      </div>
    </section>
  );
}
