"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import Link from "next/link";

const isDemoMode = !process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith("http");

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    if (isDemoMode) {
      await new Promise((r) => setTimeout(r, 500));
      toast.success("Demo 模式：注册成功");
      router.push("/onboarding");
      router.refresh();
      return;
    }

    try {
      const { createClient } = await import("@/lib/supabase");
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email, password,
        options: { data: { name } },
      });
      if (error) throw error;
      toast.success("注册成功！请查看邮箱验证链接");
      router.push("/onboarding");
      router.refresh();
    } catch (err: any) {
      toast.error(err.message || "注册失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input placeholder="姓名" value={name} onChange={(e) => setName(e.target.value)} required />
      <Input type="email" placeholder="邮箱" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <Input type="password" placeholder="密码（至少6位）" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} />
      <Button type="submit" className="w-full" disabled={loading}>
        {loading ? "注册中..." : "注册"}
      </Button>
      <p className="text-sm text-center text-muted-foreground">
        已有账号？{" "}
        <Link href="/sign-in" className="text-primary hover:underline">
          登录
        </Link>
      </p>
      {isDemoMode && (
        <p className="text-xs text-center text-muted-foreground bg-muted/50 p-2 rounded">
          Demo 模式：Supabase 未配置，点击注册直接进入应用
        </p>
      )}
    </form>
  );
}
