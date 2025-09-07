"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { useCreateCategory, useUpdateCategory } from "@/hooks/use-habits"

const CATEGORY_COLORS = [
  "#ef4444", // red
  "#f97316", // orange
  "#eab308", // yellow
  "#22c55e", // green
  "#06b6d4", // cyan
  "#3b82f6", // blue
  "#6366f1", // indigo
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#f59e0b", // amber
]

export function CategoryForm({ category, onClose }) {
  const [name, setName] = useState("")
  const [color, setColor] = useState(CATEGORY_COLORS[0])
  const [description, setDescription] = useState("")

  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory()

  useEffect(() => {
    if (category) {
      setName(category.name || "")
      setColor(category.color || CATEGORY_COLORS[0])
      setDescription(category.description || "")
    } else {
      setName("")
      setColor(CATEGORY_COLORS[0])
      setDescription("")
    }
  }, [category])

  const handleSubmit = async (e) => {
    e.preventDefault()

    const categoryData = {
      name: name.trim(),
      color,
      description: description.trim(),
    }

    try {
      if (category) {
        await updateCategory.mutateAsync({ id: category.id, ...categoryData })
      } else {
        await createCategory.mutateAsync(categoryData)
      }
      onClose()
    } catch (error) {
      console.error("Failed to save category:", error)
    }
  }

  const isLoading = createCategory.isPending || updateCategory.isPending

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>{category ? "Edit Category" : "Create Category"}</DialogTitle>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Category Name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Health, Work, Personal"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Input
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Brief description of this category"
          />
        </div>

        <div className="space-y-2">
          <Label>Color</Label>
          <div className="flex flex-wrap gap-2">
            {CATEGORY_COLORS.map((colorOption) => (
              <button
                key={colorOption}
                type="button"
                onClick={() => setColor(colorOption)}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  color === colorOption
                    ? "border-foreground scale-110"
                    : "border-muted-foreground/20 hover:border-muted-foreground/40"
                }`}
                style={{ backgroundColor: colorOption }}
              />
            ))}
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading || !name.trim()}>
            {isLoading ? "Saving..." : category ? "Update" : "Create"}
          </Button>
        </DialogFooter>
      </form>
    </DialogContent>
  )
}
