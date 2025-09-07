package main

import (
	"log"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"habit-tracker/database"
	"habit-tracker/handlers"
	"habit-tracker/middleware"
)

func main() {
	// Load environment variables
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	// Initialize database
	database.InitDB()

	// Setup Gin router
	r := gin.Default()

	// CORS middleware
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowCredentials: true,
	}))

	// Public routes
	auth := r.Group("/api/auth")
	{
		auth.POST("/register", handlers.Register)
		auth.POST("/login", handlers.Login)
	}

	// Protected routes
	api := r.Group("/api")
	api.Use(middleware.AuthMiddleware())
	{
		// User profile
		api.GET("/auth/profile", handlers.GetProfile)

		// Categories
		api.GET("/categories", handlers.GetCategories)
		api.POST("/categories", handlers.CreateCategory)
		api.PUT("/categories/:id", handlers.UpdateCategory)
		api.DELETE("/categories/:id", handlers.DeleteCategory)

		// Habits
		api.GET("/habits", handlers.GetHabits)
		api.POST("/habits", handlers.CreateHabit)
		api.GET("/habits/:id", handlers.GetHabit)
		api.PUT("/habits/:id", handlers.UpdateHabit)
		api.DELETE("/habits/:id", handlers.DeleteHabit)
		api.PATCH("/habits/:id/toggle", handlers.ToggleHabit)

		// Habit logs
		api.POST("/habits/:id/log", handlers.CreateHabitLog)
		api.GET("/habits/:id/logs", handlers.GetHabitLogs)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server starting on port %s", port)
	r.Run(":" + port)
}
