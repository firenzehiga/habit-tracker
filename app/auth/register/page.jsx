import { RegisterForm } from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">HabitFlow</h1>
          <p className="text-muted-foreground mt-2">Your personal habit tracker</p>
        </div>
        <RegisterForm />
      </div>
    </div>
  )
}
