"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, ListChecks, BookOpen, BarChart3, User, Settings } from "lucide-react";

const items = [
  { href: "/home",     label: "Home",    icon: Home,          desc: "Overview" },
  { href: "/coach",    label: "Forge",   icon: MessageCircle, desc: "AI Coach" },
  { href: "/tasks",    label: "Tasks",   icon: ListChecks,    desc: "Your list" },
  { href: "/journal",  label: "Sanctuary",icon: BookOpen,     desc: "Write" },
  { href: "/insights", label: "Patterns",icon: BarChart3,     desc: "Deep look" },
  { href: "/profile",  label: "You",     icon: User,          desc: "Profile" },
];

export function Nav() {
  const path = usePathname();
  const active = (href: string) => path === href || path.startsWith(href + "/");

  return (
    <>
      {/* Desktop left rail */}
      <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col gap-1 border-r border-line bg-[#0f0e17] p-4 md:flex">
        {/* Brand */}
        <div className="mb-6 px-3 pt-2">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-md">
              <span className="text-white text-sm font-black">A</span>
            </div>
            <div>
              <p className="text-white font-bold text-base leading-tight">Avnik</p>
              <p className="text-white/40 text-[10px] font-medium">last-minute life saver</p>
            </div>
          </div>
        </div>

        {/* Nav items */}
        <div className="space-y-0.5">
          {items.map(({ href, label, icon: Icon, desc }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all group ${
                active(href)
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:bg-white/5 hover:text-white/80"
              }`}
            >
              <Icon className={`size-4 shrink-0 ${active(href) ? "text-indigo-400" : "text-white/40 group-hover:text-white/60"}`} />
              <div>
                <p className="leading-tight">{label}</p>
                {active(href) && <p className="text-[10px] text-white/40 font-normal">{desc}</p>}
              </div>
              {active(href) && <div className="ml-auto w-1 h-4 rounded-full bg-indigo-400" />}
            </Link>
          ))}
        </div>

        {/* Settings */}
        <Link
          href="/settings"
          className={`mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all ${
            active("/settings") ? "bg-white/10 text-white" : "text-white/30 hover:bg-white/5 hover:text-white/60"
          }`}
        >
          <Settings className="size-4" /> Settings
        </Link>
      </aside>

      {/* Mobile bottom bar */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-line bg-[#0f0e17]/95 py-2 pb-safe backdrop-blur md:hidden">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all ${
              active(href) ? "text-indigo-400" : "text-white/40"
            }`}
          >
            <Icon className="size-5" />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
