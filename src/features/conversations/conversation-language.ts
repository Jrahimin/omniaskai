import type { Locale } from "@/lib/locale/locale";

export type TopicIdentityCopy = {
  title: string;
  subtitle: string;
  badge?: string;
  sourceDescription: string;
  knowledgeReviewDateLabel?: string;
  composerPlaceholder: string;
  artworkAlt: string;
  aboutBody: string;
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
  basedOnEvidence: string;
  sources: string;
  inThisAnswer: string;
  conversationSources: string;
  referencesCount: string;
  evidenceCounts: string;
  referencedIn: string;
  evidenceNote: string;
  quickAnswer: string;
  viewSource: string;
  requestSourceTitle: string;
  requestSourceBody: string;
  requestSourceAction: string;
    wasThisHelpful: string;
  helpful: string;
  notHelpful: string;
  helpfulError: string;
  helpfulUnavailable: string;
  copyAnswer: string;
  copied: string;
  exploreNext: string;
  emptyTitle: string;
  emptyBody: string;
  pendingLabel: string;
  errorTitle: string;
  errorBody: string;
  retryableErrorBody: string;
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
  catalogUnavailableTitle: string;
  catalogUnavailableBody: string;
  reviewedOn: string;
  guide: WorkspaceGuideCopy;
};

export const conversationLanguage: Record<Locale, ConversationCopy> = {
  en: {
    languageSwitchAria: "Language",
    newConversation: "New conversation",
    searchConversations: "Search conversations…",
    searchLabel: "Search conversations",
    today: "Today",
    previous7Days: "Previous 7 days",
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
    basedOnEvidence: "Based on {sources} · {references}",
    sources: "Sources",
    inThisAnswer: "In this answer",
    conversationSources: "All sources",
    referencesCount: "{n} references",
    evidenceCounts: "{sources} · {references}",
    referencedIn: "Referenced in",
    evidenceNote:
      "Sources are selected automatically to support this answer.",
    quickAnswer: "Quick answer",
    viewSource: "View source",
    requestSourceTitle: "Can't find what you need?",
    requestSourceBody:
      "Request a source and we will help find the right document.",
    requestSourceAction: "Request a source",
    wasThisHelpful: "Was this helpful?",
    helpful: "Helpful",
    notHelpful: "Not helpful",
    helpfulError: "Could not save that rating. Try again.",
    helpfulUnavailable: "Feedback is not available for this answer.",
    copyAnswer: "Copy",
    copied: "Copied",
    exploreNext: "Explore next",
    emptyTitle: "Ask this knowledge space",
    emptyBody:
      "Start with a question below, or write your own. Answers stay readable — and sources stay close.",
    pendingLabel: "Reviewing relevant sources…",
    errorTitle: "This answer could not be shown",
    errorBody:
      "Something went wrong while preparing this reply. Start a new conversation, then ask again.",
    retryableErrorBody:
      "The question was not accepted. You can try again here or start a new conversation.",
    closeSources: "Close sources",
    openSources: "Open sources",
    composerLanguage: "Reply language",
    composerLanguageHint:
      "Answers follow the question language. Explicit English, Bangla, or Banglish control comes later.",
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
    catalogUnavailableTitle: "This knowledge space is unavailable",
    catalogUnavailableBody:
      "The topic catalog could not be loaded. Please try again shortly.",
    reviewedOn: "Reviewed {date}",
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
          body: "Ask your next question in this conversation.",
        },
      ],
    },
  },
  bn: {
    languageSwitchAria: "ভাষা",
    newConversation: "নতুন আলোচনা",
    searchConversations: "আলোচনা খুঁজুন…",
    searchLabel: "আলোচনা খুঁজুন",
    today: "আজ",
    previous7Days: "গত ৭ দিন",
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
    basedOnEvidence: "{sources} · {references} ভিত্তিতে",
    sources: "উৎস",
    inThisAnswer: "এই উত্তরের উৎস",
    conversationSources: "সব উৎস",
    referencesCount: "{n}টি রেফারেন্স",
    evidenceCounts: "{sources} · {references}",
    referencedIn: "রেফারেন্স",
    evidenceNote: "উত্তরকে সমর্থন করতে উৎস স্বয়ংক্রিয়ভাবে বেছে নেওয়া হয়।",
    quickAnswer: "সংক্ষিপ্ত উত্তর",
    viewSource: "উৎস দেখুন",
    requestSourceTitle: "যা খুঁজছেন তা পাচ্ছেন না?",
    requestSourceBody:
      "একটি উৎসের অনুরোধ করুন — সঠিক দলিল খুঁজে পেতে আমরা সাহায্য করব।",
    requestSourceAction: "উৎস চান",
    wasThisHelpful: "এটি কি কাজে লেগেছে?",
    helpful: "কাজে লেগেছে",
    notHelpful: "কাজে লাগেনি",
    helpfulError: "রেটিং সংরক্ষণ করা যায়নি। আবার চেষ্টা করুন।",
    helpfulUnavailable: "এই উত্তরে মতামত দেওয়া যাচ্ছে না।",
    copyAnswer: "কপি",
    copied: "কপি হয়েছে",
    exploreNext: "এরপর জানুন",
    emptyTitle: "এই জ্ঞান-পরিসরে জিজ্ঞাসা করুন",
    emptyBody:
      "নিচের একটি প্রশ্ন দিয়ে শুরু করুন, অথবা নিজেরটা লিখুন। উত্তর পাঠযোগ্য থাকবে — উৎসও কাছে থাকবে।",
    pendingLabel: "প্রাসঙ্গিক উৎস দেখা হচ্ছে…",
    errorTitle: "এই উত্তর দেখানো যায়নি",
    errorBody:
      "উত্তর তৈরি করতে গিয়ে সমস্যা হয়েছে। নতুন আলোচনা শুরু করে আবার জিজ্ঞাসা করুন।",
    retryableErrorBody:
      "প্রশ্নটি গ্রহণ করা হয়নি। এখানেই আবার চেষ্টা করুন, অথবা নতুন আলোচনা শুরু করুন।",
    closeSources: "উৎস বন্ধ করুন",
    openSources: "উৎস খুলুন",
    composerLanguage: "উত্তরের ভাষা",
    composerLanguageHint:
      "উত্তর প্রশ্নের ভাষা অনুসরণ করে। ইংরেজি, বাংলা বা বাংলিশ বেছে নেওয়া পরে আসবে।",
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
    catalogUnavailableTitle: "এই জ্ঞান-পরিসর এখন খোলা যাচ্ছে না",
    catalogUnavailableBody:
      "বিষয়ের তথ্য এখন লোড করা যায়নি। একটু পরে আবার চেষ্টা করুন।",
    reviewedOn: "হালনাগাদ {date}",
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
          body: "এই আলোচনায় আপনার পরের প্রশ্ন করুন।",
        },
      ],
    },
  },
};
