package handlers

import (
	"net/http"
	"strconv"
	"time"

	"github.com/gin-gonic/gin"
	"habit-tracker/database"
	"habit-tracker/models"
)

func GetHabits(c *gin.Context) {
	userID, _ := c.Get("userID")
	
	var habits []models.Habit
	if err := database.DB.Where("user_id = ?", userID).Preload("Category").Find(&habits).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   true,
			"message": "Failed to fetch habits",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"error":   false,
		"message": "Habits retrieved successfully",
		"data":    habits,
	})
}

func CreateHabit(c *gin.Context) {
	userID, _ := c.Get("userID")
	
	var habit models.Habit
	if err := c.ShouldBindJSON(&habit); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Invalid request data",
			"details": err.Error(),
		})
		return
	}

	habit.UserID = userID.(uint)
	if habit.StartDate.IsZero() {
		habit.StartDate = time.Now()
	}

	if err := database.DB.Create(&habit).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   true,
			"message": "Failed to create habit",
		})
		return
	}

	// Load the category relationship
	database.DB.Preload("Category").First(&habit, habit.ID)

	c.JSON(http.StatusCreated, gin.H{
		"error":   false,
		"message": "Habit created successfully",
		"data":    habit,
	})
}

func GetHabit(c *gin.Context) {
	userID, _ := c.Get("userID")
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Invalid habit ID",
		})
		return
	}

	var habit models.Habit
	if err := database.DB.Where("id = ? AND user_id = ?", uint(id), userID).Preload("Category").First(&habit).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   true,
			"message": "Habit not found",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"error":   false,
		"message": "Habit retrieved successfully",
		"data":    habit,
	})
}

func UpdateHabit(c *gin.Context) {
	userID, _ := c.Get("userID")
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Invalid habit ID",
		})
		return
	}

	var habit models.Habit
	if err := database.DB.Where("id = ? AND user_id = ?", uint(id), userID).First(&habit).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   true,
			"message": "Habit not found",
		})
		return
	}

	if err := c.ShouldBindJSON(&habit); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Invalid request data",
			"details": err.Error(),
		})
		return
	}

	if err := database.DB.Save(&habit).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   true,
			"message": "Failed to update habit",
		})
		return
	}

	// Load the category relationship
	database.DB.Preload("Category").First(&habit, habit.ID)

	c.JSON(http.StatusOK, gin.H{
		"error":   false,
		"message": "Habit updated successfully",
		"data":    habit,
	})
}

func DeleteHabit(c *gin.Context) {
	userID, _ := c.Get("userID")
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Invalid habit ID",
		})
		return
	}

	// Start transaction
	tx := database.DB.Begin()
	defer func() {
		if r := recover(); r != nil {
			tx.Rollback()
		}
	}()

	// Verify habit exists and belongs to user
	var habit models.Habit
	if err := tx.Where("id = ? AND user_id = ?", uint(id), userID).First(&habit).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusNotFound, gin.H{
			"error":   true,
			"message": "Habit not found",
		})
		return
	}

	// Delete all habit logs first (foreign key constraint)
	if err := tx.Where("habit_id = ?", uint(id)).Delete(&models.HabitLog{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   true,
			"message": "Failed to delete habit logs",
			"details": err.Error(),
		})
		return
	}

	// Delete the habit
	if err := tx.Where("id = ? AND user_id = ?", uint(id), userID).Delete(&models.Habit{}).Error; err != nil {
		tx.Rollback()
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   true,
			"message": "Failed to delete habit",
			"details": err.Error(),
		})
		return
	}

	// Commit transaction
	if err := tx.Commit().Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   true,
			"message": "Failed to commit transaction",
			"details": err.Error(),
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"error":   false,
		"message": "Habit deleted successfully",
	})
}

func ToggleHabit(c *gin.Context) {
	userID, _ := c.Get("userID")
	id, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Invalid habit ID",
		})
		return
	}

	var habit models.Habit
	if err := database.DB.Where("id = ? AND user_id = ?", uint(id), userID).First(&habit).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   true,
			"message": "Habit not found",
		})
		return
	}

	habit.IsActive = !habit.IsActive
	if err := database.DB.Save(&habit).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   true,
			"message": "Failed to toggle habit",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"error":   false,
		"message": "Habit toggled successfully",
		"data":    habit,
	})
}

func CreateHabitLog(c *gin.Context) {
	userID, _ := c.Get("userID")
	habitID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Invalid habit ID",
		})
		return
	}

	// Verify habit belongs to user
	var habit models.Habit
	if err := database.DB.Where("id = ? AND user_id = ?", uint(habitID), userID).First(&habit).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   true,
			"message": "Habit not found",
		})
		return
	}

	var habitLog models.HabitLog
	if err := c.ShouldBindJSON(&habitLog); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Invalid request data",
			"details": err.Error(),
		})
		return
	}

	habitLog.HabitID = uint(habitID)
	habitLog.UserID = userID.(uint)
	if habitLog.Date.IsZero() {
		habitLog.Date = time.Now()
	}

	if err := database.DB.Create(&habitLog).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   true,
			"message": "Failed to create habit log",
		})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"error":   false,
		"message": "Habit log created successfully",
		"data":    habitLog,
	})
}

func GetHabitLogs(c *gin.Context) {
	userID, _ := c.Get("userID")
	habitID, err := strconv.ParseUint(c.Param("id"), 10, 32)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error":   true,
			"message": "Invalid habit ID",
		})
		return
	}

	// Verify habit belongs to user
	var habit models.Habit
	if err := database.DB.Where("id = ? AND user_id = ?", uint(habitID), userID).First(&habit).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error":   true,
			"message": "Habit not found",
		})
		return
	}

	var habitLogs []models.HabitLog
	if err := database.DB.Where("habit_id = ? AND user_id = ?", uint(habitID), userID).Order("date DESC").Find(&habitLogs).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error":   true,
			"message": "Failed to fetch habit logs",
		})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"error":   false,
		"message": "Habit logs retrieved successfully",
		"data":    habitLogs,
	})
}
