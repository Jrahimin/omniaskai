export type LandingTopicSlug =
  | "income-tax"
  | "literature"
  | "bangladesh-history"
  | "movies-culture";

export type TopicCardCopy = {
  title: string;
  subtitle: string;
  sourceCount: string;
  explore: string;
  badge?: string;
  preview: {
    youLabel: string;
    assistantLabel: string;
    question: string;
    answer: string;
    sources: string[];
  };
};

export type LandingCopy = {
  meta: {
    title: string;
    description: string;
  };
  languageSwitch: {
    ariaLabel: string;
  };
  nav: {
    primary: string;
    topics: string;
    howItWorks: string;
    pricing: string;
    about: string;
    logIn: string;
    createAccount: string;
    menu: string;
    unavailable: string;
  };
  hero: {
    badge: string;
    headlineBefore: string;
    headlineHighlight: string;
    headlineAfter: string;
    body: string;
    browseTopics: string;
    seeHowItWorks: string;
    trustedBy: string;
    rating: string;
    ratingLabel: string;
    heroImageAlt: string;
    trust: [string, string, string];
  };
  topics: {
    heading: string;
    cards: Record<LandingTopicSlug, TopicCardCopy>;
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
    contrast: {
      storyLabel: string;
      elsewhereLabel: string;
      elsewhereBody: string;
      instead: string;
      hereLabel: string;
      hereBody: string;
    };
    stepsHeading: string;
    steps: [
      { title: string; body: string; example: string },
      { title: string; body: string; example: string },
      { title: string; body: string; example: string },
    ];
  };
  finalCta: {
    heading: string;
    headingEmphasis: string;
    body: string;
    browseTopics: string;
    createAccount: string;
    footnote: string;
  };
  footer: {
    tagline: string;
    copyright: string;
    authorName: string;
    opensInNewTab: string;
  };
};

const topicPreviews: Record<LandingTopicSlug, TopicCardCopy["preview"]> = {
  "income-tax": {
    youLabel: "You",
    assistantLabel: "OmniAskAI",
    question: "What income sources are taxable in Bangladesh?",
    answer:
      "Salary, business income, capital gains and a few other sources can be taxable. The exact rule depends on the type of income — and some income may be exempt.",
    sources: ["NBR Guide", "Income Tax Act"],
  },

  literature: {
    youLabel: "You",
    assistantLabel: "OmniAskAI",
    question: "রবীন্দ্রনাথের 'দুই বিঘা জমি' কবিতার আসল কথাটা কী?",
    answer:
      "এটা শুধু জমি হারানোর গল্প নয়। ছোট একজন মানুষের অসহায়তা, ক্ষমতার অন্যায় আর নিজের মাটির প্রতি টান—সব মিলিয়েই কবিতার মূল অনুভূতি।",
    sources: ["কবিতা পাঠ", "সাহিত্য আলোচনা"],
  },

  "bangladesh-history": {
    youLabel: "You",
    assistantLabel: "OmniAskAI",
    question: "British raj kivabe Bangla dokhol korlo?",
    answer:
      "It happened step by step. Plassey in 1757 gave the Company political influence, Buxar strengthened it, and the Diwani in 1765 handed them control over Bengal's revenue.",
    sources: ["Plassey 1757", "Diwani 1765"],
  },

  "movies-culture": {
    youLabel: "You",
    assistantLabel: "OmniAskAI",
    question: "সত্যজিৎ রায়ের সিনেমা এত আলাদা কেন?",
    answer:
      "কারণ তিনি সাধারণ জীবনকেও অসাধারণভাবে দেখাতে পারতেন। মানুষ, নীরবতা, ছোট ছোট মুহূর্ত—সবকিছুর ভেতর থেকেই তিনি গভীর গল্প তৈরি করেছেন।",
    sources: ["পথের পাঁচালী", "Ray on Ray"],
  },
};

