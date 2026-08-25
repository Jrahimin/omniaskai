import type { Locale } from "@/lib/locale/locale";

export type ConversationTopicSlug =
  | "income-tax"
  | "literature"
  | "bangladesh-history"
  | "movies-culture";

export type TopicIdentityCopy = {
  title: string;
  subtitle: string;
  badge?: string;
  sourceStat: string;
  collectionStat: string;
  updatedStat: string;
  composerPlaceholder: string;
  artworkAlt: string;
  aboutBody: string;
  exploreItems: Record<string, string>;
};

export type WorkspaceGuideStep = {
  title: string;
  body: string;
};

export type WorkspaceGuideCopy = {
  shortHint: string;
  openLabel: string;
  title: string;
  intro: string;
  exampleHeading: string;
  steps: WorkspaceGuideStep[];
};

export type WorkspaceGuide = WorkspaceGuideCopy & {
  exampleQuestions: string[];
};

export type ConversationCopy = {
  languageSwitchAria: string;
  newConversation: string;
  searchConversations: string;
  searchLabel: string;
  today: string;
  previous7Days: string;
  exploreThisTopic: string;
  goDeeper: string;
  goDeeperBody: string;
  upgradeToPro: string;
  themeLight: string;
  collapseSidebar: string;
  expandSidebar: string;
  openHistory: string;
  closeHistory: string;
  topicsCrumb: string;
  aboutThisTopic: string;
  aboutHeading: string;
  closeAbout: string;
  fromSources: string;
  sources: string;
  inThisAnswer: string;
  conversationSources: string;
  viewSource: string;
  requestSourceTitle: string;
  requestSourceBody: string;
  requestSourceAction: string;
  wasThisHelpful: string;
  helpful: string;
  notHelpful: string;
  copyAnswer: string;
  copied: string;
  exploreNext: string;
  emptyTitle: string;
  emptyBody: string;
  pendingLabel: string;
  errorTitle: string;
  errorBody: string;
  closeSources: string;
  openSources: string;
  composerLanguage: string;
  composerLanguageHint: string;
  languageAuto: string;
  languageEn: string;
  languageBn: string;
  languageBanglish: string;
  attach: string;
  voice: string;
  send: string;
  disclaimer: string;
  unavailable: string;
  you: string;
  close: string;
  startersLabel: string;
  noMatchingConversations: string;
  noSourcesInAnswer: string;
  noSourcesInConversation: string;
  sourcesCount: string;
  guide: WorkspaceGuideCopy;
  topics: Record<ConversationTopicSlug, TopicIdentityCopy>;
};

export function isConversationTopicSlug(
  value: string,
): value is ConversationTopicSlug {
  return (
    value === "income-tax" ||
    value === "literature" ||
    value === "bangladesh-history" ||
    value === "movies-culture"
  );
}

const englishTopics: Record<ConversationTopicSlug, TopicIdentityCopy> = {
  "income-tax": {
    title: "Income Tax",
    subtitle: "Bangladesh Income Tax knowledge space",
    badge: "Popular",
    sourceStat: "184 sources",
    collectionStat: "12 collections",
    updatedStat: "Updated May 12, 2025",
    composerPlaceholder: "Ask about Bangladesh Income Tax…",
    artworkAlt: "Income tax workspace illustration",
    aboutBody:
      "Ask in English, Bangla, or Banglish. Answers here are written from curated tax documents — ordinances, NBR guidance, and related notes — so you can read the claim and open the page it came from.",
    exploreItems: {
      guides: "Important guides",
      calculators: "Tax calculators",
      updates: "Recent updates",
      scenarios: "Common scenarios",
    },
  },
  literature: {
    title: "Literature",
    subtitle: "Bangla and world literature",
    sourceStat: "96 sources",
    collectionStat: "8 collections",
    updatedStat: "Updated April 3, 2025",
    composerPlaceholder: "Ask about a poem, story, or writer…",
    artworkAlt: "Literature workspace illustration",
    aboutBody:
      "A quiet space for poems, stories, and the conversations around them. Answers point back to the text and to trusted commentary — not to a generic summary.",
    exploreItems: {
      guides: "Reading guides",
      calculators: "Authors",
      updates: "Poems & stories",
      scenarios: "Themes",
    },
  },
  "bangladesh-history": {
    title: "Bangladesh History",
    subtitle: "People, events, and sources",
    sourceStat: "142 sources",
    collectionStat: "9 collections",
    updatedStat: "Updated March 21, 2025",
    composerPlaceholder: "Ask about people, events, or turning points…",
    artworkAlt: "Bangladesh history workspace illustration",
    aboutBody:
      "Follow events through primary and secondary sources. The workspace is built so you can ask naturally — including Banglish — and still see where a date or claim comes from.",
    exploreItems: {
      guides: "Timelines",
      calculators: "People",
      updates: "Key events",
      scenarios: "Archives",
    },
  },
  "movies-culture": {
    title: "Movies & Culture",
    subtitle: "Film, music, and cultural memory",
    sourceStat: "78 sources",
    collectionStat: "6 collections",
    updatedStat: "Updated May 2, 2025",
    composerPlaceholder: "Ask about a film, song, or artist…",
    artworkAlt: "Movies and culture workspace illustration",
    aboutBody:
      "Films, music, and the people who made them. When the library has the work or a reliable essay, you will see it. When it does not, the workspace says so plainly.",
    exploreItems: {
      guides: "Films",
      calculators: "Directors",
      updates: "Music",
      scenarios: "Essays",
    },
  },
};

