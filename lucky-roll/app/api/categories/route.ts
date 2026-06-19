import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("categories")
    .select("*, items(count)")
    .order("created_at", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const categories = data.map((cat) => ({
    ...cat,
    item_count: (cat.items as { count: number }[])[0]?.count ?? 0,
    items: undefined,
  }));

  return NextResponse.json(categories);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name, icon } = await req.json();
  if (!name?.trim()) return NextResponse.json({ error: "Naam is verplicht" }, { status: 400 });

  const { data, error } = await supabase
    .from("categories")
    .insert({ user_id: user.id, name: name.trim(), icon: icon ?? "🎲" })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ...data, item_count: 0 }, { status: 201 });
}
