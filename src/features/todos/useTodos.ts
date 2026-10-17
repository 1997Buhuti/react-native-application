/**
 * Declares todo state + actions for the UI.
 * Optimistic local updates keep the list snappy; failures roll back and surface `error`.
 */

import { useCallback, useEffect, useState } from 'react';

import * as todosRepo from './repository';
import type { Todo } from './types';

type TodosState = {
  todos: Todo[];
  loading: boolean;
  error: string | null;
  addTodo: (text: string) => Promise<void>;
  toggleTodo: (id: string) => Promise<void>;
  deleteTodo: (id: string) => Promise<void>;
  refresh: () => Promise<void>;
};

export function useTodos(): TodosState {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    const next = await todosRepo.listTodos();
    setTodos(next);
  }, []);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        const next = await todosRepo.listTodos();
        if (alive) setTodos(next);
      } catch (e) {
        if (alive) setError(e instanceof Error ? e.message : 'Failed to load todos');
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const addTodo = useCallback(async (text: string) => {
    const value = text.trim();
    if (!value) return;

    setError(null);
    try {
      const created = await todosRepo.createTodo(value);
      setTodos((prev) => [created, ...prev]);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to add todo');
    }
  }, []);

  const toggleTodo = useCallback(async (id: string) => {
    const current = todos.find((t) => t.id === id);
    if (!current) return;

    const nextCompleted = !current.completed;
    setError(null);
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: nextCompleted } : t))
    );

    try {
      await todosRepo.setTodoCompleted(id, nextCompleted);
    } catch (e) {
      setTodos((prev) =>
        prev.map((t) => (t.id === id ? { ...t, completed: current.completed } : t))
      );
      setError(e instanceof Error ? e.message : 'Failed to update todo');
    }
  }, [todos]);

  const deleteTodo = useCallback(async (id: string) => {
    const snapshot = todos;
    setError(null);
    setTodos((prev) => prev.filter((t) => t.id !== id));

    try {
      await todosRepo.removeTodo(id);
    } catch (e) {
      setTodos(snapshot);
      setError(e instanceof Error ? e.message : 'Failed to delete todo');
    }
  }, [todos]);

  return { todos, loading, error, addTodo, toggleTodo, deleteTodo, refresh };
}
