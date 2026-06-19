import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("history")
    .select(`
      id, rolled_at,
      category:categories(id, name, icon),
      item:items(id, title, favorite)
    `)
    .eq("user_id", user.id)
    .order("rolled_at", { ascending: false })
    .limit(20);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data);
}

export async function POST(req: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { category_id, item_id } = await req.json();
  if (!category_id || !item_id) {
    return NextResponse.json({ error: "category_id en item_id zijn verplicht" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("history")
    .insert({ user_id: user.id, category_id, item_id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
