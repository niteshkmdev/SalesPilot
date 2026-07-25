export default function DashboardLoading() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
      <div className="h-8 w-48 animate-pulse rounded-md bg-muted" />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {["a", "b", "c", "d"].map((key) => (
          <div
            key={key}
            className="h-28 animate-pulse rounded-xl border bg-muted/50"
          />
        ))}
      </div>
      <div className="h-64 animate-pulse rounded-xl border bg-muted/50" />
    </div>
  );
}
