import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Alert, View } from "react-native";
import { errorMessage } from "@/api/client";
import { userApi } from "@/api/user";
import { Badge, Button, Card, EmptyState, IconButton, Input, Loader, Screen, Sheet, T, TopBar } from "@/components/ui";
import { toast } from "@/lib/toast";
import type { PickupSpot } from "@/types";

const MAX = 3;

export default function PickupSpots() {
  const q = useQuery({ queryKey: ["pickup-spots"], queryFn: userApi.pickupSpots });
  const [editing, setEditing] = useState<PickupSpot | "new" | null>(null);
  const [name, setName] = useState("");
  const [detail, setDetail] = useState("");
  const [saving, setSaving] = useState(false);
  const spots = q.data || [];

  const open = (s: PickupSpot | "new") => {
    setEditing(s);
    setName(s === "new" ? "" : s.name);
    setDetail(s === "new" ? "" : s.detail);
  };
  const save = async () => {
    if (name.trim().length < 2 || detail.trim().length < 2) return toast.error("Add a name and a short detail");
    setSaving(true);
    try {
      if (editing === "new") await userApi.createPickupSpot({ name: name.trim(), detail: detail.trim(), isPrimary: spots.length === 0 });
      else if (editing) await userApi.updatePickupSpot(editing._id, { name: name.trim(), detail: detail.trim() });
      setEditing(null);
      q.refetch();
    } catch (err) {
      toast.error(errorMessage(err));
    } finally {
      setSaving(false);
    }
  };
  const run = async (fn: () => Promise<unknown>, ok: string) => {
    try {
      await fn();
      toast.success(ok);
      q.refetch();
    } catch (err) {
      toast.error(errorMessage(err));
    }
  };

  return (
    <Screen padded={false} scroll header={<TopBar title="Pickup spots" subtitle={`${spots.length}/${MAX} saved`} />}>
      <View style={{ padding: 16, gap: 10 }}>
        <T variant="small" muted>
          Public campus spots where you meet buyers. Your primary spot is preselected when you list.
        </T>
        {q.isLoading ? (
          <Loader full={false} />
        ) : spots.length === 0 ? (
          <EmptyState icon="location-outline" title="No pickup spots yet" message="Add places like the library entrance or main canteen." compact />
        ) : (
          spots.map((s) => (
            <Card key={s._id}>
              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                    <T variant="h3">{s.name}</T>
                    {s.isPrimary ? <Badge label="Primary" tone="accent" /> : null}
                  </View>
                  <T variant="small" muted>
                    {s.detail}
                  </T>
                </View>
                {!s.isPrimary ? <IconButton icon="star-outline" onPress={() => run(() => userApi.setPrimaryPickupSpot(s._id), "Primary spot updated")} accessibilityLabel="Make primary" /> : null}
                <IconButton icon="create-outline" onPress={() => open(s)} accessibilityLabel="Edit" />
                <IconButton
                  icon="trash-outline"
                  onPress={() =>
                    Alert.alert("Delete spot?", s.name, [
                      { text: "Cancel", style: "cancel" },
                      { text: "Delete", style: "destructive", onPress: () => run(() => userApi.deletePickupSpot(s._id), "Spot deleted") },
                    ])
                  }
                  accessibilityLabel="Delete"
                />
              </View>
            </Card>
          ))
        )}
        {spots.length < MAX ? <Button icon="add" title="Add pickup spot" onPress={() => open("new")} /> : null}
      </View>
      <Sheet visible={editing !== null} onClose={() => setEditing(null)} title={editing === "new" ? "New pickup spot" : "Edit pickup spot"}>
        <Input label="Spot name" value={name} onChangeText={setName} maxLength={80} placeholder="e.g. Central Library" />
        <Input label="Detail" value={detail} onChangeText={setDetail} maxLength={180} placeholder="e.g. Ground floor, near the stairs" />
        <Button title="Save" loading={saving} onPress={save} />
      </Sheet>
    </Screen>
  );
}
