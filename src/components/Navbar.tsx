import { Menu } from "lucide-react";
import { SearchInput } from "@/components/navbar/SearchInput";
import { NotificationDropdown } from "@/components/navbar/NotificationDropdown";
import { UserProfile } from "@/components/navbar/UserProfile";
import { AuditFreezeBanner } from "@/components/audit/AuditFreezeBanner";

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  return (
    <div>
      <AuditFreezeBanner />
      <header className="sticky top-0 z-20 h-16 bg-white border-b border-slate-200 flex items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          aria-label="Buka menu"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="flex-1 min-w-0">
          <SearchInput />
        </div>

        <div className="flex items-center gap-2 sm:gap-4 lg:gap-6">
          <NotificationDropdown />
          <UserProfile />
        </div>
      </header>
    </div>
  );
}
