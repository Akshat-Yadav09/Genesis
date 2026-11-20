import { memo } from "react";
import type { FAQItem } from "../data/faqData";
import { sounds } from "./sound";
import "./faq-accordion.css";

interface FAQAccordionItemProps {
  item: FAQItem;
  isOpen: boolean;
  onToggle: (id: string) => void;
}

export default memo(function FAQAccordionItem({
  item,
  isOpen,
  onToggle,
}: FAQAccordionItemProps) {
  function handleClick() {
    sounds.playClick();
    onToggle(item.id);
  }

  function handleHover() {
    if (window.matchMedia("(hover: hover)").matches) {
      sounds.playHover();
    }
  }

  return (
    <div
      className={`faq-question-card w-full overflow-hidden rounded-md border transition-[border-color,background-color,box-shadow] duration-200 motion-reduce:transition-none ${
        isOpen
          ? "border-sky-400/60 shadow-[0_6px_20px_rgba(0,12,40,0.85)] bg-[#00184B]"
          : "border-[#052c77]/80 hover:border-sky-400/40 hover:shadow-[0_4px_16px_rgba(0,10,30,0.6)] bg-[#00184B]/95"
      }`}
    >
      <button
        type="button"
        id={`faq-trigger-${item.id}`}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${item.id}`}
        onClick={handleClick}
        onMouseEnter={handleHover}
        className="faq-question-btn group flex min-h-[50px] w-full cursor-pointer select-none items-center justify-between gap-4 text-left sm:min-h-[56px] md:min-h-[62px] lg:min-h-[66px]"
      >
        <span className="faq-question-label min-w-0 flex-1">{item.question}</span>
        <span
          className={`faq-accordion-icon flex size-[22px] shrink-0 items-center justify-center rounded-md transition-[rotate,scale,background-color,filter] duration-200 ease-out motion-reduce:transition-none sm:size-[26px] ${
            isOpen
              ? "rotate-45 bg-amber-400/20 drop-shadow-[0_0_8px_#fbbf24]"
              : "motion-safe:group-hover:scale-110"
          }`}
          aria-hidden="true"
        />
      </button>

      <div
        id={`faq-answer-${item.id}`}
        role="region"
        aria-labelledby={`faq-trigger-${item.id}`}
        aria-hidden={isOpen ? undefined : true}
        inert={!isOpen}
        className="faq-accordion-answer"
      >
        <div className="faq-accordion-clip">
          <div className="faq-answer-content border-t border-[#052c77]/60 bg-[#00143f]/80">
            <p className="font-sans text-sky-100 text-xs sm:text-sm md:text-[15px] leading-relaxed selection:bg-cyan-500 selection:text-slate-950">
              {item.answer}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
});
