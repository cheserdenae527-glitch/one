import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { StoreInfo } from "@/types";

export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          );
        },
      },
    }
  );
}

export async function getStoreInfo(merchantId: string): Promise<StoreInfo | null> {
  const supabase = await createServerSupabase();
  const { data } = await supabase
    .from("stores")
    .select("*")
    .eq("id", merchantId)
    .single();
  return data as StoreInfo | null;
}
