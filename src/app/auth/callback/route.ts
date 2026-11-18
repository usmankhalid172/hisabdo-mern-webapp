import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  if (code) {
    const supabase = createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (!userError && user?.email_confirmed_at) {
        return NextResponse.redirect(`${origin}${next}`);
      }

      const verifyUrl = new URL("/verify-email", origin);
      if (user?.email) verifyUrl.searchParams.set("email", user.email);
      return NextResponse.redirect(verifyUrl);
    }
  }

  const verifyUrl = new URL("/verify-email", origin);
  verifyUrl.searchParams.set("error", "verification_failed");
  return NextResponse.redirect(verifyUrl);
}