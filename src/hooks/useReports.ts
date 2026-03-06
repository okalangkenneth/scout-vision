import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";
import type { ScoutingReport } from "../services/openai";

export type FullReport = {
  id: string;
  athleteId: string;
  athleteName: string;
  sport: string;
  createdAt: string;
  report: ScoutingReport;
};

type RawRow = {
  id: string;
  created_at: string;
  athlete_id: string;
  report: ScoutingReport;
  athletes: { name: string; sport: string } | null;
};

export function useReports() {
  const { user } = useAuth();

  return useQuery<FullReport[]>({
    queryKey: ["reports", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<FullReport[]> => {
      const { data, error } = await supabase
        .from("analysis_reports")
        .select("id, created_at, athlete_id, report, athletes(name, sport)")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("[useReports] error:", error.message);
        throw error;
      }

      console.log("[useReports] fetched", data?.length ?? 0, "reports");
      const rows = (data ?? []) as unknown as RawRow[];
      return rows.map((row) => ({
        id: row.id,
        athleteId: row.athlete_id,
        athleteName: row.athletes?.name ?? "Unknown",
        sport: row.athletes?.sport ?? "Unknown",
        createdAt: row.created_at,
        report: row.report,
      }));
    },
  });
}
