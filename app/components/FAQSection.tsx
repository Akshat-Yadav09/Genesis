"use client";

import Image from "next/image";
import { useCallback, useState } from "react";
import { FAQ_DATA, type FAQCategory } from "../data/faqData";
import FAQAccordionItem from "./FAQAccordionItem";
import { sounds } from "./sound";
import "./faq-section.css";

const CATEGORIES: FAQCategory[] = ["general", "technical", "prizes", "logistics"];

export default function FAQSection() {
  const [activeCategory, setActiveCategory] = useState<FAQCategory>("general");
  const [expandedQuestionId, setExpandedQuestionId] = useState<string | null>(null);

  function handleCategoryChange(category: FAQCategory) {
    if (category === activeCategory) return;

    sounds.playClick();
    setActiveCategory(category);
    setExpandedQuestionId(null);
  }

  const handleToggleQuestion = useCallback((id: string) => {
    setExpandedQuestionId((previousId) => (previousId === id ? null : id));
  }, []);

  return (
    <section id="faq" className="genesis-faq" aria-labelledby="faq-heading">
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none" aria-hidden="true">
        <Image
          fill
          unoptimized
          src="/landing-pages/faq/backgrounds/bg-cosmic-faq.svg"
          alt=""
          className="object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_30%,rgba(3,0,21,0.6)_100%)]" />
        <div className="absolute top-0 inset-x-0 h-24 sm:h-32 bg-gradient-to-b from-[#030015] to-transparent" />
      </div>

      <div className="genesis-faq__layout">
        <h2 id="faq-heading" className="genesis-faq__heading">
          <span className="sr-only">Frequently Asked Questions</span>
          <Image
            fill
            unoptimized
            src="/landing-pages/faq/ui/faq-banner.svg"
            alt=""
            className="object-contain drop-shadow-[0_8px_20px_rgba(0,0,0,0.85)]"
          />
        </h2>

        <nav aria-label="FAQ Categories" className="genesis-faq__categories">
          {CATEGORIES.map((category) => {
            const { label } = FAQ_DATA[category];
            const isActive = activeCategory === category;

            return (
              <button
                key={category}
                type="button"
                id={`faq-category-${category}`}
                aria-pressed={isActive}
                aria-controls="faq-category-panel"
                data-active={isActive}
                onClick={() => handleCategoryChange(category)}
                onMouseEnter={() => {
                  if (window.matchMedia("(hover: hover)").matches) {
                    sounds.playHover();
                  }
                }}
                className="faq-category-button"
              >
                <span className="faq-category-label">{label}</span>
              </button>
            );
          })}
        </nav>

        <div
          id="faq-category-panel"
          role="region"
          aria-labelledby={`faq-category-${activeCategory}`}
          className="genesis-faq__panel"
        >
          <div className="genesis-faq__panel-header">
            <div className="genesis-faq__category-artwork">
              <Image
                fill
                unoptimized
                src={FAQ_DATA[activeCategory].headerSvg}
                alt=""
                className="object-contain drop-shadow-[0_3px_6px_rgba(0,0,0,0.7)]"
              />
            </div>
          </div>

          <div className="genesis-faq__question-stack">
            {CATEGORIES.map((category) => {
              const isActive = activeCategory === category;

              return (
                <ul
                  key={category}
                  role="list"
                  className="genesis-faq__questions"
                  inert={!isActive}
                >
                  {FAQ_DATA[category].questions.map((question) => (
                    <li key={question.id}>
                      <FAQAccordionItem
                        item={question}
                        isOpen={isActive && expandedQuestionId === question.id}
                        onToggle={handleToggleQuestion}
                      />
                    </li>
                  ))}
                </ul>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
