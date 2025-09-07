import { LoginForm } from "@/components/auth/login-form"

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">HabitFlow</h1>
          <p className="text-muted-foreground mt-2">Your personal habit tracker</p>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
