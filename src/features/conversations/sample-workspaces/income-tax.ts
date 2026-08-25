import type { ConversationSource, TopicWorkspace } from "../conversation";

const sources: ConversationSource[] = [
  {
    id: "ito-1984",
    index: 1,
    title: "Income Tax Ordinance, 1984",
    shortLabel: "IT Ordinance · s.20",
    publisher: "Government of Bangladesh",
    year: "1984",
    locator: "s. 20",
    excerpt:
      "Income from salaries, interest on securities, income from house property, agricultural income, income from business or profession, capital gains, and income from other sources.",
    href: "https://nbr.gov.bd",
  },
  {
    id: "nbr-guide",
    index: 2,
    title: "NBR Income Tax Guide",
    shortLabel: "NBR Guide · p.12",
    publisher: "National Board of Revenue",
    year: "2024",
    locator: "p. 12",
    excerpt:
      "A resident assesses tax on total income from all sources, subject to exemptions and exclusions set out in the Ordinance and related rules.",
    href: "https://nbr.gov.bd",
  },
  {
    id: "ita-2023",
    index: 3,
    title: "Income Tax Act, 2023",
    shortLabel: "Income Tax Act · s.15",
    publisher: "Government of Bangladesh",
    year: "2023",
    locator: "s. 15",
    excerpt:
      "Heads of income remain the organising frame for what is brought to tax, including gains on the transfer of capital assets.",
  },
  {
    id: "sro-capital",
    index: 4,
    title: "SRO on capital gains computation",
    shortLabel: "SRO · capital gains",
    publisher: "National Board of Revenue",
    year: "2023",
    locator: "computation note",
    excerpt:
      "Taxable capital gain is arrived at after deducting the cost of acquisition and allowable expenses from the sale consideration.",
  },
  {
    id: "exemption-note",
    index: 5,
    title: "Schedule of exemptions (selected)",
    shortLabel: "Exemptions · sch.",
    publisher: "National Board of Revenue",
    year: "2024",
    locator: "selected heads",
    excerpt:
      "Some receipts are excluded or exempt in whole or in part. Always check the current schedule before treating an amount as tax-free.",
  },
];

