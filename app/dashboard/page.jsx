"use client"

import { ProtectedRoute } from "@/components/auth/protected-route"
import { Navigation } from "@/components/layout/navigation"
import { HabitsList } from "@/components/habits/habits-list"
import { DailyTracker } from "@/components/habits/daily-tracker"
import { HabitCalendar } from "@/components/calendar/habit-calendar"
import { useHabits } from "@/hooks/use-habits"
import { useHabitStatistics } from "@/hooks/use-statistics"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart3, Calendar, TrendingUp } from "lucide-react"

export default function DashboardPage() {
  const { data: habits = [] } = useHabits()
  const { data: stats } = useHabitStatistics()

  const activeHabits = habits.filter((h) => h.is_active)
  const totalHabits = activeHabits.length

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <Navigation />

        <div className="container mx-auto px-4 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active Habits</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{totalHabits}</div>
                <p className="text-xs text-muted-foreground">habits to track</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats?.overview?.completionRate || 0}%</div>
                <p className="text-xs text-muted-foreground">last 30 days</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Completions</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{stats?.overview?.totalCompletions || 0}</div>
                <p className="text-xs text-muted-foreground">habits completed</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <DailyTracker />
            <HabitCalendar />
          </div>

          <HabitsList />
        </div>
      </div>
    </ProtectedRoute>
  )
}
