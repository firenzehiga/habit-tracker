"use client"

import { useMemo } from "react"
import { Flame, TrendingUp } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useHabitLogs } from "@/hooks/use-habits"
import { format, subDays, parseISO } from "date-fns"

export function HabitStreak({ habit }) {
  const { data: logs = [] } = useHabitLogs(habit.id)

  const streakData = useMemo(() => {
    if (logs.length === 0) return { currentStreak: 0, longestStreak: 0, recentLogs: [] }

    // Sort logs by date (newest first)
    const sortedLogs = logs.filter((log) => log.completed).sort((a, b) => new Date(b.date) - new Date(a.date))

    // Calculate current streak
    let currentStreak = 0
    const today = new Date()

    for (let i = 0; i < 30; i++) {
      // Check last 30 days
      const checkDate = subDays(today, i)
      const hasLog = sortedLogs.some((log) => {
        const logDate = parseISO(log.date)
        return format(logDate, "yyyy-MM-dd") === format(checkDate, "yyyy-MM-dd")
      })

      if (hasLog) {
        currentStreak++
      } else if (i > 0) {
        // Allow missing today, but break on first gap after
        break
      }
    }

    // Calculate longest streak
    let longestStreak = 0
    let tempStreak = 0
    const allDates = sortedLogs.map((log) => format(parseISO(log.date), "yyyy-MM-dd")).reverse()

    for (let i = 0; i < allDates.length; i++) {
      if (i === 0) {
        tempStreak = 1
      } else {
        const prevDate = new Date(allDates[i - 1])
        const currDate = new Date(allDates[i])
        const dayDiff = Math.abs((currDate - prevDate) / (1000 * 60 * 60 * 24))

        if (dayDiff === 1) {
          tempStreak++
        } else {
          longestStreak = Math.max(longestStreak, tempStreak)
          tempStreak = 1
        }
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak)

    // Get recent 7 days for visualization
    const recentLogs = []
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i)
      const hasLog = sortedLogs.some((log) => {
        const logDate = parseISO(log.date)
        return format(logDate, "yyyy-MM-dd") === format(date, "yyyy-MM-dd")
      })
      recentLogs.push({ date, completed: hasLog })
    }

    return { currentStreak, longestStreak, recentLogs }
  }, [logs])

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg flex items-center gap-2">
          <div className="w-4 h-4 rounded-full" style={{ backgroundColor: habit.color }} />
          {habit.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Streak stats */}
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-2xl font-bold text-primary">{streakData.currentStreak}</span>
            </div>
            <p className="text-xs text-muted-foreground">Current Streak</p>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-2xl font-bold text-primary">{streakData.longestStreak}</span>
            </div>
            <p className="text-xs text-muted-foreground">Best Streak</p>
          </div>
        </div>

        {/* Recent 7 days visualization */}
        <div>
          <p className="text-sm font-medium mb-2">Last 7 Days</p>
          <div className="flex gap-1">
            {streakData.recentLogs.map((day, index) => (
              <div key={index} className="flex-1 text-center">
                <div
                  className={`
                    w-full h-8 rounded-sm border-2 transition-colors
                    ${day.completed ? "bg-green-500 border-green-500" : "bg-muted border-border"}
                  `}
                />
                <p className="text-xs text-muted-foreground mt-1">{format(day.date, "EEE")}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Habit details */}
        <div className="pt-2 border-t border-border">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Target per day:</span>
            <Badge variant="outline">{habit.target_per_day}</Badge>
          </div>
          {habit.category && (
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-muted-foreground">Category:</span>
              <Badge variant="outline" className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: habit.category.color }} />
                {habit.category.name}
              </Badge>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
