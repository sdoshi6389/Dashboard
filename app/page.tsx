import { DailyReviewPanel } from "@/components/dashboard/DailyReviewPanel";
import { DashboardWidgets } from "@/components/dashboard/DashboardWidgets";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-xl font-semibold mb-4">Overview</h2>
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <DashboardWidgets />
          </div>
          <div className="lg:col-span-1">
            <DailyReviewPanel />
          </div>
        </div>
      </section>
    </div>
  );
}
