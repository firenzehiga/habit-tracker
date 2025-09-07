"use client";

import { ProtectedRoute } from "@/components/auth/protected-route";
import { CategoriesList } from "@/components/categories/categories-list";
import { Navigation } from "@/components/layout/navigation";

export default function CategoriesPage() {
	return (
		<ProtectedRoute>
			<div className="min-h-screen bg-background">
				<Navigation />
				<div className="container mx-auto px-4 py-8">
					<div className="max-w-6xl mx-auto">
						<div className="mb-8">
							<h1 className="text-3xl font-bold text-balance">Categories</h1>
							<p className="text-muted-foreground mt-2">
								Organize your habits into meaningful categories for better
								tracking and insights.
							</p>
						</div>

						<CategoriesList />
					</div>
				</div>
			</div>
		</ProtectedRoute>
	);
}
