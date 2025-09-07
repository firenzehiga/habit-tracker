package database

import (
	"fmt"
	"log"
	"os"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"habit-tracker/models"
)

var DB *gorm.DB

func InitDB() {
	var err error
	
	dsn := fmt.Sprintf(
		"%s:%s@tcp(%s:%s)/%s?charset=utf8mb4&parseTime=True&loc=Local",
		os.Getenv("DB_USER"),
		os.Getenv("DB_PASSWORD"),
		os.Getenv("DB_HOST"),
		os.Getenv("DB_PORT"),
		os.Getenv("DB_NAME"),
	)

	DB, err = gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	// Auto migrate the schema
	err = DB.AutoMigrate(
		&models.User{},
		&models.HabitCategory{},
		&models.Habit{},
		&models.HabitLog{},
	)
	if err != nil {
		log.Fatal("Failed to migrate database:", err)
	}

	// Seed default categories
	seedCategories()

	log.Println("Database connected and migrated successfully")
}

func seedCategories() {
	var count int64
	DB.Model(&models.HabitCategory{}).Count(&count)
	
	if count == 0 {
		categories := []models.HabitCategory{
			{Name: "Health", Color: "#10b981"},
			{Name: "Productivity", Color: "#6366f1"},
			{Name: "Learning", Color: "#f59e0b"},
			{Name: "Mindfulness", Color: "#8b5cf6"},
		}
		
		for _, category := range categories {
			DB.Create(&category)
		}
		
		log.Println("Default categories seeded")
	}
}
