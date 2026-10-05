import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(6),
  island: z.string().default(""),
});

export const createInvestigatorAccount = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => schema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    const { data: created, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: data.email,
      password: data.password,
      email_confirm: true,
    });
    if (authError || !created.user) {
      return { ok: false as const, message: authError?.message ?? "Création du compte impossible" };
    }

    const { error: rowError } = await supabaseAdmin
      .from("investigators")
      .insert({ name: data.name, email: data.email, island: data.island, user_id: created.user.id });

    if (rowError) {
      await supabaseAdmin.auth.admin.deleteUser(created.user.id);
      return { ok: false as const, message: rowError.message };
    }

    return { ok: true as const };
  });

const passwordSchema = z.object({
  userId: z.string().uuid(),
  password: z.string().min(6),
});

export const updateInvestigatorPassword = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((data: unknown) => passwordSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { error } = await supabaseAdmin.auth.admin.updateUserById(data.userId, { password: data.password });
    if (error) return { ok: false as const, message: error.message };
    return { ok: true as const };
  });
