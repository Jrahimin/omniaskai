export type TopicCardCopy = {
  title: string;
  subtitle: string;
  sourceDescription: string;
  explore: string;
  badge?: string;
  preview?: {
    youLabel: string;
    assistantLabel: string;
    question: string;
    answer: string;
    sources: string[];
  };
  exampleLabel: string;
  exampleNote?: string;
};

export type LandingCopy = {
  meta: {
    title: string;
    description: string;
  };
  languageSwitch: {
    ariaLabel: string;
    pending: string;
  };
  nav: {
    primary: string;
    topics: string;
    howItWorks: string;
    sources: string;
    tryIncomeTax: string;
    menu: string;
  };
  hero: {
    badge: string;
    headline: string;
    headlineEmphasis: string;
    body: string;
    exploreTopics: string;
    seeExample: string;
    guide: {
      eyebrow: string;
      title: string;
      intro: string;
      steps: [{ title: string; body: string }, { title: string; body: string }, { title: string; body: string }];
      note: string;
      close: string;
    };
    heroImageAlt: string;
    proof: [string, string, string];
    example: {
      label: string;
      questionLabel: string;
      question: string;
      answerLabel: string;
      answer: string;
      sourceLabel: string;
      passageLabel: string;
      passage: string;
    };
  };
  topics: {
    heading: string;
    empty: string;
    unavailable: string;
    exampleLabel: string;
    englishExample: string;
    exploreTemplate: string;
    previewYouLabel: string;
    previewAssistantLabel: string;
  };
  features: {
    items: [
      { title: string; body: string },
      { title: string; body: string },
      { title: string; body: string },
      { title: string; body: string },
    ];
  };
  howItWorks: {
    heading: string;
    kicker: string;
    intro: string;
    flow: {
      questionLabel: string;
      question: string;
      answerLabel: string;
      answer: string;
      passageLabel: string;
      passage: string;
      followLabel: string;
      follow: string;
    };
    stepsHeading: string;
    steps: [
      { title: string; body: string },
      { title: string; body: string },
      { title: string; body: string },
    ];
  };
  coverage: {
    heading: string;
    intro: string;
    points: [
      { title: string; body: string },
      { title: string; body: string },
      { title: string; body: string },
    ];
    storageTitle: string;
    storageBody: string;
  };
  finalCta: {
    heading: string;
    headingEmphasis: string;
    body: string;
    action: string;
  };
  footer: {
    tagline: string;
    copyright: string;
    authorName: string;
    opensInNewTab: string;
    sources: string;
    operator: string;
  };
};

