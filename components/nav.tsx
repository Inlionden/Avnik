"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  MessageCircle,
  ListChecks,
  BookOpen,
  BarChart3,
  User,
  Settings,
  Star,
} from "lucide-react";

const items = [
  { href: "/home", label: "Home", icon: Home },
  { href: "/coach", label: "Coach", icon: MessageCircle },
  { href: "/tasks", label: "Tasks", icon: ListChecks },
  { href: "/journal", label: "Journal", icon: BookOpen },
  { href: "/insights", label: "Insights", icon: BarChart3 },
  { href: "/profile", label: "Profile", icon: User },
];

export function Nav() {
  const path = usePathname();
  const active = (href: string) => path === href || path.startsWith(href + "/");

  return (
    <>
      {/* Desktop left rail */}
      <aside className="sticky top-0 hidden h-dvh w-52 shrink-0 flex-col gap-1 border-r border-line p-4 md:flex">
        <div className="mb-4 flex items-center gap-2 px-2 text-lg font-bold text-brand">
          <Star className="size-5 text-accent" /> Avnik
        </div>
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
              active(href) ? "bg-brand text-white" : "text-ink hover:bg-black/5"
            }`}
          >
            <Icon className="size-4" /> {label}
          </Link>
        ))}
        <Link
          href="/settings"
          className={`mt-auto flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
            active("/settings") ? "bg-brand text-white" : "text-muted hover:bg-black/5"
          }`}
        >
          <Settings className="size-4" /> Settings
        </Link>
      </aside>

      {/* Mobile bottom bar */}
      <nav className="fixed inset-x-0 bottom-0 z-20 flex justify-around border-t border-line bg-surface/95 py-2 backdrop-blur md:hidden">
        {items.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={`flex flex-col items-center gap-0.5 px-2 text-[10px] ${
              active(href) ? "text-brand" : "text-muted"
            }`}
          >
            <Icon className="size-5" /> {label}
          </Link>
        ))}
      </nav>
    </>
  );
}
