"use client"

import { useState } from "react"
import { MoreHorizontal, Edit, Trash2, Power, PowerOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useDeleteHabit, useToggleHabit } from "@/hooks/use-habits"

export function HabitCard({ habit, onEdit, onToggleComplete }) {
  const [isCompleted, setIsCompleted] = useState(false)
  const deleteHabit = useDeleteHabit()
  const toggleHabit = useToggleHabit()

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this habit?")) {
      await deleteHabit.mutateAsync(habit.id)
    }
  }

  const handleToggleActive = async () => {
    await toggleHabit.mutateAsync(habit.id)
  }

  const handleToggleComplete = () => {
    setIsCompleted(!isCompleted)
    onToggleComplete?.(habit.id, !isCompleted)
  }

  return (
    <Card className={`transition-all hover:shadow-md ${!habit.is_active ? "opacity-60" : ""}`}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            {/* Completion checkbox */}
            <button
              onClick={handleToggleComplete}
              className={`w-6 h-6 rounded-full border-2 transition-all flex items-center justify-center ${
                isCompleted ? "border-primary bg-primary" : "border-muted-foreground hover:border-primary"
              }`}
              disabled={!habit.is_active}
            >
              {isCompleted && (
                <svg className="w-3 h-3 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>

            {/* Habit info */}
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: habit.color }} />
                <h3 className={`font-medium ${isCompleted ? "line-through text-muted-foreground" : ""}`}>
                  {habit.name}
                </h3>
                {!habit.is_active && (
                  <Badge variant="secondary" className="text-xs">
                    Inactive
                  </Badge>
                )}
              </div>

              {habit.description && <p className="text-sm text-muted-foreground mb-2">{habit.description}</p>}

              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                {habit.category && (
                  <span className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: habit.category.color }} />
                    {habit.category.name}
                  </span>
                )}
                <span>Target: {habit.target_per_day}/day</span>
              </div>
            </div>
          </div>

          {/* Actions menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(habit)}>
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleToggleActive}>
                {habit.is_active ? (
                  <>
                    <PowerOff className="mr-2 h-4 w-4" />
                    Deactivate
                  </>
                ) : (
                  <>
                    <Power className="mr-2 h-4 w-4" />
                    Activate
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
