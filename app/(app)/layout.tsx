import { Nav } from "@/components/nav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh max-w-5xl flex-col md:flex-row">
      <Nav />
      <main className="flex-1 px-4 pb-24 pt-6 md:pb-8 md:pt-8">{children}</main>
    </div>
  );
}
