import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const inputSchema = z.object({
  identifier: z.string().trim().min(3).max(255),
  password: z.string().min(1).max(200),
});

/**
 * Server-side login by identifier (phone or admin username) OR email.
 * Resolves the email internally via the SECURITY DEFINER RPC using the
 * service-role client so the mapping is never exposed to anonymous clients.
 * Returns session tokens the browser can hand to supabase.auth.setSession().
 */
export const loginWithIdentifier = createServerFn({ method: "POST" })
  .inputValidator((input) => inputSchema.parse(input))
  .handler(async ({ data }) => {
    const generic = { ok: false as const, error: "invalid_credentials" };

    let email: string | null = null;
    if (data.identifier.includes("@")) {
      email = data.identifier;
    } else {
      const { data: resolved, error } = await supabaseAdmin.rpc(
        "resolve_login_email",
        { p_identifier: data.identifier },
      );
      if (error) {
        console.error("loginWithIdentifier: resolve failed", error);
        return generic;
      }
      if (typeof resolved === "string" && resolved.length > 0) email = resolved;
    }
    if (!email) return generic;

    const SUPABASE_URL = process.env.SUPABASE_URL!;
    const SUPABASE_PUBLISHABLE_KEY = process.env.SUPABASE_PUBLISHABLE_KEY!;
    const authClient = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
      auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    });

    const { data: signIn, error: signInErr } = await authClient.auth.signInWithPassword({
      email,
      password: data.password,
    });
    if (signInErr || !signIn.session) return generic;

    return {
      ok: true as const,
      access_token: signIn.session.access_token,
      refresh_token: signIn.session.refresh_token,
    };
  });
