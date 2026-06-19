import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const update: { title?: string; favorite?: boolean } = {};
  if (body.title !== undefined) update.title = body.title.trim();
  if (body.favorite !== undefined) update.favorite = body.favorite;

  // Verify ownership via category join
  const { data, error } = await supabase
    .from("items")
    .update(update)
    .eq("id", id)
    .select("*, category:categories!inner(user_id)")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const owned = (data.category as unknown as { user_id: string })?.user_id === user.id;
  if (!owned) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json(data);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Ownership check via RLS — items policy uses category ownership
  const { error } = await supabase
    .from("items")
    .delete()
    .eq("id", id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return new NextResponse(null, { status: 204 });
}