const englishCards: Record<LandingTopicSlug, TopicCardCopy> = {
  "income-tax": {
    title: "Income Tax",
    subtitle: "Understand tax rules without getting lost in legal language.",
    sourceCount: "18,450+ sources",
    explore: "Explore Income Tax",
    badge: "Popular",
    preview: topicPreviews["income-tax"],
  },

  literature: {
    title: "Literature",
    subtitle: "Go beyond the summary. Explore stories, poems, ideas and meaning.",
    sourceCount: "9,200+ sources",
    explore: "Explore Literature",
    preview: topicPreviews.literature,
  },

  "bangladesh-history": {
    title: "Bangladesh History",
    subtitle: "Follow the people, events and turning points that shaped Bangladesh.",
    sourceCount: "12,800+ sources",
    explore: "Explore History",
    preview: topicPreviews["bangladesh-history"],
  },

  "movies-culture": {
    title: "Movies & Culture",
    subtitle: "Discover the stories behind films, music, artists and culture.",
    sourceCount: "7,640+ sources",
    explore: "Explore Movies & Culture",
    preview: topicPreviews["movies-culture"],
  },
};

const banglaCards: Record<LandingTopicSlug, TopicCardCopy> = {
  "income-tax": {
    title: "আয়কর",
    subtitle: "জটিল করের নিয়ম সহজ ভাষায় বুঝে নিন।",
    sourceCount: "১৮,৪৫০+ উৎস",
    explore: "আয়কর জানুন",
    badge: "জনপ্রিয়",
    preview: topicPreviews["income-tax"],
  },

  literature: {
    title: "সাহিত্য",
    subtitle: "শুধু সারাংশ নয়—গল্প, কবিতা আর ভাবনার ভেতরে ঢুকে পড়ুন।",
    sourceCount: "৯,২০০+ উৎস",
    explore: "সাহিত্য ঘুরে দেখুন",
    preview: topicPreviews.literature,
  },

  "bangladesh-history": {
    title: "বাংলাদেশের ইতিহাস",
    subtitle: "মানুষ, ঘটনা আর মোড় ঘুরিয়ে দেওয়া মুহূর্তগুলো সহজভাবে জানুন।",
    sourceCount: "১২,৮০০+ উৎস",
    explore: "ইতিহাস ঘুরে দেখুন",
    preview: topicPreviews["bangladesh-history"],
  },

  "movies-culture": {
    title: "সিনেমা ও সংস্কৃতি",
    subtitle: "সিনেমা, গান, শিল্পী আর সংস্কৃতির পেছনের গল্পগুলো আবিষ্কার করুন।",
    sourceCount: "৭,৬৪০+ উৎস",
    explore: "সিনেমা ও সংস্কৃতি দেখুন",
    preview: topicPreviews["movies-culture"],
  },
};