const banglaTopics: Record<ConversationTopicSlug, TopicIdentityCopy> = {
  "income-tax": {
    title: "আয়কর",
    subtitle: "বাংলাদেশ আয়কর জ্ঞান-পরিসর",
    badge: "জনপ্রিয়",
    sourceStat: "১৮৪টি উৎস",
    collectionStat: "১২টি সংকলন",
    updatedStat: "হালনাগাদ ১২ মে ২০২৫",
    composerPlaceholder: "বাংলাদেশের আয়কর নিয়ে জিজ্ঞাসা করুন…",
    artworkAlt: "আয়কর কর্মপরিসরের ছবি",
    aboutBody:
      "ইংরেজি, বাংলা বা বাংলিশে জিজ্ঞাসা করুন। উত্তরগুলো সংকলিত কর-দলিল — অধ্যাদেশ, এনবিআর নির্দেশনা ও সংশ্লিষ্ট নোট — থেকে লেখা, যাতে দাবিটি পড়ে সংশ্লিষ্ট পাতা খোলা যায়।",
    exploreItems: {
      guides: "গুরুত্বপূর্ণ নির্দেশিকা",
      calculators: "কর ক্যালকুলেটর",
      updates: "সাম্প্রতিক হালনাগাদ",
      scenarios: "সাধারণ পরিস্থিতি",
    },
  },
  literature: {
    title: "সাহিত্য",
    subtitle: "বাংলা ও বিশ্বসাহিত্য",
    sourceStat: "৯৬টি উৎস",
    collectionStat: "৮টি সংকলন",
    updatedStat: "হালনাগাদ ৩ এপ্রিল ২০২৫",
    composerPlaceholder: "কবিতা, গল্প বা লেখক নিয়ে জিজ্ঞাসা করুন…",
    artworkAlt: "সাহিত্য কর্মপরিসরের ছবি",
    aboutBody:
      "কবিতা, গল্প এবং তার চারপাশের আলোচনার জন্য একটি শান্ত পরিসর। উত্তর মূল পাঠ ও বিশ্বস্ত আলোচনার দিকে ইঙ্গিত করে — সাধারণ সারাংশের দিকে নয়।",
    exploreItems: {
      guides: "পাঠ নির্দেশিকা",
      calculators: "লেখক",
      updates: "কবিতা ও গল্প",
      scenarios: "ভাবনা",
    },
  },
  "bangladesh-history": {
    title: "বাংলাদেশের ইতিহাস",
    subtitle: "মানুষ, ঘটনা ও উৎস",
    sourceStat: "১৪২টি উৎস",
    collectionStat: "৯টি সংকলন",
    updatedStat: "হালনাগাদ ২১ মার্চ ২০২৫",
    composerPlaceholder: "মানুষ, ঘটনা বা মোড় নিয়ে জিজ্ঞাসা করুন…",
    artworkAlt: "বাংলাদেশের ইতিহাস কর্মপরিসরের ছবি",
    aboutBody:
      "প্রাথমিক ও গৌণ উৎসের মধ্য দিয়ে ঘটনা অনুসরণ করুন। স্বাভাবিকভাবে — বাংলিশেও — জিজ্ঞাসা করা যায়, আর তারপরও দেখা যায় একটি তারিখ বা দাবি কোথা থেকে এসেছে।",
    exploreItems: {
      guides: "সময়রেখা",
      calculators: "মানুষ",
      updates: "গুরুত্বপূর্ণ ঘটনা",
      scenarios: "আর্কাইভ",
    },
  },
  "movies-culture": {
    title: "সিনেমা ও সংস্কৃতি",
    subtitle: "চলচ্চিত্র, সঙ্গীত ও সাংস্কৃতিক স্মৃতি",
    sourceStat: "৭৮টি উৎস",
    collectionStat: "৬টি সংকলন",
    updatedStat: "হালনাগাদ ২ মে ২০২৫",
    composerPlaceholder: "সিনেমা, গান বা শিল্পী নিয়ে জিজ্ঞাসা করুন…",
    artworkAlt: "সিনেমা ও সংস্কৃতি কর্মপরিসরের ছবি",
    aboutBody:
      "সিনেমা, সঙ্গীত এবং যারা সেগুলো তৈরি করেছেন। সংগ্রহে কাজটি বা একটি নির্ভরযোগ্য রচনা থাকলে আপনি তা দেখতে পাবেন। না থাকলে কর্মপরিসর সেটা স্পষ্ট করে বলে।",
    exploreItems: {
      guides: "সিনেমা",
      calculators: "পরিচালক",
      updates: "সঙ্গীত",
      scenarios: "রচনা",
    },
  },
};

