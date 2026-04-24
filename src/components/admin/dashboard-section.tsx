"use client"

export function DashboardSection() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="font-sans text-2xl font-bold text-foreground mb-1">Dashboard</h1>
        <p className="text-sm font-mono text-muted-foreground">app/admin/page.tsx</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {[
          { label: "Total Pages", value: "4", change: "+2 this week" },
          { label: "Published", value: "3", change: "75% of total" },
          { label: "Draft", value: "1", change: "1 pending review" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border p-6">
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-3xl font-bold text-foreground mb-2">{stat.value}</p>
            <p className="text-xs font-mono text-muted-foreground">{stat.change}</p>
          </div>
        ))}
      </div>
    </div>
  )
}