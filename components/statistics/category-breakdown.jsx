"use client"

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useHabitStatistics } from "@/hooks/use-statistics"
import { Skeleton } from "@/components/ui/skeleton"

export function CategoryBreakdown() {
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

  if (!stats || stats.categories.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Category Performance</CardTitle>
          <CardDescription>Completion rates by habit category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">No category data available</div>
        </CardContent>
      </Card>
    )
  }

  const chartData = stats.categories.map((category, index) => ({
    ...category,
    fill: category.color,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Category Performance</CardTitle>
        <CardDescription>Completion rates by habit category over the last 30 days</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Pie Chart */}
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="completions"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-background border border-border rounded-lg p-3 shadow-lg">
                          <p className="font-medium">{data.name}</p>
                          <p className="text-sm text-muted-foreground">Completions: {data.completions}</p>
                          <p className="text-sm text-muted-foreground">Rate: {data.rate}%</p>
                          <p className="text-sm text-muted-foreground">Habits: {data.habits}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Category List */}
          <div className="space-y-4">
            {chartData.map((category) => (
              <div
                key={category.name}
                className="flex items-center justify-between p-3 rounded-lg border border-border"
              >
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 rounded-full" style={{ backgroundColor: category.color }} />
                  <div>
                    <p className="font-medium">{category.name}</p>
                    <p className="text-sm text-muted-foreground">{category.habits} habits</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="outline">{category.rate}%</Badge>
                  <p className="text-xs text-muted-foreground mt-1">{category.completions} completions</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
