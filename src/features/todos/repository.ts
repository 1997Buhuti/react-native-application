/**
 * Persistence API for todos — the only place that talks to Supabase for this feature.
 * Screens and hooks call these named operations; they never touch `supabase` directly.
 */

import { supabase } from '../../lib/supabase/client';
import type { TodoRow } from '../../lib/supabase/database.types';

import type { Todo } from './types';

const toTodo = (row: TodoRow): Todo => ({
  id: row.id,
  text: row.text,
  completed: row.completed,
  createdAt: row.created_at,
});

const throwIfError = (error: { message: string } | null) => {
  if (error) throw new Error(error.message);
};

/** Newest first. */
export async function listTodos(): Promise<Todo[]> {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
    .order('created_at', { ascending: false });

  throwIfError(error);
  return (data ?? []).map(toTodo);
}

export async function createTodo(text: string): Promise<Todo> {
  const { data, error } = await supabase
    .from('todos')
    .insert({ text })
    .select('*')
    .single();

  throwIfError(error);
  if (!data) throw new Error('Todo was not returned after insert');
  return toTodo(data);
}

export async function setTodoCompleted(id: string, completed: boolean): Promise<Todo> {
  const { data, error } = await supabase
    .from('todos')
    .update({ completed })
    .eq('id', id)
    .select('*')
    .single();

  throwIfError(error);
  if (!data) throw new Error('Todo was not returned after update');
  return toTodo(data);
}

export async function removeTodo(id: string): Promise<void> {
  const { error } = await supabase.from('todos').delete().eq('id', id);
  throwIfError(error);
}
