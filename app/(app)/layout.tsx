import { Nav } from "@/components/nav";
import Pulse from "@/components/Pulse";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col md:flex-row">
      <Nav />
      <main className="flex-1 px-5 pb-24 pt-6 md:px-10 md:pb-10 md:pt-10 anim-fade-up">
        <div className="mx-auto w-full max-w-6xl">
          <Pulse />
          {children}
        </div>
      </main>
    </div>
  );
}
