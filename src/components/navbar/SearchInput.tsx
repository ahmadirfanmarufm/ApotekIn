export function SearchInput() {
  return (
    <div className="flex-1">
      <input
        type="text"
        placeholder="Cari data, inventaris, atau resep..."
        className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 w-80 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
      />
    </div>
  );
}