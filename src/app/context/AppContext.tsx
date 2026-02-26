import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { supabase } from "../../lib/supabase";

export type Status = "planned" | "in_progress" | "completed" | "cancelled";
export type Priority = "low" | "medium" | "high";

export interface RoadmapItem {
  id: string;
  title: string;
  description: string;
  status: Status;
  priority: Priority;
  category: string;
  quarter: string;
  startDate: string;
  endDate: string;
}

interface User {
  id: string;
  email: string;
  initial: string;
}

interface Team {
  id: string;
  name: string;
  joinCode: string;
}

interface AppState {
  user: User | null;
  team: Team | null;
  items: RoadmapItem[];
  loading: boolean;
  setUser: (user: User | null) => void;
  setTeam: (team: Team | null) => void;
  addItem: (item: Omit<RoadmapItem, "id">) => Promise<void>;
  updateItem: (id: string, item: Partial<RoadmapItem>) => Promise<void>;
  deleteItem: (id: string) => Promise<void>;
  setLoading: (v: boolean) => void;
  logout: () => Promise<void>;
}

const AppContext = createContext<AppState | null>(null);

function rowToItem(row: Record<string, unknown>): RoadmapItem {
  return {
    id: row.id as string,
    title: row.title as string,
    description: (row.description as string) || "",
    status: row.status as Status,
    priority: row.priority as Priority,
    category: (row.category as string) || "",
    quarter: (row.quarter as string) || "",
    startDate: (row.start_date as string) || "",
    endDate: (row.end_date as string) || "",
  };
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [team, setTeamState] = useState<Team | null>(null);
  const [items, setItems] = useState<RoadmapItem[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchItems = useCallback(async (teamId: string) => {
    setLoading(true);
    const { data } = await supabase
      .from("roadmap_items")
      .select("*")
      .eq("team_id", teamId)
      .order("sort_order", { ascending: true });
    if (data) {
      setItems(data.map(rowToItem));
    }
    setLoading(false);
  }, []);

  const fetchTeamForUser = useCallback(
    async (_userId: string) => {
      const savedTeamId = localStorage.getItem("roadmap_team_id");
      if (!savedTeamId) return;
      const { data } = await supabase
        .from("teams")
        .select("id, name, join_code")
        .eq("id", savedTeamId)
        .single();
      if (data) {
        setTeamState({ id: data.id, name: data.name, joinCode: data.join_code });
        fetchItems(data.id);
      } else {
        localStorage.removeItem("roadmap_team_id");
      }
    },
    [fetchItems]
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setUserState({
          id: session.user.id,
          email: session.user.email!,
          initial: session.user.email!.charAt(0).toUpperCase(),
        });
        fetchTeamForUser(session.user.id);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setUserState({
          id: session.user.id,
          email: session.user.email!,
          initial: session.user.email!.charAt(0).toUpperCase(),
        });
      } else {
        setUserState(null);
        setTeamState(null);
        setItems([]);
        localStorage.removeItem("roadmap_team_id");
      }
    });

    return () => subscription.unsubscribe();
  }, [fetchTeamForUser]);

  const setUser = useCallback((u: User | null) => {
    setUserState(u);
  }, []);

  const setTeam = useCallback(
    (t: Team | null) => {
      setTeamState(t);
      if (t?.id) {
        localStorage.setItem("roadmap_team_id", t.id);
        fetchItems(t.id);
      } else {
        localStorage.removeItem("roadmap_team_id");
        setItems([]);
      }
    },
    [fetchItems]
  );

  const addItem = useCallback(
    async (item: Omit<RoadmapItem, "id">) => {
      if (!team?.id || !user?.id) return;
      const { data } = await supabase
        .from("roadmap_items")
        .insert({
          team_id: team.id,
          title: item.title,
          description: item.description || null,
          status: item.status,
          priority: item.priority,
          category: item.category || null,
          quarter: item.quarter || null,
          start_date: item.startDate || null,
          end_date: item.endDate || null,
          created_by: user.id,
        })
        .select()
        .single();
      if (data) {
        setItems((prev) => [...prev, rowToItem(data)]);
      }
    },
    [team, user]
  );

  const updateItem = useCallback(async (id: string, updates: Partial<RoadmapItem>) => {
    const dbUpdates: Record<string, unknown> = { updated_at: new Date().toISOString() };
    if (updates.title !== undefined) dbUpdates.title = updates.title;
    if (updates.description !== undefined) dbUpdates.description = updates.description || null;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.priority !== undefined) dbUpdates.priority = updates.priority;
    if (updates.category !== undefined) dbUpdates.category = updates.category || null;
    if (updates.quarter !== undefined) dbUpdates.quarter = updates.quarter || null;
    if (updates.startDate !== undefined) dbUpdates.start_date = updates.startDate || null;
    if (updates.endDate !== undefined) dbUpdates.end_date = updates.endDate || null;

    const { error } = await supabase.from("roadmap_items").update(dbUpdates).eq("id", id);
    if (!error) {
      setItems((prev) => prev.map((i) => (i.id === id ? { ...i, ...updates } : i)));
    }
  }, []);

  const deleteItem = useCallback(async (id: string) => {
    const { error } = await supabase.from("roadmap_items").delete().eq("id", id);
    if (!error) {
      setItems((prev) => prev.filter((i) => i.id !== id));
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setUserState(null);
    setTeamState(null);
    setItems([]);
    localStorage.removeItem("roadmap_team_id");
  }, []);

  return (
    <AppContext.Provider
      value={{ user, team, items, loading, setUser, setTeam, addItem, updateItem, deleteItem, setLoading, logout }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within AppProvider");
  return ctx;
}
