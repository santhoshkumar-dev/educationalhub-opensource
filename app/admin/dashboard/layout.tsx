import NavBar from "@/components/dashboard/NavBar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <section className="flex min-h-screen">
      <NavBar />

      <div className="w-full">{children}</div>
    </section>
  );
}
