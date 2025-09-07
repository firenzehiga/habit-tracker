"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const HabitCalendar = dynamic(
	() =>
		import("@/components/calendar/habit-calendar").then((mod) => ({
			default: mod.HabitCalendar,
		})),
	{
		loading: () => (
			<div className="space-y-4">
				<Skeleton className="h-6 w-32" />
				<Skeleton className="h-64 w-full" />
			</div>
		),
		ssr: false,
	}
);

export default HabitCalendar;
