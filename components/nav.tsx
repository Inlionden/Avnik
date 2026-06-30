"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, MessageCircle, ListChecks, BookOpen, BarChart3, User, Settings } from "lucide-react";

const items = [
  { href: "/home",     label: "Home",      icon: Home },
  { href: "/coach",    label: "Forge",     icon: MessageCircle },
  { href: "/tasks",    label: "Tasks",     icon: ListChecks },
  { href: "/journal",  label: "Sanctuary", icon: BookOpen },
  { href: "/insights", label: "Patterns",  icon: BarChart3 },
  { href: "/profile",  label: "You",       icon: User },
];

export function Nav() {
  const path = usePathname();
  const active = (href: string) => path === href || path.startsWith(href + "/");

  return (
    <>
      {/* Desktop left rail — clean monochrome (template style) */}
      <aside className="sticky top-0 hidden h-dvh w-56 shrink-0 flex-col gap-1 border-r border-border bg-surface p-4 md:flex select-none">
        {/* Brand */}
        <Link href="/home" className="mb-7 px-2 pt-2 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-ink flex items-center justify-center">
            <span className="text-white text-sm font-black">A</span>
          </div>
          <div>
            <p className="text-ink font-black text-[15px] leading-tight tracking-tight">Avnik</p>
            <p className="text-muted text-[10px] font-medium">last-minute life saver</p>
          </div>
        </Link>

        {/* Nav items */}
        <div className="space-y-0.5">
          {items.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                active(href)
                  ? "bg-ink text-white"
                  : "text-muted hover:bg-black/[0.04] hover:text-ink"
              }`}
            >
              <Icon className="size-4 shrink-0" /> {label}
            </Link>
          ))}
        </div>

        {/* Settings */}
        <Link
          href="/settings"
          className={`mt-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
            active("/settings") ? "bg-ink text-white" : "text-muted hover:bg-black/[0.04] hover:text-ink"
          }`}
        >
          <Settings className="size-4" /> Settings
        </Link>
      </aside>

      {/* Mobile bottom bar */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-border bg-surface/95 py-2 pb-safe backdrop-blur md:hidden">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 px-2 py-1 rounded-xl transition-all ${
              active(href) ? "text-ink" : "text-muted"
            }`}
          >
            <Icon className="size-5" />
            <span className="text-[10px] font-semibold">{label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
