"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/app/contexts/AuthContext";

type Mode = "login" | "forgot";

interface AuthForm {
	username: string;
	password: string;
	email?: string;
}

export default function AdminAuthPage() {
	const router = useRouter();
	const { login, isLoading } = useAuth();
	const [mode, setMode] = useState<Mode>("login");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [form, setForm] = useState<AuthForm>({ username: "", password: "" });
	const [message, setMessage] = useState<string | null>(null);

	function update(field: keyof AuthForm, value: string) {
		setForm((s) => ({ ...s, [field]: value }));
	}

	async function handleLogin(e?: React.FormEvent) {
		e?.preventDefault();
		setIsSubmitting(true);
		setMessage(null);
		try {
			const result = await login(form.username, form.password);
			if (result.success) {
				router.push("/admin");
				return;
			}
			setMessage("Invalid credentials");
		} catch {
			setMessage("Network error");
		} finally {
			setIsSubmitting(false);
		}
	}

	async function handleForgot(e?: React.FormEvent) {
		e?.preventDefault();
		setIsSubmitting(true);
		setMessage(null);
		try {
			const res = await fetch("/api/auth/forgot", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email: form.email || form.username }),
			});
			const data = await res.json();
			if (!res.ok) {
				setMessage(data?.message || "Failed to request password reset");
				setIsSubmitting(false);
				return;
			}
			setMessage("If that email exists, a reset token was generated (in mock data). Check /app/data/mockData.json");
			setMode("login");
		} catch {
			setMessage("Network error");
		} finally {
			setIsSubmitting(false);
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-slate-50">
			<div className="w-full max-w-md p-8 bg-white rounded shadow">
				<h2 className="text-2xl font-semibold mb-4">{mode === "login" ? "Admin Login" : "Forgot password"}</h2>
				{message && <div className="mb-4 text-sm text-red-600">{message}</div>}

				{mode === "login" && (
					<form onSubmit={handleLogin} className="space-y-4">
						<div>
							<Label>Username or Email</Label>
							<Input value={form.username} onChange={(e) => update("username", e.target.value)} />
						</div>
						<div>
							<Label>Password</Label>
							<Input type="password" value={form.password} onChange={(e) => update("password", e.target.value)} />
						</div>
						<div className="flex items-center justify-between">
							<div className="flex gap-2">
								<Button type="submit" disabled={isSubmitting || isLoading}>{isSubmitting ? "Logging in..." : "Login"}</Button>
							</div>
							<div className="text-sm">
								<button type="button" className="text-blue-600 underline" onClick={() => setMode("forgot")}>Forgot?</button>
							</div>
						</div>
						<div className="pt-2 text-sm">
							<span>Provider? </span>
							<a href="/auth" className="text-blue-600 underline">Login or register as provider</a>
						</div>
					</form>
				)}

				{mode === "forgot" && (
					<form onSubmit={handleForgot} className="space-y-4">
						<div>
							<Label>Email (or username)</Label>
							<Input value={form.email} onChange={(e) => update("email", e.target.value)} />
						</div>
						<div className="flex items-center justify-between">
							<Button type="submit" disabled={isSubmitting}>{isSubmitting ? "Sending..." : "Send reset"}</Button>
							<button type="button" className="text-sm text-blue-600 underline" onClick={() => setMode("login")}>Back to login</button>
						</div>
					</form>
				)}
			</div>
		</div>
	);
}