export const incomeTaxWorkspace: TopicWorkspace = {
  topicSlug: "income-tax",
  defaultConversationId: "taxable-sources",
  exploreItemIds: ["guides", "calculators", "updates", "scenarios"],
  starterQuestions: [
    "What income sources are taxable in Bangladesh?",
    "How is capital gain tax calculated?",
    "Salary-r upor tax kivabe count hoy?",
  ],
  sources,
  cannedReply: {
    role: "assistant",
    status: "grounded",
    sourceIds: ["nbr-guide", "ito-1984"],
    followUps: [
      "What expenses are tax deductible?",
      "Is agricultural income always exempt?",
    ],
    blocks: [
      {
        type: "paragraph",
        text: "This workspace is using a sample reply for now. In the full product, your question would be answered from the tax sources on the right.",
        citationIds: ["nbr-guide"],
      },
      {
        type: "paragraph",
        text: "Heads of income in Bangladesh are set out in the Ordinance — salary, business, house property, capital gains, and a few others — each with its own rules and possible exemptions.",
        citationIds: ["ito-1984"],
      },
    ],
  },
  conversations: [
    {
      id: "taxable-sources",
      title: "What income sources are taxable in Bangladesh?",
      bucket: "today",
      happenedAtLabel: "10:15 AM",
      turns: [
        {
          id: "taxable-sources-q",
          role: "user",
          text: "What income sources are taxable in Bangladesh?",
          createdAtLabel: "10:14 AM",
        },
        {
          id: "taxable-sources-a",
          role: "assistant",
          status: "grounded",
          sourceIds: [
            "ito-1984",
            "nbr-guide",
            "ita-2023",
            "sro-capital",
            "exemption-note",
          ],
          followUps: [
            "What expenses are tax deductible?",
            "How is capital gain tax calculated?",
            "Salary-r upor tax kivabe count hoy?",
          ],
          blocks: [
            {
              type: "paragraph",
              text: "Several kinds of income can be brought to tax for a resident in Bangladesh. The exact treatment depends on the head of income — and some amounts are exempt or excluded.",
              citationIds: ["nbr-guide"],
            },
            {
              type: "heading",
              text: "Main heads of income",
            },
            {
              type: "list",
              items: [
                {
                  icon: "briefcase",
                  title: "Salaries",
                  body: "Pay, allowances, and most benefits from employment, after the deductions the law allows.",
                  citationIds: ["ito-1984"],
                },
                {
                  icon: "trend",
                  title: "Business or profession",
                  body: "Profit from a trade, profession, or vocation, including some incidental receipts.",
                  citationIds: ["ito-1984"],
                },
                {
                  icon: "home",
                  title: "House property",
                  body: "Annual value of buildings you own, with standard and interest deductions where they apply.",
                  citationIds: ["ita-2023"],
                },
                {
                  icon: "wallet",
                  title: "Capital gains",
                  body: "Gain on transferring a capital asset, after cost and allowable expenses.",
                  citationIds: ["sro-capital"],
                },
              ],
            },
            {
              type: "callout",
              text: "Agricultural income and some other receipts may be exempt or partly excluded. Check the current exemption schedule before treating an amount as tax-free.",
            },
            {
              type: "heading",
              text: "If you sell an asset",
            },
            {
              type: "formula",
              text: "Taxable capital gain = Sale consideration − Cost of acquisition − Allowable expenses",
            },
            {
              type: "paragraph",
              text: "Rates and holding-period rules can differ for land, securities, and other assets. The computation note is the place to confirm the arithmetic; the Ordinance is the place to confirm what counts as a capital asset.",
              citationIds: ["exemption-note"],
            },
          ],
        },
      ],
    },
    {
      id: "savings-interest",
      title: "Do I pay tax on savings interest?",
      bucket: "today",
      happenedAtLabel: "8:42 AM",
      turns: [
        {
          id: "savings-q",
          role: "user",
          text: "Bank e savings interest e ki tax lage?",
          createdAtLabel: "8:41 AM",
        },
        {
          id: "savings-a",
          role: "assistant",
          status: "grounded",
          sourceIds: ["ito-1984", "nbr-guide"],
          followUps: [
            "Is TDS on bank interest adjustable?",
            "What income sources are taxable in Bangladesh?",
          ],
          blocks: [
            {
              type: "paragraph",
              text: "Interest on a savings or deposit account is usually income. It often sits under “other sources” or a similar head, unless a specific exemption applies.",
              citationIds: ["ito-1984"],
            },
            {
              type: "paragraph",
              text: "Banks may already deduct tax at source. That deduction is typically adjustable against the tax on your total income — it is not always the last word on whether the interest is taxable.",
              citationIds: ["nbr-guide"],
            },
          ],
        },
      ],
    },
    {
      id: "tin-basics",
      title: "Who needs a TIN in Bangladesh?",
      bucket: "previous7Days",
      happenedAtLabel: "May 10",
      turns: [
        {
          id: "tin-q",
          role: "user",
          text: "Who needs a TIN in Bangladesh?",
          createdAtLabel: "May 10",
        },
        {
          id: "tin-a",
          role: "assistant",
          status: "grounded",
          sourceIds: ["nbr-guide"],
          followUps: ["How do I register for a TIN?"],
          blocks: [
            {
              type: "paragraph",
              text: "A TIN is the identifier NBR uses for a taxpayer. People and companies who must file, or who need the number for a transaction NBR lists, should hold one.",
              citationIds: ["nbr-guide"],
            },
            {
              type: "callout",
              text: "The list of when a TIN is required (property, vehicles, and similar) is updated from time to time. Confirm against the current NBR notice before you treat a case as optional.",
            },
          ],
        },
      ],
    },
  ],
};