export const landingLanguage = {
  en: {
    meta: {
      title: "OmniAskAI — Local questions. Clear answers.",
      description:
        "Explore Bangladesh income tax, history, literature and culture through focused conversations grounded in selected sources.",
    },

    languageSwitch: {
      ariaLabel: "Interface language",
      pending: "Updating language",
    },

    nav: {
      primary: "Primary",
      topics: "Topics",
      howItWorks: "How it works",
      sources: "Sources & coverage",
      tryIncomeTax: "Try Income Tax",
      menu: "Open menu",
    },

    hero: {
      badge: "Selected sources. Plain language.",
      headline: "Local questions. Clear answers.",
      headlineEmphasis: "Sources you can open.",
      body: "Explore Bangladesh income tax, history, literature and culture through focused conversations grounded in selected sources. Ask in Bangla, English or Banglish—and follow the evidence behind the answer.",
      exploreTopics: "Explore topics",
      seeExample: "See how answers work",
      guide: {
        eyebrow: "A CLEARER WAY TO ASK",
        title: "From your question to a source you can see.",
        intro: "OmniAskAI helps you explore a topic in plain language, then shows the material behind its explanation.",
        steps: [
          { title: "Ask naturally", body: "Choose a topic and ask the question you actually have. For changing rules, include the year." },
          { title: "Read the explanation", body: "Get a focused answer drawn from the selected material for that topic, in your own language." },
          { title: "Check for yourself", body: "Open the supporting passage, see where it came from, and ask a follow-up if something is unclear." },
        ],
        note: "Selected sources may not cover everything. Check the passage and its date before relying on an answer.",
        close: "Close guide",
      },
      heroImageAlt:
        "Illustration of OmniAskAI topics including Income Tax and Literature",
      proof: [
        "Open the source behind an answer",
        "Ask follow-ups in your own language",
        "See each topic’s coverage and review status",
      ],
      example: {
        label: "Illustration",
        questionLabel: "Question",
        question: "What income sources are taxable in Bangladesh?",
        answerLabel: "Answer",
        answer:
          "Salary and business income can be taxable. The exact rule depends on the income type and year.",
        sourceLabel: "Illustration · not a real citation",
        passageLabel: "What a source looks like",
        passage:
          "Inside Income Tax, open a matching passage from its selected documents and check which year it applies to.",
      },
    },

    topics: {
      heading: "Choose a topic. Ask one real question.",
      empty: "No topics are published yet. Check back soon.",
      unavailable: "Topics are temporarily unavailable. Please try again shortly.",
      exampleLabel: "Example",
      englishExample: "Example · English",
      exploreTemplate: "Explore {title}",
      previewYouLabel: "You",
      previewAssistantLabel: "OmniAskAI",
    },

    features: {
      items: [
        {
          title: "Stay inside the topic",
          body: "Ask about one subject without repeating the same background every time.",
        },
        {
          title: "Open the passage",
          body: "Read the explanation, then open the supporting passage beside it.",
        },
        {
          title: "Ask in your language",
          body: "Follow up in Bangla, English or Banglish. Interface language is separate from the answer.",
        },
        {
          title: "This visit stays here",
          body: "A conversation in this version stays in the browser tab. It is not saved to an account, and reloading starts fresh.",
        },
      ],
    },

    howItWorks: {
      kicker: "How an answer earns trust",
      heading: "An answer is more useful when you can inspect its foundation.",
      intro:
        "Read the explanation, open the supporting passage, then ask what it means for your question.",
      flow: {
        questionLabel: "Question",
        question: "Which parts of salary count as income?",
        answerLabel: "Explanation",
        answer:
          "Basic pay and several allowances can count. What applies depends on the income type and the year in the source.",
        passageLabel: "Illustration of a passage",
        passage:
          "The topic keeps the supporting note beside the answer, with its publisher and date when those are known.",
        followLabel: "Follow-up",
        follow: "Which year does this apply to?",
      },
      stepsHeading: "Three steps",
      steps: [
        {
          title: "Choose a topic",
          body: "Income tax, literature, history or culture — each one has its own selected sources.",
        },
        {
          title: "Ask your question",
          body: "Use Bangla, English or Banglish. Tell the topic the year or situation when it matters.",
        },
        {
          title: "Open the evidence",
          body: "Inspect the passage behind the explanation, then ask a follow-up.",
        },
      ],
    },

    coverage: {
      heading: "Sources and coverage",
      intro:
        "Each topic answers from documents selected for that subject. A source you can open is the proof — not a claim that every rule or edition is included.",
      points: [
        {
          title: "Selected, not exhaustive",
          body: "Income Tax uses ordinances, NBR guidance and related notes. Literature, history and culture use their own selected material. If the evidence is missing, the answer should say so.",
        },
        {
          title: "Review date is not the law’s year",
          body: "A date on a topic is when the material was reviewed for OmniAskAI. It is not the document’s publication date or the year a rule applies. Ask which year you mean, and check the source.",
        },
        {
          title: "What you can verify",
          body: "Open the passage, the publisher and the original when a link is available. If a title or excerpt cannot be shown clearly, use the original document.",
        },
      ],
      storageTitle: "How conversations are kept",
      storageBody:
        "There is no account yet. A conversation stays in this browser tab for the visit. Reloading or closing the tab clears the visible history. Nothing here is a saved research library.",
    },

    finalCta: {
      heading: "Start with one question that matters to you.",
      headingEmphasis: "See what the sources support.",
      body: "Pick a topic, ask naturally, and open the passage behind the explanation.",
      action: "Explore topics",
    },

    footer: {
      tagline: "Local questions. Clear answers. Sources you can open.",
      copyright: "© 2026",
      authorName: "Junayed Rahimin",
      opensInNewTab: "Opens in a new tab",
      sources: "Sources & coverage",
      operator: "Operated by",
    },
  },

  bn: {
    meta: {
      title: "OmniAskAI — আপনার প্রশ্নের সহজ উত্তর",
      description:
        "নির্বাচিত উৎস থেকে বাংলাদেশের আয়কর, ইতিহাস, সাহিত্য ও সংস্কৃতি নিয়ে কথা বলুন। উত্তরের পাশে যাচাই করার উৎস খুলুন।",
    },

    languageSwitch: {
      ariaLabel: "ইন্টারফেসের ভাষা",
      pending: "ভাষা বদলাচ্ছে",
    },

    nav: {
      primary: "প্রধান নেভিগেশন",
      topics: "বিষয়",
      howItWorks: "কীভাবে কাজ করে",
      sources: "উৎস ও পরিধি",
      tryIncomeTax: "আয়কর দেখুন",
      menu: "মেনু খুলুন",
    },

    hero: {
      badge: "নির্বাচিত উৎস। সহজ ভাষা।",
      headline: "আপনার প্রশ্নের সহজ উত্তর।",
      headlineEmphasis: "সঙ্গে যাচাই করার উৎস।",
      body: "বাংলাদেশের আয়কর, ইতিহাস, সাহিত্য ও সংস্কৃতি নিয়ে আলাদা আলাদা আলোচনা — নির্বাচিত উৎসের ভিত্তিতে। বাংলা, ইংরেজি বা বাংলিশে জিজ্ঞেস করুন, তারপর উত্তরের পেছনের অংশটি খুলে দেখুন।",
      exploreTopics: "বিষয় দেখুন",
      seeExample: "উত্তর কীভাবে কাজ করে",
      guide: {
        eyebrow: "প্রশ্ন করার সহজ উপায়",
        title: "আপনার প্রশ্ন থেকে যাচাইযোগ্য উৎস পর্যন্ত।",
        intro: "OmniAskAI সহজ ভাষায় বিষয়টি বুঝতে সাহায্য করে, তারপর ব্যাখ্যার পেছনের উপাদান দেখায়।",
        steps: [
          { title: "স্বাভাবিকভাবে জিজ্ঞেস করুন", body: "একটি বিষয় বেছে নিয়ে নিজের প্রশ্নটি করুন। নিয়ম বদলালে কোন বছরের কথা বলছেন, সেটাও জানান।" },
          { title: "ব্যাখ্যা পড়ুন", body: "সেই বিষয়ের নির্বাচিত উপাদান থেকে নিজের ভাষায় প্রাসঙ্গিক উত্তর দেখুন।" },
          { title: "নিজেই মিলিয়ে নিন", body: "সহায়ক অংশ ও তার উৎস খুলুন। কিছু অস্পষ্ট হলে পরের প্রশ্নটি করুন।" },
        ],
        note: "নির্বাচিত উৎসে সব তথ্য নাও থাকতে পারে। কোনো উত্তরের ওপর নির্ভর করার আগে অংশটি ও তার তারিখ মিলিয়ে নিন।",
        close: "নির্দেশনা বন্ধ করুন",
      },
      heroImageAlt: "আয়কর ও সাহিত্যসহ OmniAskAI বিষয়গুলোর একটি চিত্র",
      proof: [
        "উত্তরের পেছনের উৎস খুলুন",
        "নিজের ভাষায় আরেকটা প্রশ্ন করুন",
        "বিষয়ের পরিধি ও পর্যালোচনার তারিখ দেখুন",
      ],
      example: {
        label: "চিত্র",
        questionLabel: "প্রশ্ন",
        question: "বাংলাদেশে কোন আয় করযোগ্য?",
        answerLabel: "উত্তর",
        answer:
          "বেতন ও ব্যবসার আয় করযোগ্য হতে পারে। কোন নিয়ম প্রযোজ্য তা আয়ের ধরন ও বছরের ওপর নির্ভর করে।",
        sourceLabel: "চিত্র · আসল উদ্ধৃতি নয়",
        passageLabel: "উৎস কেমন দেখায়",
        passage:
          "আয়কর বিষয়ে নির্বাচিত দলিলের প্রাসঙ্গিক অংশটি খুলে দেখুন এবং সেটি কোন বছরের জন্য প্রযোজ্য, মিলিয়ে নিন।",
      },
    },

    topics: {
      heading: "একটা বিষয় বেছে নিন। একটা সত্যিকারের প্রশ্ন করুন।",
      empty: "এখনও কোনো বিষয় প্রকাশিত হয়নি। একটু পরে আবার দেখুন।",
      unavailable: "বিষয়গুলো এখন দেখানো যাচ্ছে না। একটু পরে আবার চেষ্টা করুন।",
      exampleLabel: "উদাহরণ",
      englishExample: "উদাহরণ · ইংরেজি",
      exploreTemplate: "{title} দেখুন",
      previewYouLabel: "আপনি",
      previewAssistantLabel: "OmniAskAI",
    },

    features: {
      items: [
        {
          title: "বিষয়ের ভেতরেই থাকুন",
          body: "একই পটভূমি বারবার না বলে একটি বিষয় নিয়েই প্রশ্ন করুন।",
        },
        {
          title: "অংশটি খুলে দেখুন",
          body: "ব্যাখ্যা পড়ুন, তারপর পাশের সহায়ক অংশটি খুলুন।",
        },
        {
          title: "নিজের ভাষায় জিজ্ঞেস করুন",
          body: "বাংলা, ইংরেজি বা বাংলিশে আবার প্রশ্ন করুন। পাতার ভাষা আর উত্তরের ভাষা আলাদা।",
        },
        {
          title: "এই আলোচনা এই ট্যাবেই",
          body: "এই সংস্করণে কথোপকথন ব্রাউজার ট্যাবে থাকে। অ্যাকাউন্টে সেভ হয় না, পাতা রিলোড করলে নতুন করে শুরু হয়।",
        },
      ],
    },

    howItWorks: {
      kicker: "উত্তর কীভাবে বিশ্বাসযোগ্য হয়",
      heading: "উত্তর তখনই কাজে লাগে, যখন তার ভিত্তি দেখা যায়।",
      intro: "ব্যাখ্যা পড়ুন, সহায়ক অংশটি খুলুন, তারপর জিজ্ঞেস করুন এটা আপনার প্রশ্নে কী বোঝায়।",
      flow: {
        questionLabel: "প্রশ্ন",
        question: "বেতনের কোন অংশ আয় হিসেবে গণ্য হয়?",
        answerLabel: "ব্যাখ্যা",
        answer:
          "মূল বেতন ও কিছু ভাতা আয় হতে পারে। কী প্রযোজ্য, তা আয়ের ধরন ও উৎসের বছরের ওপর নির্ভর করে।",
        passageLabel: "অংশের একটি চিত্র",
        passage:
          "বিষয়টি উত্তরের পাশে সহায়ক নোট রাখে — প্রকাশক ও তারিখ জানা থাকলে সেটাও।",
        followLabel: "পরের প্রশ্ন",
        follow: "এটা কোন বছরের জন্য?",
      },
      stepsHeading: "তিন ধাপ",
      steps: [
        {
          title: "একটা বিষয় বেছে নিন",
          body: "আয়কর, সাহিত্য, ইতিহাস বা সংস্কৃতি — প্রতিটির নিজস্ব নির্বাচিত উৎস।",
        },
        {
          title: "প্রশ্ন করুন",
          body: "বাংলা, ইংরেজি বা বাংলিশে বলুন। বছর বা পরিস্থিতি জরুরি হলে সেটাও জানান।",
        },
        {
          title: "প্রমাণ খুলুন",
          body: "ব্যাখ্যার পেছনের অংশটি দেখুন, তারপর আরেকটা প্রশ্ন করুন।",
        },
      ],
    },

    coverage: {
      heading: "উৎস ও পরিধি",
      intro:
        "প্রতিটি বিষয় সেই বিষয়ের জন্য বাছাই করা দলিল থেকে উত্তর দেয়। খোলা যায় এমন উৎসই প্রমাণ — এটা দাবি নয় যে সব নিয়ম বা সব সংস্করণ আছে।",
      points: [
        {
          title: "বাছাই করা, সম্পূর্ণ নয়",
          body: "আয়করে অধ্যাদেশ, এনবিআর নির্দেশনা ও সংশ্লিষ্ট নোট। সাহিত্য, ইতিহাস ও সংস্কৃতির নিজস্ব উপাদান। প্রমাণ না থাকলে উত্তরে সেটা বলা উচিত।",
        },
        {
          title: "পর্যালোচনার তারিখ আইনের বছর নয়",
          body: "বিষয়ের তারিখ মানে OmniAskAI-এর জন্য উপাদান কবে দেখা হয়েছে। সেটা দলিলের প্রকাশের তারিখ বা নিয়ম যে বছরে প্রযোজ্য, সেটা নয়। কোন বছর চাইছেন জিজ্ঞেস করুন, উৎস মিলিয়ে নিন।",
        },
        {
          title: "যা যাচাই করা যায়",
          body: "অংশ, প্রকাশক এবং লিংক থাকলে মূল দলিল খুলুন। শিরোনাম বা অংশ স্পষ্ট না হলে মূল দলিল দেখুন।",
        },
      ],
      storageTitle: "কথোপকথন কীভাবে থাকে",
      storageBody:
        "এখনও অ্যাকাউন্ট নেই। কথোপকথন এই ব্রাউজার ট্যাবে, এই ভিজিটে থাকে। রিলোড বা ট্যাব বন্ধ করলে দেখা ইতিহাস চলে যায়। এটা সেভ করা গবেষণার সংগ্রহ নয়।",
    },

    finalCta: {
      heading: "যে প্রশ্নটা আপনার দরকার, সেখান থেকে শুরু করুন।",
      headingEmphasis: "উৎস যা সমর্থন করে, সেটাই দেখুন।",
      body: "একটা বিষয় বেছে নিন, স্বাভাবিকভাবে জিজ্ঞেস করুন, ব্যাখ্যার পেছনের অংশটি খুলুন।",
      action: "বিষয় দেখুন",
    },

    footer: {
      tagline: "সহজ উত্তর। যাচাই করার উৎস।",
      copyright: "© 2026",
      authorName: "Junayed Rahimin",
      opensInNewTab: "নতুন ট্যাবে খুলবে",
      sources: "উৎস ও পরিধি",
      operator: "পরিচালনায়",
    },
  },
} satisfies Record<"en" | "bn", LandingCopy>;
