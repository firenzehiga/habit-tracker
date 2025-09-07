"use client"

import { useQuery } from "@tanstack/react-query"
import { useAllHabitLogs, useHabits } from "./use-habits"
import { format, subDays, startOfWeek, endOfWeek, eachDayOfInterval, parseISO } from "date-fns"

export function useHabitStatistics() {
  const { data: habits = [] } = useHabits()
  const today = new Date()
  const thirtyDaysAgo = subDays(today, 30)

  const { data: logs = [] } = useAllHabitLogs(thirtyDaysAgo.toISOString(), today.toISOString())

  return useQuery({
    queryKey: ["habit-statistics", habits.length, logs.length],
    queryFn: () => {
      const activeHabits = habits.filter((h) => h.is_active)
      const completedLogs = logs.filter((log) => log.completed)

      // Overall statistics
      const totalHabits = activeHabits.length
      const totalCompletions = completedLogs.length
      const uniqueDaysWithLogs = new Set(completedLogs.map((log) => format(parseISO(log.date), "yyyy-MM-dd"))).size

      // Calculate completion rate for last 30 days
      const last30Days = eachDayOfInterval({ start: thirtyDaysAgo, end: today })
      const possibleCompletions = last30Days.length * totalHabits
      const completionRate = possibleCompletions > 0 ? Math.round((totalCompletions / possibleCompletions) * 100) : 0

      // Weekly trend data
      const weeklyData = []
      for (let i = 3; i >= 0; i--) {
        const weekStart = startOfWeek(subDays(today, i * 7))
        const weekEnd = endOfWeek(weekStart)
        const weekLogs = completedLogs.filter((log) => {
          const logDate = parseISO(log.date)
          return logDate >= weekStart && logDate <= weekEnd
        })

        weeklyData.push({
          week: format(weekStart, "MMM d"),
          completions: weekLogs.length,
          rate: totalHabits > 0 ? Math.round((weekLogs.length / (7 * totalHabits)) * 100) : 0,
        })
      }

      // Daily trend for last 7 days
      const dailyData = []
      for (let i = 6; i >= 0; i--) {
        const date = subDays(today, i)
        const dayLogs = completedLogs.filter(
          (log) => format(parseISO(log.date), "yyyy-MM-dd") === format(date, "yyyy-MM-dd"),
        )

        dailyData.push({
          date: format(date, "EEE"),
          completions: dayLogs.length,
          rate: totalHabits > 0 ? Math.round((dayLogs.length / totalHabits) * 100) : 0,
        })
      }

      // Habit performance breakdown
      const habitPerformance = activeHabits
        .map((habit) => {
          const habitLogs = completedLogs.filter((log) => log.habit_id === habit.id)
          const habitDays = new Set(habitLogs.map((log) => format(parseISO(log.date), "yyyy-MM-dd"))).size

          // Calculate current streak
          let currentStreak = 0
          for (let i = 0; i < 30; i++) {
            const checkDate = subDays(today, i)
            const hasLog = habitLogs.some(
              (log) => format(parseISO(log.date), "yyyy-MM-dd") === format(checkDate, "yyyy-MM-dd"),
            )
            if (hasLog) {
              currentStreak++
            } else if (i > 0) {
              break
            }
          }

          return {
            ...habit,
            completions: habitLogs.length,
            completionRate: Math.round((habitDays / 30) * 100),
            currentStreak,
            lastCompleted:
              habitLogs.length > 0 ? format(parseISO(habitLogs[habitLogs.length - 1].date), "MMM d") : "Never",
          }
        })
        .sort((a, b) => b.completionRate - a.completionRate)

      // Category performance
      const categoryStats = {}
      activeHabits.forEach((habit) => {
        if (habit.category) {
          const categoryName = habit.category.name
          if (!categoryStats[categoryName]) {
            categoryStats[categoryName] = {
              name: categoryName,
              color: habit.category.color,
              habits: 0,
              completions: 0,
              totalPossible: 0,
            }
          }

          categoryStats[categoryName].habits++
          categoryStats[categoryName].totalPossible += 30 // last 30 days
          categoryStats[categoryName].completions += completedLogs.filter((log) => log.habit_id === habit.id).length
        }
      })

      const categoryPerformance = Object.values(categoryStats).map((cat) => ({
        ...cat,
        rate: cat.totalPossible > 0 ? Math.round((cat.completions / cat.totalPossible) * 100) : 0,
      }))

      return {
        overview: {
          totalHabits,
          totalCompletions,
          completionRate,
          activeDays: uniqueDaysWithLogs,
          averagePerDay: uniqueDaysWithLogs > 0 ? Math.round(totalCompletions / uniqueDaysWithLogs) : 0,
        },
        trends: {
          weekly: weeklyData,
          daily: dailyData,
        },
        habits: habitPerformance,
        categories: categoryPerformance,
      }
    },
    enabled: habits.length > 0,
  })
}
