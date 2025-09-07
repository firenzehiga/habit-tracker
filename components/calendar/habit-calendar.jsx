"use client"

import { useState, useMemo } from "react"
import { ChevronLeft, ChevronRight, CalendarIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns"
import { useAllHabitLogs } from "@/hooks/use-habits"

export function HabitCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date())

  const monthStart = startOfMonth(currentDate)
  const monthEnd = endOfMonth(currentDate)
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd })

  const { data: habitLogs = [], isLoading } = useAllHabitLogs(monthStart.toISOString(), monthEnd.toISOString())

  // Group logs by date
  const logsByDate = useMemo(() => {
    const grouped = {}
    habitLogs.forEach((log) => {
      const dateKey = format(new Date(log.date), "yyyy-MM-dd")
      if (!grouped[dateKey]) {
        grouped[dateKey] = []
      }
      if (log.completed) {
        grouped[dateKey].push(log)
      }
    })
    return grouped
  }, [habitLogs])

  const navigateMonth = (direction) => {
    setCurrentDate((prev) => (direction === "prev" ? subMonths(prev, 1) : addMonths(prev, 1)))
  }

  const getCompletionRate = (date) => {
    const dateKey = format(date, "yyyy-MM-dd")
    const completedLogs = logsByDate[dateKey] || []
    const totalHabits = new Set(habitLogs.map((log) => log.habit_id)).size

    if (totalHabits === 0) return 0
    return Math.round((completedLogs.length / totalHabits) * 100)
  }

  const getCompletionColor = (rate) => {
    if (rate === 0) return "bg-muted"
    if (rate < 30) return "bg-red-200 dark:bg-red-900"
    if (rate < 70) return "bg-yellow-200 dark:bg-yellow-900"
    return "bg-green-200 dark:bg-green-900"
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <CalendarIcon className="h-5 w-5" />
            Habit Calendar
          </CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigateMonth("prev")}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-32 text-center">{format(currentDate, "MMMM yyyy")}</span>
            <Button variant="outline" size="sm" onClick={() => navigateMonth("next")}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="text-center py-8 text-muted-foreground">Loading calendar...</div>
        ) : (
          <>
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-2 mb-4">
              {/* Day headers */}
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                <div key={day} className="text-center text-sm font-medium text-muted-foreground p-2">
                  {day}
                </div>
              ))}

              {/* Calendar days */}
              {daysInMonth.map((date) => {
                const completionRate = getCompletionRate(date)
                const isToday = isSameDay(date, new Date())
                const dateKey = format(date, "yyyy-MM-dd")
                const completedHabits = logsByDate[dateKey] || []

                return (
                  <div
                    key={date.toISOString()}
                    className={`
                      relative p-2 text-center text-sm rounded-lg border transition-colors
                      ${isToday ? "border-primary" : "border-border"}
                      ${getCompletionColor(completionRate)}
                      ${!isSameMonth(date, currentDate) ? "opacity-50" : ""}
                    `}
                  >
                    <div className="font-medium">{format(date, "d")}</div>
                    {completedHabits.length > 0 && (
                      <div className="absolute -top-1 -right-1">
                        <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
                          {completedHabits.length}
                        </Badge>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-muted"></div>
                <span>No habits</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-red-200 dark:bg-red-900"></div>
                <span>Low (&lt;30%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-yellow-200 dark:bg-yellow-900"></div>
                <span>Medium (30-70%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-green-200 dark:bg-green-900"></div>
                <span>High (&gt;70%)</span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}
