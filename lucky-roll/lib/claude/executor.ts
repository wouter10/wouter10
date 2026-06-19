import type { SupabaseClient } from "@supabase/supabase-js";

export interface ExecuteResult {
  content: string;
  mutated: boolean;
}

/**
 * Voert één tool-aanroep uit tegen Supabase. De client is geauthenticeerd
 * als de ingelogde gebruiker, dus RLS beschermt alle data. user_id wordt
 * expliciet meegegeven waar de insert-policy dat vereist.
 */
export async function executeTool(
  name: string,
  input: Record<string, unknown>,
  supabase: SupabaseClient,
  userId: string
): Promise<ExecuteResult> {
  try {
    switch (name) {
      case "list_categories": {
        const { data, error } = await supabase
          .from("categories")
          .select("id, name, icon, items(count)")
          .order("created_at", { ascending: true });
        if (error) throw error;
        const cats = data.map((c) => ({
          id: c.id,
          name: c.name,
          icon: c.icon,
          item_count: (c.items as { count: number }[])[0]?.count ?? 0,
        }));
        return { content: JSON.stringify(cats), mutated: false };
      }

      case "list_items": {
        const { data, error } = await supabase
          .from("items")
          .select("id, title, favorite")
          .eq("category_id", input.category_id as string)
          .order("created_at", { ascending: true });
        if (error) throw error;
        return { content: JSON.stringify(data), mutated: false };
      }

      case "add_category": {
        const { data, error } = await supabase
          .from("categories")
          .insert({
            user_id: userId,
            name: (input.name as string).trim(),
            icon: (input.icon as string) ?? "🎲",
          })
          .select()
          .single();
        if (error) throw error;
        return {
          content: `Categorie "${data.name}" aangemaakt (id: ${data.id}).`,
          mutated: true,
        };
      }

      case "rename_category": {
        const update: { name?: string; icon?: string } = {};
        if (input.name !== undefined) update.name = (input.name as string).trim();
        if (input.icon !== undefined) update.icon = input.icon as string;
        const { data, error } = await supabase
          .from("categories")
          .update(update)
          .eq("id", input.category_id as string)
          .eq("user_id", userId)
          .select()
          .single();
        if (error) throw error;
        return { content: `Categorie bijgewerkt naar "${data.name}".`, mutated: true };
      }

      case "delete_category": {
        const { error } = await supabase
          .from("categories")
          .delete()
          .eq("id", input.category_id as string)
          .eq("user_id", userId);
        if (error) throw error;
        return { content: "Categorie verwijderd.", mutated: true };
      }

      case "add_item": {
        const { data, error } = await supabase
          .from("items")
          .insert({
            category_id: input.category_id as string,
            title: (input.title as string).trim(),
          })
          .select()
          .single();
        if (error) throw error;
        return { content: `Item "${data.title}" toegevoegd.`, mutated: true };
      }

      case "add_items_bulk": {
        const titles = (input.titles as string[])
          .map((t) => t.trim())
          .filter(Boolean);
        if (titles.length === 0) {
          return { content: "Geen geldige items om toe te voegen.", mutated: false };
        }
        const rows = titles.map((title) => ({
          category_id: input.category_id as string,
          title,
        }));
        const { data, error } = await supabase.from("items").insert(rows).select();
        if (error) throw error;
        return {
          content: `${data.length} items toegevoegd: ${data.map((d) => d.title).join(", ")}.`,
          mutated: true,
        };
      }

      case "delete_item": {
        const { error } = await supabase
          .from("items")
          .delete()
          .eq("id", input.item_id as string);
        if (error) throw error;
        return { content: "Item verwijderd.", mutated: true };
      }

      case "update_item": {
        const update: { title?: string; favorite?: boolean } = {};
        if (input.title !== undefined) update.title = (input.title as string).trim();
        if (input.favorite !== undefined) update.favorite = input.favorite as boolean;
        const { data, error } = await supabase
          .from("items")
          .update(update)
          .eq("id", input.item_id as string)
          .select()
          .single();
        if (error) throw error;
        return { content: `Item "${data.title}" bijgewerkt.`, mutated: true };
      }

      default:
        return { content: `Onbekende tool: ${name}`, mutated: false };
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "Onbekende fout";
    return { content: `Fout bij uitvoeren van ${name}: ${message}`, mutated: false };
  }
}
