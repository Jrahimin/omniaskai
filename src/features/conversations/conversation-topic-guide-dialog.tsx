import type { WorkspaceGuide } from "./conversation-language";
import { CloseIcon, SparkSmallIcon } from "./conversation-icons";

type ConversationTopicGuideDialogProps = {
  guide: WorkspaceGuide;
  closeLabel: string;
  titleId: string;
  onClose: () => void;
  onExample: (question: string) => void;
};

export function ConversationTopicGuideDialog({
  guide,
  closeLabel,
  titleId,
  onClose,
  onExample,
}: ConversationTopicGuideDialogProps) {
  return (
    <div className="workspace-guide">
      <div className="workspace-guide-hero flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="workspace-guide-eyebrow"><SparkSmallIcon className="size-3.5" />OmniAskAI</p>
          <h2 id={titleId} className="mt-2 text-[1.28rem] font-bold tracking-tight">
            {guide.title}
          </h2>
          <p className="mt-1.5 text-[0.84rem] leading-relaxed text-white/80">
            {guide.intro}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="workspace-guide-close inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full"
          aria-label={closeLabel}
        >
          <CloseIcon className="size-3.5" />
        </button>
      </div>

      <div className="workspace-guide-content">
        <ol className="workspace-guide-steps">
          {guide.steps.map((step, index) => (
            <li key={step.title} className="workspace-guide-step flex gap-3">
              <span className="workspace-guide-number mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[0.72rem] font-semibold">
                {index + 1}
              </span>
              <div className="min-w-0">
                <p className="text-[0.88rem] font-semibold">{step.title}</p>
                <p className="text-muted mt-0.5 text-[0.8rem] leading-relaxed">
                  {step.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        {guide.exampleQuestions.length > 0 ? (
          <div className="mt-5">
            <p className="text-muted text-[0.68rem] font-semibold tracking-wide uppercase">
              {guide.exampleHeading}
            </p>
            <ul className="mt-1.5 flex flex-col gap-1.5">
              {guide.exampleQuestions.map((question) => (
                <li key={question}>
                  <button
                    type="button"
                    onClick={() => onExample(question)}
                    className="workspace-guide-example w-full cursor-pointer rounded-xl px-3 py-2 text-left text-[0.8rem] leading-snug"
                  >
                    <span>{question}</span><span aria-hidden="true">↗</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}
