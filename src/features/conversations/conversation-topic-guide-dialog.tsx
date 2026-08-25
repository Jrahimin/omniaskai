import type { WorkspaceGuide } from "./conversation-language";
import { CloseIcon } from "./conversation-icons";

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
    <div className="px-5 py-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 id={titleId} className="text-[1.05rem] font-semibold tracking-tight">
            {guide.title}
          </h2>
          <p className="text-muted mt-1.5 text-[0.84rem] leading-relaxed">
            {guide.intro}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-muted hover:text-foreground inline-flex size-8 shrink-0 cursor-pointer items-center justify-center rounded-full"
          aria-label={closeLabel}
        >
          <CloseIcon className="size-3.5" />
        </button>
      </div>

      <ol className="mt-4 flex flex-col gap-3">
        {guide.steps.map((step, index) => (
          <li key={step.title} className="flex gap-3">
            <span className="bg-brand-soft text-brand mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[0.72rem] font-semibold">
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
        <div className="mt-4">
          <p className="text-muted text-[0.68rem] font-semibold tracking-wide uppercase">
            {guide.exampleHeading}
          </p>
          <ul className="mt-1.5 flex flex-col gap-1.5">
            {guide.exampleQuestions.map((question) => (
              <li key={question}>
                <button
                  type="button"
                  onClick={() => onExample(question)}
                  className="border-border hover:border-brand/30 w-full cursor-pointer rounded-xl border bg-[#fafbff] px-3 py-2 text-left text-[0.8rem] leading-snug"
                >
                  {question}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
