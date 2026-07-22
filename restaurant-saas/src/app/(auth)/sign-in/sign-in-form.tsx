"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";

const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith("http");

export function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (isDemoMode) {
      await new Promise((r) => setTimeout(r, 500));
      toast.success("Demo 模式：登录成功");
      router.push("/onboarding");
      router.refresh();
      return;
    }

    try {
      const { createClient } = await import("@/lib/supabase");
      const supabase = createClient();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      toast.success("登录成功");
      router.push("/onboarding");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "登录失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        type="email"
        placeholder="邮箱"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
      />
      <Input
        type="password"
        placeholder="密码"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "登录中..." : "登录"}
      </Button>
      <p className="text-sm text-center text-muted-foreground">
        还没有账号？{" "}
        <Link href="/sign-up" className="text-primary hover:underline">
          注册
        </Link>
      </p>
      {isDemoMode && (
        <p className="text-xs text-center text-muted-foreground bg-muted/50 p-2 rounded">
          Demo 模式：Supabase 未配置，点击登录直接进入应用
        </p>
      )}
    </form>
  );
}
