import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export type Athlete = {
  id: string;
  scout_id: string;
  name: string;
  sport: string;
  position: string | null;
  age: number | null;
  team: string | null;
  notes: string | null;
  created_at: string;
};

export type AthleteInput = {
  name: string;
  sport: string;
  position?: string;
  age?: number | null;
  team?: string;
  notes?: string;
};

type DeleteContext = { previous: Athlete[] | undefined };

// ── List ──────────────────────────────────────────────────────────────────────

export function useAthletes() {
  const { user } = useAuth();

  return useQuery<Athlete[]>({
    queryKey: ["athletes", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<Athlete[]> => {
      const { data, error } = await supabase
        .from("athletes")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[useAthletes] error:", error.message);
        throw error;
      }

      console.log("[useAthletes] fetched", data?.length ?? 0, "athletes");
      return (data ?? []) as Athlete[];
    },
  });
}

// ── Create ────────────────────────────────────────────────────────────────────

export function useCreateAthlete() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<Athlete, Error, AthleteInput>({
    mutationFn: async (input: AthleteInput): Promise<Athlete> => {
      const { data, error } = await supabase
        .from("athletes")
        .insert({ ...input, scout_id: user!.id })
        .select()
        .single();

      if (error) {
        console.error("[useCreateAthlete] error:", error.message);
        throw error;
      }

      console.log("[useCreateAthlete] created:", data.id);
      return data as Athlete;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["athletes", user?.id] });
      queryClient.invalidateQueries({
        queryKey: ["dashboard-stats", user?.id],
      });
    },
  });
}

// ── Update ────────────────────────────────────────────────────────────────────

export function useUpdateAthlete() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<Athlete, Error, { id: string; input: AthleteInput }>({
    mutationFn: async ({ id, input }): Promise<Athlete> => {
      const { data, error } = await supabase
        .from("athletes")
        .update(input)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error("[useUpdateAthlete] error:", error.message);
        throw error;
      }

      console.log("[useUpdateAthlete] updated:", id);
      return data as Athlete;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["athletes", user?.id] });
    },
  });
}

// ── Delete ────────────────────────────────────────────────────────────────────

export function useDeleteAthlete() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<void, Error, string, DeleteContext>({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase.from("athletes").delete().eq("id", id);

      if (error) {
        console.error("[useDeleteAthlete] error:", error.message);
        throw error;
      }

      console.log("[useDeleteAthlete] deleted:", id);
    },
    onMutate: async (id: string): Promise<DeleteContext> => {
      await queryClient.cancelQueries({ queryKey: ["athletes", user?.id] });
      const previous = queryClient.getQueryData<Athlete[]>([
        "athletes",
        user?.id,
      ]);
      queryClient.setQueryData<Athlete[]>(["athletes", user?.id], (old) =>
        (old ?? []).filter((a) => a.id !== id),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(["athletes", user?.id], context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["athletes", user?.id] });
      queryClient.invalidateQueries({
        queryKey: ["dashboard-stats", user?.id],
      });
    },
  });
}
