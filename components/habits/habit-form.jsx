"use client"

import { useState, useEffect } from "react"
import { Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useCategories, useCreateHabit, useUpdateHabit } from "@/hooks/use-habits"

const HABIT_COLORS = [
  "#6366f1", // Primary
  "#10b981", // Green
  "#f59e0b", // Yellow
  "#ef4444", // Red
  "#8b5cf6", // Purple
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#84cc16", // Lime
]

export function HabitForm({ habit, onClose }) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    category_id: "",
    color: "#6366f1",
    target_per_day: 1,
  })

  const { data: categories = [] } = useCategories()
  const createHabit = useCreateHabit()
  const updateHabit = useUpdateHabit()

  const isEditing = !!habit
  const isLoading = createHabit.isPending || updateHabit.isPending

  useEffect(() => {
    if (habit) {
      setFormData({
        name: habit.name || "",
        description: habit.description || "",
        category_id: habit.category_id || "",
        color: habit.color || "#6366f1",
        target_per_day: habit.target_per_day || 1,
      })
    }
  }, [habit])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const submitData = {
      ...formData,
      category_id: formData.category_id ? Number.parseInt(formData.category_id) : null,
      target_per_day: Number.parseInt(formData.target_per_day),
    }

    try {
      if (isEditing) {
        await updateHabit.mutateAsync({ id: habit.id, ...submitData })
      } else {
        await createHabit.mutateAsync(submitData)
      }
      onClose()
    } catch (error) {
      // Error handling is done in the mutation hooks
    }
  }

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{isEditing ? "Edit Habit" : "Create New Habit"}</DialogTitle>
        <DialogDescription>
          {isEditing ? "Update your habit details" : "Add a new habit to track your progress"}
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Habit Name</Label>
          <Input
            id="name"
            placeholder="e.g., Morning Exercise"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Describe your habit..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            disabled={isLoading}
            rows={3}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={formData.category_id.toString()}
              onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id.toString()}>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: category.color }} />
                      {category.name}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="target">Target per Day</Label>
            <Input
              id="target"
              type="number"
              min="1"
              max="10"
              value={formData.target_per_day}
              onChange={(e) => setFormData({ ...formData, target_per_day: e.target.value })}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Color</Label>
          <div className="flex gap-2 flex-wrap">
            {HABIT_COLORS.map((color) => (
              <button
                key={color}
                type="button"
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  formData.color === color ? "border-foreground scale-110" : "border-border"
                }`}
                style={{ backgroundColor: color }}
                onClick={() => setFormData({ ...formData, color })}
                disabled={isLoading}
              />
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Update Habit" : "Create Habit"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
