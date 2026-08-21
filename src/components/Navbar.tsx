import { SearchInput } from "@/components/navbar/SearchInput";
import { NotificationDropdown } from "@/components/navbar/NotificationDropdown";
import { UserProfile } from "@/components/navbar/UserProfile";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
      <SearchInput />

      <div className="flex items-center gap-6">
        <NotificationDropdown />
        <UserProfile />
      </div>
    </header>
  );
}
