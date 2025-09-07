"use client"

import { useState } from "react"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogTrigger } from "@/components/ui/dialog"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { HabitCard } from "./habit-card"
import { HabitForm } from "./habit-form"
import { useHabits, useCategories } from "@/hooks/use-habits"
import { Skeleton } from "@/components/ui/skeleton"

export function HabitsList() {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingHabit, setEditingHabit] = useState(null)

  const { data: habits = [], isLoading: habitsLoading } = useHabits()
  const { data: categories = [] } = useCategories()

  // Filter habits based on search and filters
  const filteredHabits = habits.filter((habit) => {
    const matchesSearch = habit.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === "all" || habit.category_id?.toString() === selectedCategory
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "active" && habit.is_active) ||
      (statusFilter === "inactive" && !habit.is_active)

    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleEdit = (habit) => {
    setEditingHabit(habit)
    setIsFormOpen(true)
  }

  const handleCloseForm = () => {
    setIsFormOpen(false)
    setEditingHabit(null)
  }

  if (habitsLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Your Habits</CardTitle>
            <CardDescription>Manage and track your daily habits</CardDescription>
          </div>
          <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Habit
              </Button>
            </DialogTrigger>
            <HabitForm habit={editingHabit} onClose={handleCloseForm} />
          </Dialog>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 pt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search habits..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
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

          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>

      <CardContent>
        {filteredHabits.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-muted-foreground mb-4">
              {habits.length === 0 ? "No habits yet" : "No habits match your filters"}
            </div>
            {habits.length === 0 && (
              <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Create Your First Habit
                  </Button>
                </DialogTrigger>
                <HabitForm habit={editingHabit} onClose={handleCloseForm} />
              </Dialog>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredHabits.map((habit) => (
              <HabitCard key={habit.id} habit={habit} onEdit={handleEdit} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
