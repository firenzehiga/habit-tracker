"use client"

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useHabitStatistics } from "@/hooks/use-statistics"
import { Skeleton } from "@/components/ui/skeleton"

export function HabitPerformanceChart() {
  const { data: stats, isLoading } = useHabitStatistics()

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-64 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!stats || stats.habits.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Habit Performance</CardTitle>
          <CardDescription>Individual habit completion rates over the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">No habit data available</div>
        </CardContent>
      </Card>
    )
  }

  const chartData = stats.habits.slice(0, 8).map((habit) => ({
    name: habit.name.length > 15 ? habit.name.substring(0, 15) + "..." : habit.name,
    rate: habit.completionRate,
    completions: habit.completions,
    streak: habit.currentStreak,
    color: habit.color,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Habit Performance</CardTitle>
        <CardDescription>Individual habit completion rates over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis dataKey="name" className="text-xs fill-muted-foreground" angle={-45} textAnchor="end" height={80} />
            <YAxis className="text-xs fill-muted-foreground" />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  const data = payload[0].payload
                  return (
                    <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                      <p className="font-medium">{label}</p>
                      <p className="text-sm text-muted-foreground">Completion Rate: {data.rate}%</p>
                      <p className="text-sm text-muted-foreground">Total Completions: {data.completions}</p>
                      <p className="text-sm text-muted-foreground">Current Streak: {data.streak} days</p>
                    </div>
                  )
                }
                return null
              }}
            />
            <Bar dataKey="rate" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
