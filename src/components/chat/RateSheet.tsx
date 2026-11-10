import { Icon } from "@/components/ui/Icon";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { Pressable, View } from "react-native";
import { errorMessage } from "@/api/client";
import { reviewApi } from "@/api/user";
import { Button, Input, Sheet } from "@/components/ui";
import { toast } from "@/lib/toast";
import { useTheme } from "@/theme";

/** Buyer rates the seller of a completed deal (POST /api/reviews, once). */
export function RateSheet({ visible, onClose, conversationId, onDone }: { visible: boolean; onClose: () => void; conversationId: string; onDone?: () => void }) {
  const { c } = useTheme();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const send = useMutation({
    mutationFn: () => reviewApi.rateSeller(conversationId, rating, comment.trim()),
    onSuccess: () => {
      toast.success("Thanks for rating!");
      onDone?.();
      onClose();
    },
    onError: (err) => toast.error(errorMessage(err)),
  });
  return (
    <Sheet visible={visible} onClose={onClose} title="Rate the seller">
      <View style={{ flexDirection: "row", justifyContent: "center", gap: 10, marginVertical: 10 }}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => setRating(n)} hitSlop={6} accessibilityLabel={`${n} stars`}>
            <Icon name={n <= rating ? "star" : "star-outline"} size={34} color={n <= rating ? c.gold : c.textFaint} />
          </Pressable>
        ))}
      </View>
      <Input label="Comment (optional)" multiline value={comment} onChangeText={setComment} maxLength={300} />
      <Button title="Submit rating" disabled={!rating} loading={send.isPending} onPress={() => send.mutate()} />
    </Sheet>
  );
}
