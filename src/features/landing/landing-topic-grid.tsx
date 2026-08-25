import type { Topic } from "@/features/topics/topic";
import { getTopicPresentation } from "@/features/topics/topic-presentation";

import type { LandingCopy, LandingTopicSlug } from "./landing-language";
import { TopicKnowledgeCard } from "./topic-knowledge-card";

type LandingTopicGridProps = {
  copy: LandingCopy;
  topics: Topic[];
};

export function LandingTopicGrid({ copy, topics }: LandingTopicGridProps) {
  return (
    <section id="topics" className="relative scroll-mt-20 pt-6 pb-8 min-[1024px]:pt-7 min-[1024px]:pb-10">
      <div className="landing-wide">
        <h2 className="text-foreground text-center text-[1.55rem] font-bold tracking-tight min-[1024px]:text-[1.75rem]">
          {copy.topics.heading}
        </h2>
        <div className="topic-world-stage mt-7 grid grid-cols-1 gap-5 min-[1024px]:mt-8 min-[1024px]:grid-cols-2 min-[1024px]:gap-6 min-[1024px]:items-stretch">
          {topics.map((topic, index) => {
            const cardCopy = copy.topics.cards[topic.slug as LandingTopicSlug];

            if (!cardCopy) {
              throw new Error(`Missing landing copy for topic "${topic.slug}".`);
            }

            const presentation = getTopicPresentation(topic);

            return (
              <TopicKnowledgeCard
                key={topic.id}
                slug={topic.slug}
                copy={cardCopy}
                presentation={presentation}
                priority={index < 2}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}
