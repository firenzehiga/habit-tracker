"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import { useToast } from "@/hooks/use-toast";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// Create axios instance with interceptors
const axiosInstance = axios.create({
	baseURL: API_URL,
});

// default caching for queries (2 minutes)
const DEFAULT_STALE_TIME = 1000 * 60 * 2;
// cache time keep data in cache when unused (10 minutes)
const DEFAULT_CACHE_TIME = 1000 * 60 * 10;

// Add request interceptor to include auth token
axiosInstance.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("token");
		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}
		return config;
	},
	(error) => Promise.reject(error)
);

// Add response interceptor to handle auth errors
axiosInstance.interceptors.response.use(
	(response) => response,
	(error) => {
		if (error.response?.status === 401) {
			localStorage.removeItem("token");
			window.location.href = "/auth/login";
		}
		return Promise.reject(error);
	}
);

// Fetch all habits
export function useHabits() {
	return useQuery({
		queryKey: ["habits"],
		queryFn: async () => {
			const response = await axiosInstance.get("/api/habits");
			return response.data.data;
		},
		staleTime: DEFAULT_STALE_TIME,
		cacheTime: DEFAULT_CACHE_TIME,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});
}

// Fetch categories
export function useCategories() {
	return useQuery({
		queryKey: ["categories"],
		queryFn: async () => {
			const response = await axiosInstance.get("/api/categories");
			return response.data.data;
		},
		staleTime: DEFAULT_STALE_TIME,
		cacheTime: DEFAULT_CACHE_TIME,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});
}

// Create habit mutation
export function useCreateHabit() {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	return useMutation({
		mutationFn: async (habitData) => {
			const response = await axiosInstance.post("/api/habits", habitData);
			return response.data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["habits"] });
			toast({
				title: "Success",
				description: "Habit created successfully",
			});
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: error.response?.data?.message || "Failed to create habit",
				variant: "destructive",
			});
		},
	});
}

// Update habit mutation
export function useUpdateHabit() {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	return useMutation({
		mutationFn: async ({ id, ...habitData }) => {
			const response = await axiosInstance.put(`/api/habits/${id}`, habitData);
			return response.data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["habits"] });
			toast({
				title: "Success",
				description: "Habit updated successfully",
			});
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: error.response?.data?.message || "Failed to update habit",
				variant: "destructive",
			});
		},
	});
}

// Delete habit mutation
export function useDeleteHabit() {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	return useMutation({
		mutationFn: async (id) => {
			await axiosInstance.delete(`/api/habits/${id}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["habits"] });
			toast({
				title: "Success",
				description: "Habit deleted successfully",
			});
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: error.response?.data?.message || "Failed to delete habit",
				variant: "destructive",
			});
		},
	});
}

// Toggle habit active status
export function useToggleHabit() {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	return useMutation({
		mutationFn: async (id) => {
			const response = await axiosInstance.patch(`/api/habits/${id}/toggle`);
			return response.data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["habits"] });
			toast({
				title: "Success",
				description: "Habit status updated",
			});
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: error.response?.data?.message || "Failed to toggle habit",
				variant: "destructive",
			});
		},
	});
}

// Create habit log mutation
export function useCreateHabitLog() {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	return useMutation({
		mutationFn: async ({ habitId, date, completed }) => {
			const response = await axiosInstance.post(`/api/habits/${habitId}/log`, {
				date,
				completed,
			});
			return response.data.data;
		},
		onSuccess: () => {
			// Invalidate all related queries to ensure fresh data
			queryClient.invalidateQueries({ queryKey: ["habit-logs"] });
			queryClient.invalidateQueries({ queryKey: ["all-habit-logs"] });
			queryClient.invalidateQueries({ queryKey: ["habit-statistics"] });
			queryClient.invalidateQueries({ queryKey: ["habits"] });

			toast({
				title: "Success",
				description: "Habit logged successfully",
			});
		},
		onError: (error) => {
			toast({
				title: "Error",
				description: error.response?.data?.message || "Failed to log habit",
				variant: "destructive",
			});
		},
	});
}

// Fetch habit logs
export function useHabitLogs(habitId, enabled = true) {
	return useQuery({
		queryKey: ["habit-logs", habitId],
		queryFn: async () => {
			const response = await axiosInstance.get(`/api/habits/${habitId}/logs`);
			return response.data.data;
		},
		enabled: enabled && !!habitId,
		staleTime: DEFAULT_STALE_TIME,
		cacheTime: DEFAULT_CACHE_TIME,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});
}

// Fetch all habit logs for calendar view
export function useAllHabitLogs(startDate, endDate) {
	return useQuery({
		// normalize dates to YYYY-MM-DD to avoid tiny key differences
		queryKey: [
			"all-habit-logs",
			startDate ? new Date(startDate).toISOString().slice(0, 10) : null,
			endDate ? new Date(endDate).toISOString().slice(0, 10) : null,
		],
		queryFn: async () => {
			const { data: habits } = await axiosInstance.get("/api/habits");
			const allLogs = [];

			// parallelize log fetches to avoid serial blocking
			const promises = habits.data.map((habit) =>
				axiosInstance
					.get(`/api/habits/${habit.id}/logs`)
					.then((res) => res.data.data.map((log) => ({ ...log, habit })))
					.catch((err) => {
						console.error(`Failed to fetch logs for habit ${habit.id}:`, err);
						return [];
					})
			);

			const results = await Promise.allSettled(promises);
			for (const r of results) {
				if (r.status === "fulfilled") {
					allLogs.push(...r.value);
				}
			}

			return allLogs.filter((log) => {
				const logDate = new Date(log.date);
				return logDate >= new Date(startDate) && logDate <= new Date(endDate);
			});
		},
		enabled: !!startDate && !!endDate,
		staleTime: DEFAULT_STALE_TIME,
		cacheTime: DEFAULT_CACHE_TIME,
		refetchOnMount: false,
		refetchOnWindowFocus: false,
	});
}

// Category management hooks

// Create category mutation
export function useCreateCategory() {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	return useMutation({
		mutationFn: async (categoryData) => {
			const response = await axiosInstance.post(
				`/api/categories`,
				categoryData
			);
			return response.data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["categories"] });
			toast({
				title: "Success",
				description: "Category created successfully",
			});
		},
		onError: (error) => {
			toast({
				title: "Error",
				description:
					error.response?.data?.message || "Failed to create category",
				variant: "destructive",
			});
		},
	});
}

// Update category mutation
export function useUpdateCategory() {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	return useMutation({
		mutationFn: async ({ id, ...categoryData }) => {
			const response = await axiosInstance.put(
				`/api/categories/${id}`,
				categoryData
			);
			return response.data.data;
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["categories"] });
			queryClient.invalidateQueries({ queryKey: ["habits"] });
			toast({
				title: "Success",
				description: "Category updated successfully",
			});
		},
		onError: (error) => {
			toast({
				title: "Error",
				description:
					error.response?.data?.message || "Failed to update category",
				variant: "destructive",
			});
		},
	});
}

// Delete category mutation
export function useDeleteCategory() {
	const queryClient = useQueryClient();
	const { toast } = useToast();

	return useMutation({
		mutationFn: async (id) => {
			await axiosInstance.delete(`/api/categories/${id}`);
		},
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["categories"] });
			queryClient.invalidateQueries({ queryKey: ["habits"] });
			toast({
				title: "Success",
				description: "Category deleted successfully",
			});
		},
		onError: (error) => {
			toast({
				title: "Error",
				description:
					error.response?.data?.message || "Failed to delete category",
				variant: "destructive",
			});
		},
	});
}
