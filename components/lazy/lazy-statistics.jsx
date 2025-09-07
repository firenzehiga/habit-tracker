"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const StatisticsOverview = dynamic(
	() =>
		import("@/components/statistics/statistics-overview").then((mod) => ({
			default: mod.StatisticsOverview,
		})),
	{
		loading: () => (
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				{Array.from({ length: 4 }).map((_, i) => (
					<div key={i} className="p-6 border rounded-lg space-y-2">
						<Skeleton className="h-4 w-20" />
						<Skeleton className="h-8 w-16" />
						<Skeleton className="h-3 w-24" />
					</div>
				))}
			</div>
		),
		ssr: false,
	}
);

const HabitPerformanceChart = dynamic(
	() =>
		import("@/components/statistics/habit-performance-chart").then((mod) => ({
			default: mod.HabitPerformanceChart,
		})),
	{
		loading: () => <Skeleton className="h-96 w-full" />,
		ssr: false,
	}
);

const TrendChart = dynamic(
	() =>
		import("@/components/statistics/trend-chart").then((mod) => ({
			default: mod.TrendChart,
		})),
	{
		loading: () => <Skeleton className="h-80 w-full" />,
		ssr: false,
	}
);

const CategoryBreakdown = dynamic(
	() =>
		import("@/components/statistics/category-breakdown").then((mod) => ({
			default: mod.CategoryBreakdown,
		})),
	{
		loading: () => <Skeleton className="h-80 w-full" />,
		ssr: false,
	}
);

export {
	StatisticsOverview,
	HabitPerformanceChart,
	TrendChart,
	CategoryBreakdown,
};
