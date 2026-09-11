export default function HomeLoading() {
  return (
    <div className="landing-canvas">
      <main id="main" className="landing-wide py-16">
        <div className="bg-brand-soft h-8 w-48 animate-pulse rounded-full" />
        <div className="bg-border mt-6 h-12 w-2/3 max-w-md animate-pulse rounded-lg" />
        <div className="mt-10 grid grid-cols-1 gap-5 min-[1024px]:grid-cols-2">
          <div className="bg-border h-80 animate-pulse rounded-[1.55rem]" />
          <div className="bg-border h-80 animate-pulse rounded-[1.55rem]" />
        </div>
      </main>
    </div>
  );
}
