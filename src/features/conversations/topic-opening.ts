import type { Locale } from "@/lib/locale/locale";

import type { ConversationCopy, TopicIdentityCopy } from "./conversation-language";

export type TopicOpeningCard = {
  title: string;
  question: string;
};

export type TopicOpening = {
  eyebrow: string;
  title: string;
  body: string;
  promise: string;
  starterLabel: string;
  cards: TopicOpeningCard[];
  starterHint: string;
  coverageTitle: string;
  coverageBody: string;
  coverageReview?: string;
  coverageYear?: string;
  coverageNote: string;
  guideQuestions: string[];
};

const incomeTaxCards: Record<Locale, TopicOpeningCard[]> = {
  en: [
    { title: "Tax-free income", question: "What is the tax-free income limit for my assessment year?" },
    { title: "Do I need to file?", question: "I have a TIN. Do I need to submit a return if no tax is due?" },
    {
      title: "Understand salary income",
      question: "Which parts of salary count as income?",
    },
    {
      title: "Investment rebates",
      question: "Which investments qualify for a tax rebate, and what proof do I need?",
    },
    {
      title: "Tax already deducted",
      question: "How do I report tax deducted from my salary or bank interest?",
    },
    { title: "Get ready to file", question: "What documents should I gather before preparing my return?" },
  ],
  bn: [
    { title: "করমুক্ত আয়ের সীমা", question: "আমার করবর্ষে করমুক্ত আয়ের সীমা কত?" },
    { title: "রিটার্ন দিতে হবে?", question: "টিআইএন আছে, কর না এলেও কি রিটার্ন দিতে হবে?" },
    {
      title: "বেতনের আয় বুঝুন",
      question: "বেতনের কোন অংশ আয় হিসেবে গণ্য হয়?",
    },
    {
      title: "বিনিয়োগে কর রেয়াত",
      question: "কোন বিনিয়োগে কর রেয়াত পাওয়া যায়, আর কী প্রমাণ লাগে?",
    },
    {
      title: "আগেই কাটা কর",
      question: "বেতন বা ব্যাংক সুদ থেকে কাটা কর রিটার্নে কীভাবে দেখাব?",
    },
    { title: "দরকারি কাগজপত্র", question: "রিটার্ন তৈরির আগে কী কী কাগজপত্র গুছিয়ে রাখব?" },
  ],
};

export function resolveTopicOpening(input: {
  slug: string;
  locale: Locale;
  identity: TopicIdentityCopy;
  copy: ConversationCopy;
  starters: string[];
}): TopicOpening {
  const tax = input.slug === "income-tax";
  const cards = tax
    ? incomeTaxCards[input.locale]
    : input.starters.map((question) => ({ title: question, question }));

  return {
    eyebrow: tax
      ? input.locale === "bn"
        ? "উৎসসহ আয়কর আলোচনা"
        : "A source-led tax conversation"
      : input.locale === "bn"
        ? "উৎসভিত্তিক আলোচনা"
        : "A source-led conversation",
    title: tax ? input.copy.taxOpeningTitle : input.copy.emptyTitle,
    body: tax ? input.copy.taxOpeningBody : input.identity.aboutBody || input.copy.emptyBody,
    promise:
      input.locale === "bn"
        ? "প্রশ্ন করুন · উত্তর বুঝুন · উদ্ধৃত অংশ যাচাই করুন"
        : "Ask naturally · Understand the answer · Inspect cited passages",
    starterLabel: input.copy.startersLabel,
    cards,
    starterHint: input.copy.starterHint,
    coverageTitle: input.copy.coverageTitle,
    coverageBody: input.identity.sourceDescription,
    coverageReview: input.identity.knowledgeReviewDateLabel,
    coverageYear: tax ? input.copy.yearCoverageUnverified : undefined,
    coverageNote: input.copy.coverageNote,
    guideQuestions: cards.slice(0, 3).map((card) => card.question),
  };
}
