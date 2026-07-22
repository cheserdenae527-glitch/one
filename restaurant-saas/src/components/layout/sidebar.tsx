"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/operations", label: "运营规划", icon: "D" },
  { href: "/content", label: "内容创作", icon: "P" },
  { href: "/reviews", label: "评价管理", icon: "S" },
  { href: "/images", label: "图片生成", icon: "I" },
  { href: "/settings", label: "设置", icon: "G" },
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-56 border-r bg-card flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center text-white font-bold text-xs">AI</div>
          <div>
            <div className="text-sm font-bold leading-tight">餐饮AI运营</div>
            <div className="text-[10px] text-muted-foreground">运营助手</div>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV_ITEMS.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all",
              isActive
                ? "bg-primary/10 text-primary font-medium shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            )}>
              <div className={cn(
                "w-7 h-7 rounded-md flex items-center justify-center text-xs font-bold transition-all",
                isActive ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
              )}>{item.icon}</div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      <div className="p-3 border-t">
        <div className="text-[10px] text-muted-foreground text-center">Demo 模式 · 14天试用</div>
      </div>
    </aside>
  );
}
