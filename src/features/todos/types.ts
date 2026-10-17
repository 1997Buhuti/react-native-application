/** App-facing todo shape (matches the Supabase `todos` row). */
export type Todo = {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
};
