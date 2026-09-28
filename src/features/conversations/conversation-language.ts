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
  sessionNote: string;
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
  sourceCountOne: string;
  referenceCountOne: string;
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
  taxOpeningTitle: string;
  taxOpeningBody: string;
  starterHint: string;
  composerTitle: string;
  composerFollowUpTitle: string;
  composerBusyTitle: string;
  coverageTitle: string;
  coverageNote: string;
  yearCoverageUnverified: string;
  pendingLabel: string;
  pendingSlow: string;
  stop: string;
  errorTitle: string;
  errorBody: string;
  retryableErrorBody: string;
  closeSources: string;
  openSources: string;
  composerLanguage: string;
  composerLanguageHint: string;
  answerLanguage: string;
  composerHint: string;
  citationLabel: string;
  excerptUnclear: string;
  sourceFallbackTitle: string;
  conversationSourcesAction: string;
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
    sessionNote: "Temporary conversation. Reloading this tab starts fresh.",
    themeLight: "Light",
    collapseSidebar: "Collapse sidebar",
    expandSidebar: "Expand sidebar",
    openHistory: "Open conversations",
    closeHistory: "Close conversations",
    topicsCrumb: "Topics",
    aboutThisTopic: "Explore this space",
    aboutHeading: "About this knowledge space",
    closeAbout: "Close",
    basedOnEvidence: "Based on {sources} · {references}",
    sources: "Sources",
    inThisAnswer: "In this answer",
    conversationSources: "Conversation sources",
    sourceCountOne: "{n} source",
    referenceCountOne: "{n} reference",
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
    emptyTitle: "Ask about this topic",
    emptyBody:
      "Start with a question below. The answer stays next to the sources you can open.",
    taxOpeningTitle: "Understand the rule. See the source.",
    taxOpeningBody:
      "Ask about Bangladesh income tax in your own words. Get a clear explanation, then open the passage behind a cited claim.",
    starterHint: "Choose a starting point. Make it your own.",
    composerTitle: "Your question starts here",
    composerFollowUpTitle: "Keep the conversation going",
    composerBusyTitle: "Preparing your answer",
    coverageTitle: "What this topic covers",
    coverageNote:
      "The review date is when this material was checked for OmniAskAI. It is not the year a rule applies. If the sources do not cover a year or a document, the answer should say so.",
    yearCoverageUnverified: "Check the tax year in each source before using a rule.",
    pendingLabel: "Finding relevant passages and preparing your answer…",
    pendingSlow: "Still working through the sources. Thanks for waiting—your answer is on its way.",
    stop: "Stop",
    errorTitle: "This answer could not be shown",
    errorBody:
      "Something went wrong while preparing this reply. Start a new conversation, then ask again.",
    retryableErrorBody:
      "The question was not accepted. You can try again here or start a new conversation.",
    closeSources: "Close sources",
    openSources: "Open sources",
    composerLanguage: "Reply language",
    composerLanguageHint:
      "Answers follow the wording of the question. Interface language does not choose the answer language.",
    answerLanguage: "Answers follow your question",
    composerHint: "Enter to send · Shift+Enter for a new line",
    citationLabel: "Source {n}: {title}",
    excerptUnclear:
      "This passage could not be displayed clearly. Open the original document.",
    sourceFallbackTitle: "Source document",
    conversationSourcesAction: "Sources for this conversation",
    languageAuto: "Auto",
    languageEn: "EN",
    languageBn: "বাং",
    languageBanglish: "Banglish",
    attach: "Attach",
    voice: "Voice input",
    send: "Send",
    disclaimer:
      "OmniAskAI can make mistakes. Please verify important information.",
    unavailable: "Original document link unavailable",
    you: "You",
    close: "Close",
    startersLabel: "Try asking",
    noMatchingConversations: "No conversations match that search.",
    noSourcesInAnswer: "This answer does not cite a source yet.",
    noSourcesInConversation:
      "Your sources will appear here after your first answer.",
    sourcesCount: "{n} sources",
    catalogUnavailableTitle: "This knowledge space is unavailable",
    catalogUnavailableBody:
      "The topic catalog could not be loaded. Please try again shortly.",
    reviewedOn: "Editorial review {date}",
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
    sessionNote: "অস্থায়ী আলোচনা। এই ট্যাব রিলোড করলে নতুন করে শুরু হয়।",
    themeLight: "হালকা",
    collapseSidebar: "সাইডবার গুটিয়ে নিন",
    expandSidebar: "সাইডবার খুলুন",
    openHistory: "আলোচনা খুলুন",
    closeHistory: "আলোচনা বন্ধ করুন",
    topicsCrumb: "বিষয়",
    aboutThisTopic: "জ্ঞান-পরিসর দেখুন",
    aboutHeading: "এই জ্ঞান-পরিসর সম্পর্কে",
    closeAbout: "বন্ধ করুন",
    basedOnEvidence: "{sources} · {references} ভিত্তিতে",
    sources: "উৎস",
    inThisAnswer: "এই উত্তরের উৎস",
    conversationSources: "আলোচনার উৎস",
    sourceCountOne: "{n}টি উৎস",
    referenceCountOne: "{n}টি রেফারেন্স",
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
    emptyTitle: "এই বিষয়ে জিজ্ঞাসা করুন",
    emptyBody:
      "নিচের একটি প্রশ্ন দিয়ে শুরু করুন। উত্তরের পাশে খোলা যায় এমন উৎস থাকবে।",
    taxOpeningTitle: "নিয়ম বুঝুন। উৎস নিজেই দেখুন।",
    taxOpeningBody:
      "বাংলাদেশের আয়কর নিয়ে নিজের ভাষায় জিজ্ঞাসা করুন। সহজ উত্তর পড়ুন, তারপর উদ্ধৃত দাবির পেছনের অংশ খুলে দেখুন।",
    starterHint: "একটি প্রশ্ন বেছে নিন, নিজের মতো বদলান।",
    composerTitle: "আপনার প্রশ্ন এখানেই শুরু",
    composerFollowUpTitle: "পরের প্রশ্নটি করুন",
    composerBusyTitle: "আপনার উত্তর তৈরি হচ্ছে",
    coverageTitle: "এই বিষয় কী কভার করে",
    coverageNote:
      "পর্যালোচনার তারিখ মানে উপাদান কবে দেখা হয়েছে। সেটা নিয়ম যে বছরে প্রযোজ্য, সেটা নয়। উৎসে কোনো বছর বা দলিল না থাকলে উত্তরে সেটা বলা উচিত।",
    yearCoverageUnverified: "নিয়ম প্রয়োগের আগে উৎসে করবর্ষ মিলিয়ে নিন।",
    pendingLabel: "প্রাসঙ্গিক উৎস খুঁজে আপনার উত্তর তৈরি করা হচ্ছে…",
    pendingSlow: "উৎসগুলো আরও ভালোভাবে দেখা হচ্ছে। অপেক্ষার জন্য ধন্যবাদ—উত্তর আসছে।",
    stop: "থামান",
    errorTitle: "এই উত্তর দেখানো যায়নি",
    errorBody:
      "উত্তর তৈরি করতে গিয়ে সমস্যা হয়েছে। নতুন আলোচনা শুরু করে আবার জিজ্ঞাসা করুন।",
    retryableErrorBody:
      "প্রশ্নটি গ্রহণ করা হয়নি। এখানেই আবার চেষ্টা করুন, অথবা নতুন আলোচনা শুরু করুন।",
    closeSources: "উৎস বন্ধ করুন",
    openSources: "উৎস খুলুন",
    composerLanguage: "উত্তরের ভাষা",
    composerLanguageHint:
      "উত্তর প্রশ্নের ভাষা অনুসরণ করে। পাতার ভাষা উত্তরের ভাষা ঠিক করে না।",
    answerLanguage: "উত্তর আপনার প্রশ্ন অনুসরণ করে",
    composerHint: "পাঠাতে Enter · নতুন লাইনে Shift+Enter",
    citationLabel: "উৎস {n}: {title}",
    excerptUnclear: "এই অংশটি স্পষ্ট দেখানো যায়নি। মূল দলিল খুলুন।",
    sourceFallbackTitle: "উৎসের দলিল",
    conversationSourcesAction: "এই আলোচনার উৎস",
    languageAuto: "স্বয়ং",
    languageEn: "EN",
    languageBn: "বাং",
    languageBanglish: "বাংলিশ",
    attach: "সংযুক্ত করুন",
    voice: "ভয়েস ইনপুট",
    send: "পাঠান",
    disclaimer:
      "OmniAskAI ভুল করতে পারে। গুরুত্বপূর্ণ তথ্য নিজে যাচাই করুন।",
    unavailable: "মূল দলিলের লিংক নেই",
    you: "আপনি",
    close: "বন্ধ",
    startersLabel: "জিজ্ঞাসা করে দেখুন",
    noMatchingConversations: "এই খোঁজার সাথে কোনো আলোচনা মেলেনি।",
    noSourcesInAnswer: "এই উত্তরে এখনও কোনো উৎস নেই।",
    noSourcesInConversation: "প্রথম উত্তরের পর উৎস এখানে দেখা যাবে।",
    sourcesCount: "{n}টি উৎস",
    catalogUnavailableTitle: "এই জ্ঞান-পরিসর এখন খোলা যাচ্ছে না",
    catalogUnavailableBody:
      "বিষয়ের তথ্য এখন লোড করা যায়নি। একটু পরে আবার চেষ্টা করুন।",
    reviewedOn: "সম্পাদকীয় পর্যালোচনা {date}",
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
