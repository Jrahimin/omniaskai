import type { ConversationSource, TopicWorkspace } from "../conversation";

const sources: ConversationSource[] = [
  {
    id: "poem-text",
    index: 1,
    title: "দুই বিঘা জমি",
    shortLabel: "কবিতা পাঠ",
    publisher: "রবীন্দ্রনাথ ঠাকুর",
    year: "1894",
    locator: "সম্পূর্ণ কবিতা",
    excerpt:
      "সেই দুই বিঘা জমি, আমার ভুবনভরা — ছোট জমি, অথচ সমস্ত পৃথিবীর মতো আপন।",
  },
  {
    id: "tagore-essay",
    index: 2,
    title: "সাহিত্য আলোচনা: দুই বিঘা জমি",
    shortLabel: "সাহিত্য আলোচনা",
    publisher: "বাংলা সাহিত্য সমীক্ষা",
    year: "2018",
    locator: "পৃ. 44–48",
    excerpt:
      "কবিতাটি কেবল সম্পত্তি হারানোর বিবরণ নয়; ক্ষমতার অন্যায় আর মাটির প্রতি টানের সংলাপ।",
  },
  {
    id: "gitanjali-note",
    index: 3,
    title: "Gitanjali — introductory note",
    shortLabel: "Gitanjali note",
    publisher: "Macmillan (historical ed.)",
    year: "1913",
    locator: "preface",
    excerpt:
      "The songs are offered as a devotion of the poet’s inner life, not as a catalogue of doctrine.",
  },
];

export const literatureWorkspace: TopicWorkspace = {
  topicSlug: "literature",
  defaultConversationId: "dui-bigha",
  exploreItemIds: ["guides", "calculators", "updates", "scenarios"],
  starterQuestions: [
    "রবীন্দ্রনাথের 'দুই বিঘা জমি' কবিতার আসল কথাটা কী?",
    "What is the mood of Gitanjali?",
    "জীবনানন্দের কবিতায় নিসর্গ কেন এত গুরুত্বপূর্ণ?",
  ],
  sources,
  cannedReply: {
    role: "assistant",
    status: "grounded",
    sourceIds: ["tagore-essay"],
    followUps: ["কবিতাটি কীভাবে শেষ হয়?", "আর কোন রবীন্দ্র-কবিতা এই সুরে?"],
    blocks: [
      {
        type: "paragraph",
        text: "এটি নমুনা উত্তর। পূর্ণ পণ্যে আপনার প্রশ্নটি পাঠ ও আলোচনার উৎস থেকে উত্তর পাবে। আপাতত ডানদিকের উৎসগুলো দেখে নিন কীভাবে প্রমাণ কাছে রাখা হয়।",
        citationIds: ["tagore-essay"],
      },
    ],
  },
  conversations: [
    {
      id: "dui-bigha",
      title: "দুই বিঘা জমি — আসল কথা",
      bucket: "today",
      happenedAtLabel: "11:02 AM",
      turns: [
        {
          id: "dui-bigha-q",
          role: "user",
          text: "রবীন্দ্রনাথের 'দুই বিঘা জমি' কবিতার আসল কথাটা কী?",
          createdAtLabel: "11:01 AM",
        },
        {
          id: "dui-bigha-a",
          role: "assistant",
          status: "grounded",
          sourceIds: ["poem-text", "tagore-essay"],
          followUps: [
            "জমি হারানোর পর কবি কী অনুভব করেন?",
            "এই কবিতায় ক্ষমতা কীভাবে দেখা যায়?",
          ],
          blocks: [
            {
              type: "paragraph",
              text: "এটা শুধু জমি হারানোর গল্প নয়। ছোট একজন মানুষের অসহায়তা, ক্ষমতার অন্যায় আর নিজের মাটির প্রতি টান — সব মিলিয়েই কবিতার মূল অনুভূতি।",
              citationIds: ["tagore-essay"],
            },
            {
              type: "heading",
              text: "কী ঘটে",
            },
            {
              type: "list",
              items: [
                {
                  icon: "home",
                  title: "ছোট জমি, বড় আপনত্ব",
                  body: "দুই বিঘা জমি আয়তনে সামান্য, কিন্তু বক্তার কাছে তা সমস্ত ভুবনের মতো।",
                  citationIds: ["poem-text"],
                },
                {
                  icon: "book",
                  title: "ক্ষমতার চাপ",
                  body: "জমি চলে যায় এমন এক শক্তির কাছে যার সঙ্গে সমান তালে লড়া যায় না।",
                  citationIds: ["tagore-essay"],
                },
              ],
            },
            {
              type: "callout",
              text: "পাঠটি খুলে দেখলে সুরটা আরও পরিষ্কার: অভিযোগ আছে, কিন্তু তার চেয়ে গভীর হলো মাটি ছেড়ে যাওয়ার বেদনা।",
            },
          ],
        },
      ],
    },
    {
      id: "gitanjali-mood",
      title: "Mood of Gitanjali",
      bucket: "previous7Days",
      happenedAtLabel: "May 8",
      turns: [
        {
          id: "gitanjali-q",
          role: "user",
          text: "What is the mood of Gitanjali?",
          createdAtLabel: "May 8",
        },
        {
          id: "gitanjali-a",
          role: "assistant",
          status: "grounded",
          sourceIds: ["gitanjali-note"],
          followUps: ["How does Tagore address the divine in Gitanjali?"],
          blocks: [
            {
              type: "paragraph",
              text: "The English Gitanjali reads as devotion more than argument — a sequence of songs offered inward, with stillness, longing, and a quiet address to the divine.",
              citationIds: ["gitanjali-note"],
            },
          ],
        },
      ],
    },
  ],
};
