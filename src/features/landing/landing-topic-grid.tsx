import type { Locale } from "@/lib/locale/locale";
import type { Topic } from "@/features/topics/topic";
import { getTopicPresentation } from "@/features/topics/topic-presentation";

import type { LandingCopy } from "./landing-language";
import { topicCardCopy } from "./topic-card-copy";
import { TopicKnowledgeCard } from "./topic-knowledge-card";

type LandingTopicGridProps = {
  locale: Locale;
  copy: LandingCopy;
  topics: Topic[];
};

export function LandingTopicGrid({ locale, copy, topics }: LandingTopicGridProps) {
  return (
    <section id="topics" className="relative pt-6 pb-8 min-[1024px]:pt-5 min-[1024px]:pb-9">
      <div className="landing-wide">
        <h2 className="text-foreground text-center text-[1.55rem] font-bold tracking-tight min-[1024px]:text-[1.75rem]">
          {copy.topics.heading}
        </h2>
        {topics.length === 0 ? (
          <p className="text-muted mx-auto mt-8 max-w-lg text-center text-sm leading-relaxed">
            {copy.topics.empty}
          </p>
        ) : (
          <div className="topic-world-stage mt-7 grid grid-cols-1 gap-5 min-[760px]:grid-cols-2 min-[1024px]:mt-5 min-[1024px]:gap-4 min-[1024px]:items-stretch">
            {topics.map((topic, index) => (
              <TopicKnowledgeCard
                key={topic.id}
                slug={topic.slug}
                copy={topicCardCopy(topic, copy, locale)}
                presentation={getTopicPresentation(topic)}
                priority={index < 2}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
