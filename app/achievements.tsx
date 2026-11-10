import { useMutation, useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Text, View } from "react-native";
import { errorMessage } from "@/api/client";
import { badgeApi } from "@/api/user";
import { Avatar, Button, Card, Chip, ErrorState, Loader, Screen, T, TopBar } from "@/components/ui";
import { toast } from "@/lib/toast";
import { useAuthStore } from "@/store/auth";
import { font, useTheme } from "@/theme";
import { formatName } from "@/utils/format";

export default function Achievements() {
  const { c, radius } = useTheme();
  const updateUser = useAuthStore((s) => s.updateUser);
  const me = useAuthStore((s) => s.user);
  const [tab, setTab] = useState<"badges" | "leaderboard">("badges");
  const mine = useQuery({ queryKey: ["badges"], queryFn: badgeApi.mine });
  const catalogue = useQuery({ queryKey: ["badge-config"], queryFn: badgeApi.config, staleTime: 60 * 60_000 });
  const board = useQuery({ queryKey: ["leaderboard"], queryFn: () => badgeApi.leaderboard(20), enabled: tab === "leaderboard" });
  const recompute = useMutation({
    mutationFn: badgeApi.recompute,
    onSuccess: () => {
      mine.refetch().then((r) => r.data && updateUser({ gamification: { level: r.data.level, rank_title: r.data.rank_title, total_xp: r.data.total_xp } }));
      toast.success("Progress refreshed");
    },
    onError: (err) => toast.error(errorMessage(err)),
  });

  if (mine.isLoading) return <Loader />;
  if (mine.isError || !mine.data) return <ErrorState message={errorMessage(mine.error)} onRetry={() => mine.refetch()} />;

  const g = mine.data;
  const earned = new Map(g.badges.map((b) => [b.badge_id, b]));
  const locked = new Map((g.locked_badges || []).map((b) => [b.badge_id, b]));

  return (
    <Screen padded={false} scroll header={<TopBar title="Achievements" />}>
      <View style={{ padding: 16, gap: 14 }}>
        <View style={{ backgroundColor: c.accent, borderRadius: radius.xl, padding: 18, gap: 6 }}>
          <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, ...font.semibold }}>LEVEL {g.level}</Text>
          <Text style={{ color: "#fff", fontSize: 26, ...font.black }}>{g.rank_title}</Text>
          <Text style={{ color: "#fff", fontSize: 14 }}>{g.total_xp} XP</Text>
          <View style={{ height: 8, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.25)", marginTop: 6 }}>
            <View style={{ width: `${Math.min(100, g.progress_percent || 0)}%`, height: 8, borderRadius: 4, backgroundColor: "#fff" }} />
          </View>
          {g.xp_to_next_level != null ? (
            <Text style={{ color: "rgba(255,255,255,0.85)", fontSize: 12.5 }}>
              {g.xp_to_next_level} XP to level {g.next_level}
            </Text>
          ) : null}
        </View>

        <View style={{ flexDirection: "row", gap: 8 }}>
          <Chip label={`Badges · ${g.badges.length}`} selected={tab === "badges"} onPress={() => setTab("badges")} />
          <Chip label="Leaderboard" selected={tab === "leaderboard"} onPress={() => setTab("leaderboard")} />
        </View>

        {tab === "badges" ? (
          <>
            {(catalogue.data || []).map((def) => {
              const got = earned.get(def.id);
              const lock = locked.get(def.id);
              const tierLabel = got?.tier ? def.tiers.find((t) => t.tier === got.tier)?.label : def.tiers[0]?.label;
              return (
                <Card key={def.id} style={{ flexDirection: "row", gap: 12, alignItems: "center", opacity: got ? 1 : 0.65 }}>
                  <Text style={{ fontSize: 30 }}>{def.icon}</Text>
                  <View style={{ flex: 1, gap: 2 }}>
                    <T variant="h3" style={{ fontSize: 15 }}>
                      {def.name}
                      {got?.tier && got.tier !== "special" ? <Text style={{ color: c.gold }}>{`  ${got.tier}`}</Text> : null}
                    </T>
                    <T variant="small" muted>
                      {tierLabel}
                    </T>
                    {!got && lock?.progress ? (
                      <View style={{ height: 5, borderRadius: 3, backgroundColor: c.surfaceAlt, marginTop: 4 }}>
                        <View style={{ width: `${Math.min(100, (lock.progress.current / Math.max(1, lock.progress.required)) * 100)}%`, height: 5, borderRadius: 3, backgroundColor: c.accent }} />
                      </View>
                    ) : null}
                  </View>
                  {got ? <Text style={{ color: c.success, fontSize: 12, ...font.bold }}>EARNED</Text> : null}
                </Card>
              );
            })}
            <Button kind="secondary" icon="refresh" title="Refresh progress" loading={recompute.isPending} onPress={() => recompute.mutate()} />
          </>
        ) : board.isLoading ? (
          <Loader full={false} />
        ) : (
          (board.data || []).map((row: any, i: number) => {
            // Rows carry no user id (privacy); name is the best available match.
            const isMe = Boolean(me?.name) && row.name === me?.name;
            return (
              <Card key={`${row.rank}-${i}`} style={{ flexDirection: "row", alignItems: "center", gap: 12, borderColor: isMe ? c.accent : c.border }}>
                <Text style={{ width: 28, color: i < 3 ? c.gold : c.textMuted, fontSize: 16, ...font.black }}>#{row.rank || i + 1}</Text>
                <Avatar avatar={row.avatar} name={row.name} size={36} />
                <View style={{ flex: 1 }}>
                  <T variant="h3" style={{ fontSize: 15 }} numberOfLines={1}>
                    {formatName(row.name)}
                    {isMe ? " (you)" : ""}
                  </T>
                  <T variant="caption" muted>
                    {row.rank_title || row.gamification?.rank_title} · Lv {row.level ?? row.gamification?.level ?? 1}
                  </T>
                </View>
                <T variant="label">{row.total_xp ?? row.gamification?.total_xp ?? 0} XP</T>
              </Card>
            );
          })
        )}
      </View>
    </Screen>
  );
}
