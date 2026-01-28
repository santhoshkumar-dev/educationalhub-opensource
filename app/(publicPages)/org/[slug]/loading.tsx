export default function Loading() {
  return (
    <section className="min-h-screen">
      <div
        className="flex h-[400px] w-full flex-col items-center justify-center gap-4"
        style={{
          backgroundImage: "url('/custom/banner.png')",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="h-32 w-32 animate-pulse rounded-full bg-white/20" />
        <div className="h-8 w-60 animate-pulse rounded bg-white/20" />
      </div>

      <div className="w-full p-8">
        <div className="mb-4 h-6 w-48 animate-pulse rounded bg-white/20" />
        {Array.from({ length: 6 }).map((_, idx) => (
          <div
            key={idx}
            className="mb-4 h-[350px] w-full animate-pulse rounded-lg bg-white/20"
          />
        ))}
      </div>
    </section>
  );
}
