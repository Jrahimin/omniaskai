import type { ConversationSource, TopicWorkspace } from "../conversation";

const sources: ConversationSource[] = [
  {
    id: "plassey",
    index: 1,
    title: "Battle of Plassey, 1757",
    shortLabel: "Plassey 1757",
    publisher: "Standard history survey",
    year: "1757",
    locator: "event note",
    excerpt:
      "Plassey did not hand Bengal over in a day, but it gave the Company a decisive political opening.",
  },
  {
    id: "diwani",
    index: 2,
    title: "Grant of the Diwani, 1765",
    shortLabel: "Diwani 1765",
    publisher: "Mughal–Company settlement",
    year: "1765",
    locator: "1765",
    excerpt:
      "The Diwani gave the Company the right to collect revenue in Bengal, Bihar, and Orissa — the fiscal core of later colonial rule.",
  },
  {
    id: "buxar",
    index: 3,
    title: "Battle of Buxar, 1764",
    shortLabel: "Buxar 1764",
    publisher: "Standard history survey",
    year: "1764",
    locator: "event note",
    excerpt:
      "Buxar confirmed Company arms against a wider coalition and made the later Diwani politically possible.",
  },
];

export const bangladeshHistoryWorkspace: TopicWorkspace = {
  topicSlug: "bangladesh-history",
  defaultConversationId: "company-dokhol",
  exploreItemIds: ["guides", "calculators", "updates", "scenarios"],
  starterQuestions: [
    "British raj kivabe Bangla dokhol korlo?",
    "1971-er mujibnagar sorkar kothay gothito hoy?",
    "What was the Language Movement asking for?",
  ],
  sources,
  cannedReply: {
    role: "assistant",
    status: "grounded",
    sourceIds: ["plassey", "diwani"],
    followUps: [
      "Diwani-r por Bengal e ki change hoy?",
      "Who fought at Buxar?",
    ],
    blocks: [
      {
        type: "paragraph",
        text: "Sample reply for this workspace. A full answer would walk the dates from the sources on the right. Short version: Company power in Bengal grew in steps, not in one battle.",
        citationIds: ["plassey"],
      },
    ],
  },
  conversations: [
    {
      id: "company-dokhol",
      title: "British raj kivabe Bangla dokhol korlo?",
      bucket: "today",
      happenedAtLabel: "4:20 PM",
      turns: [
        {
          id: "dokhol-q",
          role: "user",
          text: "British raj kivabe Bangla dokhol korlo?",
          createdAtLabel: "4:19 PM",
        },
        {
          id: "dokhol-a",
          role: "assistant",
          status: "grounded",
          sourceIds: ["plassey", "buxar", "diwani"],
          followUps: [
            "Plassey te actually ki hoyechilo?",
            "Diwani mane ki?",
            "Buxar keno important?",
          ],
          blocks: [
            {
              type: "paragraph",
              text: "It happened step by step. Plassey in 1757 gave the Company political influence, Buxar strengthened it, and the Diwani in 1765 handed them control over Bengal’s revenue.",
              citationIds: ["plassey"],
            },
            {
              type: "heading",
              text: "Three turns",
            },
            {
              type: "list",
              items: [
                {
                  icon: "trend",
                  title: "Plassey, 1757",
                  body: "A political opening more than a total conquest — the Nawab was displaced, and the Company could now shape succession.",
                  citationIds: ["plassey"],
                },
                {
                  icon: "briefcase",
                  title: "Buxar, 1764",
                  body: "Arms against a wider coalition. After Buxar, the Company’s position was much harder to reverse.",
                  citationIds: ["buxar"],
                },
                {
                  icon: "wallet",
                  title: "Diwani, 1765",
                  body: "The right to collect revenue in Bengal, Bihar, and Orissa — the money that made later colonial government possible.",
                  citationIds: ["diwani"],
                },
              ],
            },
            {
              type: "callout",
              text: "“Dokhol” here is a process: influence, then force, then the treasury. Treating 1757 as the whole story misses the fiscal turn in 1765.",
            },
          ],
        },
      ],
    },
    {
      id: "language-movement",
      title: "What was the Language Movement asking for?",
      bucket: "previous7Days",
      happenedAtLabel: "May 9",
      turns: [
        {
          id: "bhasha-q",
          role: "user",
          text: "What was the Language Movement asking for?",
          createdAtLabel: "May 9",
        },
        {
          id: "bhasha-a",
          role: "assistant",
          status: "grounded",
          sourceIds: [],
          followUps: ["21 February keno smaraniyo?"],
          blocks: [
            {
              type: "paragraph",
              text: "The central demand was that Bangla be recognised as a state language of Pakistan, not only Urdu. That cultural claim became a political one as the state refused it.",
            },
            {
              type: "callout",
              text: "This sample thread is thinner on sources than the Company-rule answer. In the product, a Language Movement question would open a dedicated set of 1952 documents.",
            },
          ],
        },
      ],
    },
  ],
};
