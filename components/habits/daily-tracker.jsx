"use client"

import { useState, useMemo } from "react"
import { CheckCircle2, Circle, Calendar, Target } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { format, isToday } from "date-fns"
import { useHabits, useCreateHabitLog, useAllHabitLogs } from "@/hooks/use-habits"

export function DailyTracker() {
  const [selectedDate, setSelectedDate] = useState(new Date())
  const { data: habits = [] } = useHabits()
  const createHabitLog = useCreateHabitLog()

  const dateString = format(selectedDate, "yyyy-MM-dd")
  const { data: todayLogs = [] } = useAllHabitLogs(dateString, dateString)

  // Get active habits and their completion status for selected date
  const activeHabits = habits.filter((h) => h.is_active)

  const habitsWithStatus = useMemo(() => {
    return activeHabits.map((habit) => {
      const completedLog = todayLogs.find(
        (log) => log.habit_id === habit.id && format(new Date(log.date), "yyyy-MM-dd") === dateString && log.completed,
      )

      return {
        ...habit,
        isCompleted: !!completedLog,
        logId: completedLog?.id,
      }
    })
  }, [activeHabits, todayLogs, dateString])

  const completedCount = habitsWithStatus.filter((h) => h.isCompleted).length
  const totalCount = habitsWithStatus.length
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const handleToggleHabit = async (habit) => {
    try {
      await createHabitLog.mutateAsync({
        habitId: habit.id,
        date: selectedDate.toISOString(),
        completed: !habit.isCompleted,
      })
    } catch (error) {
      console.error("Failed to toggle habit:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Daily Tracker
            </CardTitle>
            <CardDescription>
              {isToday(selectedDate) ? "Track today's habits" : `Habits for ${format(selectedDate, "MMM d, yyyy")}`}
            </CardDescription>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-primary">
              {completedCount}/{totalCount}
            </div>
            <div className="text-xs text-muted-foreground">completed</div>
          </div>
        </div>

        {/* Progress bar */}
        {totalCount > 0 && (
          <div className="space-y-2">
            <Progress value={completionPercentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{completionPercentage}% complete</span>
              <span>{totalCount - completedCount} remaining</span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent>
        {totalCount === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No active habits to track</p>
            <p className="text-sm">Create some habits to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {habitsWithStatus.map((habit) => (
              <div
                key={habit.id}
                className={`
                  flex items-center justify-between p-4 rounded-lg border transition-all
                  ${habit.isCompleted ? "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800" : "bg-card border-border hover:bg-accent/50"}
                `}
              >
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="p-0 h-auto"
                    onClick={() => handleToggleHabit(habit)}
                    disabled={createHabitLog.isPending}
                  >
                    {habit.isCompleted ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600" />
                    ) : (
                      <Circle className="h-6 w-6 text-muted-foreground hover:text-primary" />
                    )}
                  </Button>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: habit.color }} />
                      <h3 className={`font-medium ${habit.isCompleted ? "line-through text-muted-foreground" : ""}`}>
                        {habit.name}
                      </h3>
                    </div>

                    {habit.description && <p className="text-sm text-muted-foreground">{habit.description}</p>}

                    <div className="flex items-center gap-3 mt-2">
                      {habit.category && (
                        <Badge variant="outline" className="text-xs">
                          {habit.category.name}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">Target: {habit.target_per_day}/day</span>
                    </div>
                  </div>
                </div>

                {habit.isCompleted && (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
                  >
                    Completed
                  </Badge>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Quick stats */}
        {totalCount > 0 && (
          <div className="mt-6 pt-4 border-t border-border">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-lg font-semibold text-primary">{completedCount}</div>
                <div className="text-xs text-muted-foreground">Completed</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-muted-foreground">{totalCount - completedCount}</div>
                <div className="text-xs text-muted-foreground">Remaining</div>
              </div>
              <div>
                <div className="text-lg font-semibold text-primary">{completionPercentage}%</div>
                <div className="text-xs text-muted-foreground">Success Rate</div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