export const conversationLanguage: Record<Locale, ConversationCopy> = {
  en: {
    languageSwitchAria: "Language",
    newConversation: "New conversation",
    searchConversations: "Search conversations…",
    searchLabel: "Search conversations",
    today: "Today",
    previous7Days: "Previous 7 days",
    exploreThisTopic: "Explore this topic",
    goDeeper: "Go deeper with Pro",
    goDeeperBody: "More collections, saved answers, and room to keep going.",
    upgradeToPro: "Upgrade to Pro",
    themeLight: "Light",
    collapseSidebar: "Collapse sidebar",
    expandSidebar: "Expand sidebar",
    openHistory: "Open conversations",
    closeHistory: "Close conversations",
    topicsCrumb: "Topics",
    aboutThisTopic: "About this topic",
    aboutHeading: "About this knowledge space",
    closeAbout: "Close",
    fromSources: "From sources",
    sources: "Sources",
    inThisAnswer: "In this answer",
    conversationSources: "Conversation sources",
    viewSource: "View source",
    requestSourceTitle: "Can't find what you need?",
    requestSourceBody:
      "Request a source and we will help find the right document.",
    requestSourceAction: "Request a source",
    wasThisHelpful: "Was this helpful?",
    helpful: "Helpful",
    notHelpful: "Not helpful",
    copyAnswer: "Copy",
    copied: "Copied",
    exploreNext: "Explore next",
    emptyTitle: "Ask this knowledge space",
    emptyBody:
      "Start with a question below, or write your own. Answers stay readable — and sources stay close.",
    pendingLabel: "Looking through sources…",
    errorTitle: "This answer could not be shown",
    errorBody:
      "Something went wrong while preparing this reply. Try another question, or start a new conversation.",
    closeSources: "Close sources",
    openSources: "Open sources",
    composerLanguage: "Reply language",
    composerLanguageHint:
      "Preferred language for the answer — Auto, English, Bangla, or Banglish. Does not change the page language.",
    languageAuto: "Auto",
    languageEn: "EN",
    languageBn: "বাং",
    languageBanglish: "Banglish",
    attach: "Attach",
    voice: "Voice input",
    send: "Send",
    disclaimer:
      "OmniAskAI can make mistakes. Please verify important information.",
    unavailable: "Coming later",
    you: "You",
    close: "Close",
    startersLabel: "Try asking",
    noMatchingConversations: "No conversations match that search.",
    noSourcesInAnswer: "This answer does not cite a source yet.",
    noSourcesInConversation: "No sources in this conversation yet.",
    sourcesCount: "{n} sources",
    guide: {
      shortHint:
        "Ask naturally → read the answer → check the sources → keep exploring",
      openLabel: "How to use this topic",
      title: "How to use this topic",
      intro:
        "This is a curated knowledge space, not a generic chat. Ask in your own words, then read the answer and open a source whenever you want to check.",
      exampleHeading: "Try asking",
      steps: [
        {
          title: "Ask naturally",
          body: "Write your question in Bangla, English or Banglish.",
        },
        {
          title: "Read the answer",
          body: "Important information is organized for easy reading.",
        },
        {
          title: "Check the sources",
          body: "Open citations whenever you want to verify or understand more.",
        },
        {
          title: "Keep exploring",
          body: "Use suggested follow-ups or ask your own next question.",
        },
      ],
    },
    topics: englishTopics,
  },
  bn: {
    languageSwitchAria: "ভাষা",
    newConversation: "নতুন আলোচনা",
    searchConversations: "আলোচনা খুঁজুন…",
    searchLabel: "আলোচনা খুঁজুন",
    today: "আজ",
    previous7Days: "গত ৭ দিন",
    exploreThisTopic: "এই বিষয় ঘুরে দেখুন",
    goDeeper: "Pro-তে আরও গভীরে যান",
    goDeeperBody: "আরও সংকলন, সংরক্ষিত উত্তর, এবং এগোতে থাকার জায়গা।",
    upgradeToPro: "Pro-তে উন্নীত করুন",
    themeLight: "হালকা",
    collapseSidebar: "সাইডবার গুটিয়ে নিন",
    expandSidebar: "সাইডবার খুলুন",
    openHistory: "আলোচনা খুলুন",
    closeHistory: "আলোচনা বন্ধ করুন",
    topicsCrumb: "বিষয়",
    aboutThisTopic: "এই বিষয় সম্পর্কে",
    aboutHeading: "এই জ্ঞান-পরিসর সম্পর্কে",
    closeAbout: "বন্ধ করুন",
    fromSources: "উৎসসহ",
    sources: "উৎস",
    inThisAnswer: "এই উত্তরের উৎস",
    conversationSources: "আলোচনার উৎস",
    viewSource: "উৎস দেখুন",
    requestSourceTitle: "যা খুঁজছেন তা পাচ্ছেন না?",
    requestSourceBody:
      "একটি উৎসের অনুরোধ করুন — সঠিক দলিল খুঁজে পেতে আমরা সাহায্য করব।",
    requestSourceAction: "উৎস চান",
    wasThisHelpful: "এটি কি কাজে লেগেছে?",
    helpful: "কাজে লেগেছে",
    notHelpful: "কাজে লাগেনি",
    copyAnswer: "কপি",
    copied: "কপি হয়েছে",
    exploreNext: "এরপর জানুন",
    emptyTitle: "এই জ্ঞান-পরিসরে জিজ্ঞাসা করুন",
    emptyBody:
      "নিচের একটি প্রশ্ন দিয়ে শুরু করুন, অথবা নিজেরটা লিখুন। উত্তর পাঠযোগ্য থাকবে — উৎসও কাছে থাকবে।",
    pendingLabel: "উৎস দেখা হচ্ছে…",
    errorTitle: "এই উত্তর দেখানো যায়নি",
    errorBody:
      "উত্তর তৈরি করতে গিয়ে সমস্যা হয়েছে। অন্য একটি প্রশ্ন করুন, অথবা নতুন আলোচনা শুরু করুন।",
    closeSources: "উৎস বন্ধ করুন",
    openSources: "উৎস খুলুন",
    composerLanguage: "উত্তরের ভাষা",
    composerLanguageHint:
      "উত্তর কোন ভাষায় চাই — স্বয়ং, ইংরেজি, বাংলা বা বাংলিশ। পাতার ভাষা বদলায় না।",
    languageAuto: "স্বয়ং",
    languageEn: "EN",
    languageBn: "বাং",
    languageBanglish: "বাংলিশ",
    attach: "সংযুক্ত করুন",
    voice: "ভয়েস ইনপুট",
    send: "পাঠান",
    disclaimer:
      "OmniAskAI ভুল করতে পারে। গুরুত্বপূর্ণ তথ্য নিজে যাচাই করুন।",
    unavailable: "শীঘ্রই আসছে",
    you: "আপনি",
    close: "বন্ধ",
    startersLabel: "জিজ্ঞাসা করে দেখুন",
    noMatchingConversations: "এই খোঁজার সাথে কোনো আলোচনা মেলেনি।",
    noSourcesInAnswer: "এই উত্তরে এখনও কোনো উৎস নেই।",
    noSourcesInConversation: "এই আলোচনায় এখনও কোনো উৎস নেই।",
    sourcesCount: "{n}টি উৎস",
    guide: {
      shortHint:
        "স্বাভাবিকভাবে জিজ্ঞাসা করুন → উত্তর পড়ুন → উৎস দেখুন → ঘুরে দেখতে থাকুন",
      openLabel: "এই বিষয় কীভাবে ব্যবহার করবেন",
      title: "এই বিষয় কীভাবে ব্যবহার করবেন",
      intro:
        "এটি সাধারণ চ্যাট নয় — কিউরেটেড জ্ঞান-পরিসর। নিজের ভাষায় জিজ্ঞাসা করুন, উত্তর পড়ুন, আর যাচাই করতে চাইলে উৎস খুলুন।",
      exampleHeading: "জিজ্ঞাসা করে দেখুন",
      steps: [
        {
          title: "স্বাভাবিকভাবে জিজ্ঞাসা করুন",
          body: "বাংলা, ইংরেজি বা বাংলিশে আপনার প্রশ্ন লিখুন।",
        },
        {
          title: "উত্তর পড়ুন",
          body: "গুরুত্বপূর্ণ তথ্য সহজে পড়ার মতো করে সাজানো থাকে।",
        },
        {
          title: "উৎস দেখুন",
          body: "যাচাই বা আরও বুঝতে চাইলে উদ্ধৃতি খুলুন।",
        },
        {
          title: "ঘুরে দেখতে থাকুন",
          body: "সাজানো পরবর্তী প্রশ্ন ব্যবহার করুন, অথবা নিজের পরের প্রশ্ন করুন।",
        },
      ],
    },
    topics: banglaTopics,
  },
};
