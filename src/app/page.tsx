export default function HomePage() {
  return (
    <main id="main" tabIndex={-1} className="px-6 py-16">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          className="bg-brand inline-block size-8 rounded-full"
        />
        <h1 className="text-foreground text-lg font-semibold tracking-tight">
          OmniAskAI
        </h1>
      </div>
      <p className="text-muted mt-6 max-w-xl text-base">
        Curated knowledge worlds with trusted sources — not a generic chatbot.
      </p>
      <p className="text-muted mt-3 max-w-xl text-base">
        বিশ্বস্ত উৎস থেকে সাজানো জ্ঞানের জগৎ।
      </p>
    </main>
  );
}
