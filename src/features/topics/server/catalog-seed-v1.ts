import type { CatalogFixture } from "../topic-validation-schema";

export const CATALOG_SEED_VERSION = 1;

export const catalogSeedFixtureV1: CatalogFixture = {
  version: 1,
  topics: [
    {
      id: "topic_income_tax",
      slug: "income-tax",
      sortOrder: 1,
      themeKey: "tax",
      focalPosition: "left center",
      knowledgeReviewDate: "2025-05-12",
      artwork: {
        storageKey: "topics/topic-income-tax.png",
        mimeType: "image/png",
        width: 1536,
        height: 1024,
        byteSize: 1_800_772,
      },
      translations: {
        en: {
          title: "Income Tax",
          landingDescription:
            "Understand tax rules without getting lost in legal language.",
          workspaceSubtitle: "Bangladesh Income Tax knowledge space",
          aboutDescription:
            "Ask in English, Bangla, or Banglish. Answers here are written from curated tax documents — ordinances, NBR guidance, and related notes — so you can read the claim and open the page it came from.",
          sourceDescription: "Ordinances, NBR guidance, and related notes",
          badge: "Popular",
          artworkAlt: "Income tax workspace illustration",
          composerPlaceholder: "Ask about Bangladesh Income Tax…",
          exploreLabel: "Explore Income Tax",
          preview: {
            youLabel: "You",
            assistantLabel: "OmniAskAI",
            question: "What income sources are taxable in Bangladesh?",
            answer:
              "Salary, business income, capital gains and a few other sources can be taxable. The exact rule depends on the type of income — and some income may be exempt.",
            sources: ["NBR Guide", "Income Tax Act"],
          },
          starterQuestions: [
            "What income sources are taxable in Bangladesh?",
            "How is capital gain tax calculated?",
            "Salary-r upor tax kivabe count hoy?",
          ],
        },
        bn: {
          title: "আয়কর",
          landingDescription: "জটিল করের নিয়ম সহজ ভাষায় বুঝে নিন।",
          workspaceSubtitle: "বাংলাদেশ আয়কর জ্ঞান-পরিসর",
          aboutDescription:
            "ইংরেজি, বাংলা বা বাংলিশে জিজ্ঞাসা করুন। উত্তরগুলো সংকলিত কর-দলিল — অধ্যাদেশ, এনবিআর নির্দেশনা ও সংশ্লিষ্ট নোট — থেকে লেখা, যাতে দাবিটি পড়ে সংশ্লিষ্ট পাতা খোলা যায়।",
          sourceDescription: "অধ্যাদেশ, এনবিআর নির্দেশনা ও সংশ্লিষ্ট নোট",
          badge: "জনপ্রিয়",
          artworkAlt: "আয়কর কর্মপরিসরের ছবি",
          composerPlaceholder: "বাংলাদেশের আয়কর নিয়ে জিজ্ঞাসা করুন…",
          exploreLabel: "আয়কর জানুন",
          starterQuestions: [],
        },
      },
    },
    {
      id: "topic_literature",
      slug: "literature",
      sortOrder: 2,
      themeKey: "literature",
      focalPosition: "left center",
      knowledgeReviewDate: "2025-04-03",
      artwork: {
        storageKey: "topics/topic-literature.png",
        mimeType: "image/png",
        width: 1536,
        height: 1024,
        byteSize: 1_718_178,
      },
      translations: {
        en: {
          title: "Literature",
          landingDescription:
            "Go beyond the summary. Explore stories, poems, ideas and meaning.",
          workspaceSubtitle: "Bangla and world literature",
          aboutDescription:
            "A quiet space for poems, stories, and the conversations around them. Answers point back to the text and to trusted commentary — not to a generic summary.",
          sourceDescription: "Poems, stories, and trusted commentary",
          artworkAlt: "Literature workspace illustration",
          composerPlaceholder: "Ask about a poem, story, or writer…",
          exploreLabel: "Explore Literature",
          preview: {
            youLabel: "You",
            assistantLabel: "OmniAskAI",
            question: "রবীন্দ্রনাথের 'দুই বিঘা জমি' কবিতার আসল কথাটা কী?",
            answer:
              "এটা শুধু জমি হারানোর গল্প নয়। ছোট একজন মানুষের অসহায়তা, ক্ষমতার অন্যায় আর নিজের মাটির প্রতি টান—সব মিলিয়েই কবিতার মূল অনুভূতি।",
            sources: ["কবিতা পাঠ", "সাহিত্য আলোচনা"],
          },
          starterQuestions: [
            "রবীন্দ্রনাথের 'দুই বিঘা জমি' কবিতার আসল কথাটা কী?",
            "What is the mood of Gitanjali?",
            "জীবনানন্দের কবিতায় নিসর্গ কেন এত গুরুত্বপূর্ণ?",
          ],
        },
        bn: {
          title: "সাহিত্য",
          landingDescription:
            "শুধু সারাংশ নয়—গল্প, কবিতা আর ভাবনার ভেতরে ঢুকে পড়ুন।",
          workspaceSubtitle: "বাংলা ও বিশ্বসাহিত্য",
          aboutDescription:
            "কবিতা, গল্প এবং তার চারপাশের আলোচনার জন্য একটি শান্ত পরিসর। উত্তর মূল পাঠ ও বিশ্বস্ত আলোচনার দিকে ইঙ্গিত করে — সাধারণ সারাংশের দিকে নয়।",
          sourceDescription: "কবিতা, গল্প ও বিশ্বস্ত আলোচনা",
          artworkAlt: "সাহিত্য কর্মপরিসরের ছবি",
          composerPlaceholder: "কবিতা, গল্প বা লেখক নিয়ে জিজ্ঞাসা করুন…",
          exploreLabel: "সাহিত্য ঘুরে দেখুন",
          starterQuestions: [],
        },
      },
    },
    {
      id: "topic_bangladesh_history",
      slug: "bangladesh-history",
      sortOrder: 3,
      themeKey: "history",
      focalPosition: "left center",
      knowledgeReviewDate: "2025-03-21",
      artwork: {
        storageKey: "topics/topic-bd-history.png",
        mimeType: "image/png",
        width: 1536,
        height: 1024,
        byteSize: 2_376_041,
      },
      translations: {
        en: {
          title: "Bangladesh History",
          landingDescription:
            "Follow the people, events and turning points that shaped Bangladesh.",
          workspaceSubtitle: "People, events, and sources",
          aboutDescription:
            "Follow events through primary and secondary sources. The workspace is built so you can ask naturally — including Banglish — and still see where a date or claim comes from.",
          sourceDescription: "Primary and secondary historical sources",
          artworkAlt: "Bangladesh history workspace illustration",
          composerPlaceholder: "Ask about people, events, or turning points…",
          exploreLabel: "Explore History",
          preview: {
            youLabel: "You",
            assistantLabel: "OmniAskAI",
            question: "British raj kivabe Bangla dokhol korlo?",
            answer:
              "It happened step by step. Plassey in 1757 gave the Company political influence, Buxar strengthened it, and the Diwani in 1765 handed them control over Bengal's revenue.",
            sources: ["Plassey 1757", "Diwani 1765"],
          },
          starterQuestions: [
            "British raj kivabe Bangla dokhol korlo?",
            "1971-er mujibnagar sorkar kothay gothito hoy?",
            "What was the Language Movement asking for?",
          ],
        },
        bn: {
          title: "বাংলাদেশের ইতিহাস",
          landingDescription:
            "মানুষ, ঘটনা আর মোড় ঘুরিয়ে দেওয়া মুহূর্তগুলো সহজভাবে জানুন।",
          workspaceSubtitle: "মানুষ, ঘটনা ও উৎস",
          aboutDescription:
            "প্রাথমিক ও গৌণ উৎসের মধ্য দিয়ে ঘটনা অনুসরণ করুন। স্বাভাবিকভাবে — বাংলিশেও — জিজ্ঞাসা করা যায়, আর তারপরও দেখা যায় একটি তারিখ বা দাবি কোথা থেকে এসেছে।",
          sourceDescription: "প্রাথমিক ও গৌণ ঐতিহাসিক উৎস",
          artworkAlt: "বাংলাদেশের ইতিহাস কর্মপরিসরের ছবি",
          composerPlaceholder: "মানুষ, ঘটনা বা মোড় নিয়ে জিজ্ঞাসা করুন…",
          exploreLabel: "ইতিহাস ঘুরে দেখুন",
          starterQuestions: [],
        },
      },
    },
    {
      id: "topic_movies_culture",
      slug: "movies-culture",
      sortOrder: 4,
      themeKey: "culture",
      focalPosition: "left 40%",
      knowledgeReviewDate: "2025-05-02",
      artwork: {
        storageKey: "topics/topic-movie-culture.png",
        mimeType: "image/png",
        width: 1536,
        height: 1024,
        byteSize: 1_898_260,
      },
      translations: {
        en: {
          title: "Movies & Culture",
          landingDescription:
            "Discover the stories behind films, music, artists and culture.",
          workspaceSubtitle: "Film, music, and cultural memory",
          aboutDescription:
            "Films, music, and the people who made them. When the library has the work or a reliable essay, you will see it. When it does not, the workspace says so plainly.",
          sourceDescription: "Films, music, and cultural essays",
          artworkAlt: "Movies and culture workspace illustration",
          composerPlaceholder: "Ask about a film, song, or artist…",
          exploreLabel: "Explore Movies & Culture",
          preview: {
            youLabel: "You",
            assistantLabel: "OmniAskAI",
            question: "সত্যজিৎ রায়ের সিনেমা এত আলাদা কেন?",
            answer:
              "কারণ তিনি সাধারণ জীবনকেও অসাধারণভাবে দেখাতে পারতেন। মানুষ, নীরবতা, ছোট ছোট মুহূর্ত—সবকিছুর ভেতর থেকেই তিনি গভীর গল্প তৈরি করেছেন।",
            sources: ["পথের পাঁচালী", "Ray on Ray"],
          },
          starterQuestions: [
            "সত্যজিৎ রায়ের সিনেমা এত আলাদা কেন?",
            "Where can I watch Jukti Takko Aar Gappo?",
            "What is the song 'Ami Banglay Gaan Gai' about?",
          ],
        },
        bn: {
          title: "সিনেমা ও সংস্কৃতি",
          landingDescription:
            "সিনেমা, গান, শিল্পী আর সংস্কৃতির পেছনের গল্পগুলো আবিষ্কার করুন।",
          workspaceSubtitle: "চলচ্চিত্র, সঙ্গীত ও সাংস্কৃতিক স্মৃতি",
          aboutDescription:
            "সিনেমা, সঙ্গীত এবং যারা সেগুলো তৈরি করেছেন। সংগ্রহে কাজটি বা একটি নির্ভরযোগ্য রচনা থাকলে আপনি তা দেখতে পাবেন। না থাকলে কর্মপরিসর সেটা স্পষ্ট করে বলে।",
          sourceDescription: "সিনেমা, সঙ্গীত ও সাংস্কৃতিক রচনা",
          artworkAlt: "সিনেমা ও সংস্কৃতি কর্মপরিসরের ছবি",
          composerPlaceholder: "সিনেমা, গান বা শিল্পী নিয়ে জিজ্ঞাসা করুন…",
          exploreLabel: "সিনেমা ও সংস্কৃতি দেখুন",
          starterQuestions: [],
        },
      },
    },
  ],
};
