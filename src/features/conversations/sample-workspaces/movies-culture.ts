import type { ConversationSource, TopicWorkspace } from "../conversation";

const sources: ConversationSource[] = [
  {
    id: "pather-panchali",
    index: 1,
    title: "পথের পাঁচালী",
    shortLabel: "পথের পাঁচালী",
    publisher: "সত্যজিৎ রায়",
    year: "1955",
    locator: "feature film",
    excerpt:
      "গ্রামের দৈনন্দিন জীবন — ক্ষুধা, খেলা, বিদায় — সিনেমার কেন্দ্রে, বীরত্বের বাইরে।",
  },
  {
    id: "ray-on-ray",
    index: 2,
    title: "Ray on Ray",
    shortLabel: "Ray on Ray",
    publisher: "Interviews & notes",
    year: "1976",
    locator: "selected remarks",
    excerpt:
      "Ray spoke of filming ordinary life with patience — faces, silences, and rooms that already knew the story.",
  },
  {
    id: "aparajito-note",
    index: 3,
    title: "অপরাজিত — নোট",
    shortLabel: "অপরাজিত",
    publisher: "Film notes",
    year: "1956",
    locator: "sequel note",
    excerpt:
      "The second Apu film turns from village childhood toward the city and the cost of leaving home.",
  },
];

export const moviesCultureWorkspace: TopicWorkspace = {
  topicSlug: "movies-culture",
  defaultConversationId: "ray-difference",
  exploreItemIds: ["guides", "calculators", "updates", "scenarios"],
  starterQuestions: [
    "সত্যজিৎ রায়ের সিনেমা এত আলাদা কেন?",
    "Where can I watch Jukti Takko Aar Gappo?",
    "What is the song 'Ami Banglay Gaan Gai' about?",
  ],
  sources,
  cannedReply: {
    role: "assistant",
    status: "grounded",
    sourceIds: ["ray-on-ray"],
    followUps: ["Apu ট্রিলজির পর কোন সিনেমা দেখব?"],
    blocks: [
      {
        type: "paragraph",
        text: "নমুনা উত্তর। পূর্ণ পণ্যে প্রশ্নটি ফিল্ম ও রচনার উৎস থেকে উত্তর পাবে। আপাতত দেখুন উৎস কীভাবে উত্তরের পাশে থাকে।",
        citationIds: ["ray-on-ray"],
      },
    ],
  },
  conversations: [
    {
      id: "ray-difference",
      title: "সত্যজিৎ রায়ের সিনেমা এত আলাদা কেন?",
      bucket: "today",
      happenedAtLabel: "6:10 PM",
      turns: [
        {
          id: "ray-q",
          role: "user",
          text: "সত্যজিৎ রায়ের সিনেমা এত আলাদা কেন?",
          createdAtLabel: "6:09 PM",
        },
        {
          id: "ray-a",
          role: "assistant",
          status: "grounded",
          sourceIds: ["pather-panchali", "ray-on-ray"],
          followUps: [
            "পথের পাঁচালীতে অপুকে কীভাবে দেখা যায়?",
            "রায় কিভাবে সাউন্ড ব্যবহার করতেন?",
          ],
          blocks: [
            {
              type: "paragraph",
              text: "কারণ তিনি সাধারণ জীবনকেও অসাধারণভাবে দেখাতে পারতেন। মানুষ, নীরবতা, ছোট ছোট মুহূর্ত — সবকিছুর ভেতর থেকেই তিনি গভীর গল্প তৈরি করেছেন।",
              citationIds: ["ray-on-ray"],
            },
            {
              type: "list",
              items: [
                {
                  icon: "film",
                  title: "দৈনন্দিনকে কেন্দ্রে রাখা",
                  body: "পথের পাঁচালীতে ক্ষুধা, খেলা ও বিদায়ই কাহিনি — মহাকাব্যিক যুদ্ধ নয়।",
                  citationIds: ["pather-panchali"],
                },
                {
                  icon: "book",
                  title: "ধৈর্য",
                  body: "রায় মুখ, ঘর ও নীরবতার ওপর সময় দিতেন, যাতে দর্শক নিজে অর্থ করে নিতে পারে।",
                  citationIds: ["ray-on-ray"],
                },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "jukti-watch",
      title: "Where can I watch Jukti Takko Aar Gappo?",
      bucket: "today",
      happenedAtLabel: "2:04 PM",
      turns: [
        {
          id: "jukti-q",
          role: "user",
          text: "Where can I watch Jukti Takko Aar Gappo with reliable subtitles?",
          createdAtLabel: "2:03 PM",
        },
        {
          id: "jukti-a",
          role: "assistant",
          status: "insufficient",
          sourceIds: [],
          followUps: [
            "Which Ritwik films are in this library?",
            "সত্যজিৎ রায়ের সিনেমা এত আলাদা কেন?",
          ],
          blocks: [
            {
              type: "insufficient",
              title: "This library does not have a viewing source yet",
              body: "There is no catalogue entry here for a legal stream, disc, or archive print of Jukti Takko Aar Gappo. OmniAskAI will not guess a site. If you add a library, festival, or publisher record, a later answer can point to it.",
            },
          ],
        },
      ],
    },
    {
      id: "failed-lookup",
      title: "Festival catalogue lookup",
      bucket: "previous7Days",
      happenedAtLabel: "May 6",
      turns: [
        {
          id: "fail-q",
          role: "user",
          text: "Pull the 2024 Dhaka festival catalogue note on this print.",
          createdAtLabel: "May 6",
        },
        {
          id: "fail-a",
          role: "assistant",
          status: "error",
          sourceIds: [],
          followUps: ["সত্যজিৎ রায়ের সিনেমা এত আলাদা কেন?"],
          blocks: [],
        },
      ],
    },
  ],
};
