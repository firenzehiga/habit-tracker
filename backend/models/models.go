package models

import (
	"time"
	"gorm.io/gorm"
)

type User struct {
	ID           uint      `json:"id" gorm:"primaryKey"`
	Email        string    `json:"email" gorm:"unique;not null"`
	PasswordHash string    `json:"-" gorm:"not null"`
	CreatedAt    time.Time `json:"created_at"`
	UpdatedAt    time.Time `json:"updated_at"`
	
	// Relationships
	Habits       []Habit       `json:"habits,omitempty" gorm:"foreignKey:UserID"`
	HabitLogs    []HabitLog    `json:"habit_logs,omitempty" gorm:"foreignKey:UserID"`
}

type HabitCategory struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	Name      string    `json:"name" gorm:"not null"`
	Color     string    `json:"color" gorm:"not null"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	
	// Relationships
	Habits    []Habit   `json:"habits,omitempty" gorm:"foreignKey:CategoryID"`
}

type Habit struct {
	ID            uint      `json:"id" gorm:"primaryKey"`
	UserID        uint      `json:"user_id" gorm:"not null"`
	CategoryID    *uint     `json:"category_id"`
	Name          string    `json:"name" gorm:"not null"`
	Description   string    `json:"description"`
	Color         string    `json:"color" gorm:"default:'#6366f1'"`
	IsActive      bool      `json:"is_active" gorm:"default:true"`
	TargetPerDay  int       `json:"target_per_day" gorm:"default:1"`
	StartDate     time.Time `json:"start_date"`
	CreatedAt     time.Time `json:"created_at"`
	UpdatedAt     time.Time `json:"updated_at"`
	
	// Relationships
	User          User          `json:"user,omitempty" gorm:"foreignKey:UserID"`
	Category      *HabitCategory `json:"category,omitempty" gorm:"foreignKey:CategoryID"`
	HabitLogs     []HabitLog    `json:"habit_logs,omitempty" gorm:"foreignKey:HabitID"`
}

type HabitLog struct {
	ID        uint      `json:"id" gorm:"primaryKey"`
	HabitID   uint      `json:"habit_id" gorm:"not null"`
	UserID    uint      `json:"user_id" gorm:"not null"`
	Date      time.Time `json:"date" gorm:"not null"`
	Completed bool      `json:"completed" gorm:"default:false"`
	CreatedAt time.Time `json:"created_at"`
	UpdatedAt time.Time `json:"updated_at"`
	
	// Relationships
	Habit     Habit     `json:"habit,omitempty" gorm:"foreignKey:HabitID"`
	User      User      `json:"user,omitempty" gorm:"foreignKey:UserID"`
}

// BeforeCreate hook for Habit
func (h *Habit) BeforeCreate(tx *gorm.DB) error {
	if h.StartDate.IsZero() {
		h.StartDate = time.Now()
	}
	return nil
}