export const landingLanguage = {
  en: {
    meta: {
      title: "OmniAskAI — Explore knowledge that matters",
      description:
        "Choose a topic, ask naturally, and get clear answers you can trace back to real sources.",
    },

    languageSwitch: {
      ariaLabel: "Language",
    },

    nav: {
      primary: "Primary",
      topics: "Topics",
      howItWorks: "How it works",
      pricing: "Pricing",
      about: "About",
      logIn: "Log in",
      createAccount: "Create Free Account",
      menu: "Open menu",
      unavailable: "Coming soon",
    },

    hero: {
      badge: "Real questions. Clear answers.",

      headlineBefore: "Not one chatbot.",
      headlineHighlight: "Different worlds to explore.",
      headlineAfter: "Answers you can actually trust.",

      body:
        "Pick what you want to know about and start asking. Tax, literature, history, culture and more — explained clearly, with real sources you can check for yourself.",

      browseTopics: "Explore Topics",
      seeHowItWorks: "See How It Works",

      trustedBy: "Built for questions that matter",
      rating: "Clear. Useful. Checkable.",
      ratingLabel: "Clear, useful and checkable answers",

      heroImageAlt:
        "OmniAskAI knowledge worlds for Income Tax, Literature, Bangladesh History, and Movies & Culture",

      trust: [
        "Knowledge picked with care",
        "See the real sources",
        "Made for Bangla & English",
      ],
    },

    topics: {
      heading: "Pick a world. Start exploring.",
      cards: englishCards,
    },

    features: {
      items: [
        {
          title: "Focused on What You Need",
          body: "Each world stays focused on one subject, so answers feel relevant instead of random.",
        },
        {
          title: "See Where It Came From",
          body: "Important answers point you back to the source, so you can check for yourself.",
        },
        {
          title: "Ask Your Way",
          body: "Bangla, English or Banglish — ask the way you naturally speak.",
        },
        {
          title: "Your Space, Your Questions",
          body: "Explore comfortably without turning every question into public content.",
        },
      ],
    },

    howItWorks: {
      kicker: "What general AI cannot do",
      heading: "Each topic answers from files general AI never saw.",
      intro:
        "Literature, history, films, tax — every world has its own loaded sources. General AI cannot open those pages. OmniAskAI can.",
      contrast: {
        storyLabel: "For example",
        elsewhereLabel: "General AI",
        elsewhereBody:
          "“Which income is taxable in Bangladesh?” It sounds sure. It cannot open the NBR circular.",
        instead: "Here",
        hereLabel: "OmniAskAI",
        hereBody:
          "Same question — from the tax files we loaded, plus the page. A poem or a film works the same way.",
      },
      stepsHeading: "How you use it",
      steps: [
        {
          title: "Open a topic",
          body: "Tax, literature, history, or films — each has its own files.",
          example: "The sources are already loaded.",
        },
        {
          title: "Ask as you actually talk",
          body: "Bangla, English, or Banglish.",
          example: "A tax rule, a poem, a date, a film — same flow.",
        },
        {
          title: "Read it. Then open the source.",
          body: "A clear answer, plus the page it came from.",
          example: "Check it yourself. Do not take a guess on trust.",
        },
      ],
    },

    finalCta: {
      heading: "One question can open a whole new",
      headingEmphasis: "world.",
      body:
        "Choose a topic that matters to you and start exploring. No complicated setup — just ask.",
      browseTopics: "Explore Topics",
      createAccount: "Create Free Account",
      footnote: "Start free. Go deeper when you need to.",
    },

    footer: {
      tagline: "Less searching. More understanding.",
      copyright: "© 2026",
      authorName: "Junayed Rahimin",
      opensInNewTab: "Opens in a new tab",
    },
  },

  bn: {
    meta: {
      title: "OmniAskAI — আপনার দরকারি জ্ঞান, সহজভাবে",
      description:
        "পছন্দের বিষয় বেছে নিন, স্বাভাবিকভাবে প্রশ্ন করুন আর সহজ উত্তর পান—সাথে দেখে নিন তথ্যটি কোথা থেকে এসেছে।",
    },

    languageSwitch: {
      ariaLabel: "ভাষা",
    },

    nav: {
      primary: "প্রধান নেভিগেশন",
      topics: "বিষয়",
      howItWorks: "কীভাবে কাজ করে",
      pricing: "মূল্য",
      about: "আমাদের সম্পর্কে",
      logIn: "লগ ইন",
      createAccount: "ফ্রি অ্যাকাউন্ট",
      menu: "মেনু খুলুন",
      unavailable: "শিগগিরই আসছে",
    },

    hero: {
      badge: "আপনার প্রশ্ন। সহজ উত্তর।",

      headlineBefore: "আরেকটা সাধারণ চ্যাটবট নয়।",
      headlineHighlight: "এখানে আছে আলাদা আলাদা জ্ঞানের জগৎ।",
      headlineAfter: "যেখানে উত্তরটা বুঝতেও পারবেন, যাচাইও করতে পারবেন।",

      body:
        "যে বিষয়টা জানতে চান, সেটাই বেছে নিন আর প্রশ্ন শুরু করুন। আয়কর, সাহিত্য, ইতিহাস, সিনেমা—জটিল বিষয়ও সহজভাবে বুঝুন, আর চাইলে দেখে নিন উত্তরটা কোথা থেকে এসেছে।",

      browseTopics: "বিষয় ঘুরে দেখুন",
      seeHowItWorks: "কীভাবে কাজ করে দেখুন",

      trustedBy: "দরকারি প্রশ্নের জন্য তৈরি",
      rating: "সহজ। কাজে লাগে। যাচাই করা যায়।",
      ratingLabel: "সহজ, দরকারি এবং যাচাই করা যায় এমন উত্তর",

      heroImageAlt:
        "আয়কর, সাহিত্য, বাংলাদেশের ইতিহাস এবং সিনেমা ও সংস্কৃতির OmniAskAI জ্ঞানের জগৎ",

      trust: [
        "বেছে নেওয়া জ্ঞান",
        "উৎস নিজেই দেখে নিন",
        "বাংলা, ইংরেজি ও বাংলিশ",
      ],
    },

    topics: {
      heading: "একটা জগৎ বেছে নিন, তারপর আলাপ শুরু করুন।",
      cards: banglaCards,
    },

    features: {
      items: [
        {
          title: "যে বিষয়, সেই কথাই",
          body: "প্রতিটি জগৎ একটি নির্দিষ্ট বিষয় নিয়ে তৈরি, তাই অপ্রাসঙ্গিক কথায় হারিয়ে যেতে হয় না।",
        },
        {
          title: "উত্তরের পেছনের তথ্যও দেখুন",
          body: "গুরুত্বপূর্ণ উত্তরের সাথে উৎস থাকে—চাইলে নিজেই খুলে মিলিয়ে নিতে পারেন।",
        },
        {
          title: "যেভাবে স্বচ্ছন্দ, সেভাবেই বলুন",
          body: "বাংলা, ইংরেজি বা বাংলিশ—যেভাবে প্রশ্ন করতে ভালো লাগে, সেভাবেই করুন।",
        },
        {
          title: "আপনার প্রশ্ন, আপনার জায়গা",
          body: "নিজের মতো করে জানুন, ভাবুন আর নতুন কিছু আবিষ্কার করুন।",
        },
      ],
    },

    howItWorks: {
      kicker: "সাধারণ AI যা পারে না",
      heading: "প্রতিটি বিষয়ের উত্তর আসে সেই বিষয়ের নিজস্ব ফাইল থেকে।",
      intro:
        "সাহিত্য, ইতিহাস, সিনেমা, কর—প্রতিটি জগতের নিজস্ব উৎস আগে থেকেই লোড। সাধারণ AI সেই পাতা খুলতে পারে না। OmniAskAI পারে।",
      contrast: {
        storyLabel: "ধরুন, একটা উদাহরণ",
        elsewhereLabel: "সাধারণ AI",
        elsewhereBody:
          "“বাংলাদেশে কোন আয় করযোগ্য?” বলে আত্মবিশ্বাসের সাথে। NBR সার্কুলার খুলে দেখাতে পারে না।",
        instead: "এখানে",
        hereLabel: "OmniAskAI",
        hereBody:
          "একই প্রশ্ন—লোড করা করের ফাইল থেকে, সাথে পাতা। কবিতা বা সিনেমাও একই নিয়মে।",
      },
      stepsHeading: "কীভাবে ব্যবহার করবেন",
      steps: [
        {
          title: "একটা বিষয় খুলুন",
          body: "কর, সাহিত্য, ইতিহাস বা সিনেমা—প্রতিটিতে নিজস্ব ফাইল।",
          example: "উৎস আগে থেকেই লোড।",
        },
        {
          title: "যেভাবে কথা বলেন, সেভাবেই জিজ্ঞেস করুন",
          body: "বাংলা, ইংরেজি বা বাংলিশ।",
          example: "করের নিয়ম, কবিতা, তারিখ, সিনেমা—একই ধাপ।",
        },
        {
          title: "পড়ুন। তারপর উৎস খুলুন।",
          body: "সহজ উত্তর, সাথে যে পাতা থেকে এসেছে।",
          example: "নিজেই মিলিয়ে নিন। অনুমানে বিশ্বাস নয়।",
        },
      ],
    },

    finalCta: {
      heading: "একটা প্রশ্ন থেকেই খুলে যেতে পারে নতুন এক",
      headingEmphasis: "জগৎ।",
      body:
        "আপনার দরকারি একটা বিষয় বেছে নিন আর শুরু করুন। কোনো জটিল সেটআপ নেই—শুধু প্রশ্ন করুন।",
      browseTopics: "বিষয় ঘুরে দেখুন",
      createAccount: "ফ্রি অ্যাকাউন্ট",
      footnote: "ফ্রি শুরু করুন। দরকার হলে আরও গভীরে যান।",
    },

    footer: {
      tagline: "কম খোঁজাখুঁজি। বেশি বোঝাপড়া।",
      copyright: "© 2026",
      authorName: "Junayed Rahimin",
      opensInNewTab: "নতুন ট্যাবে খুলবে",
    },
  },
} satisfies Record<"en" | "bn", LandingCopy>;
