import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "../contexts/AuthContext";

export type DashboardStats = {
  athleteCount: number;
  videoCount: number;
  reportCount: number;
  plan: string;
};

export type RecentReport = {
  id: string;
  athleteName: string;
  sport: string;
  createdAt: string;
  status: "completed" | "pending";
};

type RawReportRow = {
  id: string;
  created_at: string;
  report: Record<string, unknown>;
  athletes: { name: string; sport: string } | null;
};

export function useDashboardStats() {
  const { user } = useAuth();

  return useQuery<DashboardStats>({
    queryKey: ["dashboard-stats", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<DashboardStats> => {
      const [athleteRes, videoRes, reportRes, subRes] = await Promise.all([
        supabase.from("athletes").select("*", { count: "exact", head: true }),
        supabase.from("videos").select("*", { count: "exact", head: true }),
        supabase
          .from("analysis_reports")
          .select("*", { count: "exact", head: true }),
        supabase
          .from("subscriptions")
          .select("plan")
          .eq("user_id", user!.id)
          .maybeSingle(),
      ]);

      if (athleteRes.error)
        console.error(
          "[useDashboardStats] athletes error:",
          athleteRes.error.message,
        );
      if (videoRes.error)
        console.error(
          "[useDashboardStats] videos error:",
          videoRes.error.message,
        );
      if (reportRes.error)
        console.error(
          "[useDashboardStats] reports error:",
          reportRes.error.message,
        );

      const planRow = subRes.data as { plan: string } | null;

      console.log("[useDashboardStats] stats fetched");
      return {
        athleteCount: athleteRes.count ?? 0,
        videoCount: videoRes.count ?? 0,
        reportCount: reportRes.count ?? 0,
        plan: planRow?.plan ?? "starter",
      };
    },
  });
}

export function useRecentReports() {
  const { user } = useAuth();

  return useQuery<RecentReport[]>({
    queryKey: ["recent-reports", user?.id],
    enabled: !!user,
    queryFn: async (): Promise<RecentReport[]> => {
      const { data, error } = await supabase
        .from("analysis_reports")
        .select("id, created_at, report, athletes(name, sport)")
        .order("created_at", { ascending: false })
        .limit(5);

      if (error) {
        console.error("[useRecentReports] error:", error.message);
        throw error;
      }

      console.log("[useRecentReports] fetched", data?.length ?? 0, "reports");

      const rows = (data ?? []) as RawReportRow[];
      return rows.map((row) => ({
        id: row.id,
        athleteName: row.athletes?.name ?? "Unknown",
        sport: row.athletes?.sport ?? "—",
        createdAt: row.created_at,
        status: Object.keys(row.report).length > 0 ? "completed" : "pending",
      }));
    },
  });
}
