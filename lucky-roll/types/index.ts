export interface Category {
  id: string;
  user_id: string;
  name: string;
  icon: string;
  created_at: string;
  item_count?: number;
}

export interface Item {
  id: string;
  category_id: string;
  title: string;
  favorite: boolean;
  created_at: string;
}

export interface HistoryEntry {
  id: string;
  user_id: string;
  category_id: string;
  item_id: string;
  rolled_at: string;
  category?: Category;
  item?: Item;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export type ToolName =
  | "add_category"
  | "delete_category"
  | "rename_category"
  | "add_item"
  | "add_items_bulk"
  | "delete_item"
  | "update_item"
  | "list_categories"
  | "list_items";

export interface ToolResult {
  success: boolean;
  message: string;
  data?: unknown;
}
