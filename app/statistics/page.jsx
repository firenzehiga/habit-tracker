"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { Navigation } from "@/components/layout/navigation";
import {
	StatisticsOverview,
	HabitPerformanceChart,
	TrendChart,
	CategoryBreakdown,
} from "@/components/lazy/lazy-statistics";

export default function StatisticsPage() {
	return (
		<ProtectedRoute>
			<div className="min-h-screen bg-background">
				<Navigation />

				<div className="container mx-auto px-4 py-8">
					{/* Header */}
					<div className="mb-8">
						<h1 className="text-3xl font-bold text-balance">
							Statistics & Analytics
						</h1>
						<p className="text-muted-foreground mt-2">
							Detailed insights into your habit tracking progress
						</p>
					</div>

					<div className="space-y-8">
						{/* Overview Cards */}
						<StatisticsOverview />

						{/* Charts Grid */}
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
							<TrendChart />
							<CategoryBreakdown />
						</div>

						{/* Habit Performance */}
						<HabitPerformanceChart />
					</div>
				</div>
			</div>
		</ProtectedRoute>
	);
}
