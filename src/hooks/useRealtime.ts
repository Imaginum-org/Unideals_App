import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { AppState } from "react-native";
import { chatApi, normalizeNotification, notificationApi } from "@/api/chat";
import { acquireSocket, reconnectSocket, releaseSocket } from "@/lib/socket";
import { toast } from "@/lib/toast";
import { useIsLoggedIn } from "@/store/auth";
import type { AppNotification } from "@/types";

export const NOTIFICATIONS_KEY = ["notifications"];
export const UNREAD_CHAT_KEY = ["chat-unread"];

/**
 * App-wide realtime wiring, mounted once in the root layout while logged in:
 *  - `notification:new` → prepend to the inbox cache + toast
 *  - `conversation:updated` / `message:new` → refresh chat badge + list
 *  - foreground → reconnect socket and re-sync (like the web's visibilitychange)
 */
export const useRealtimeBridge = () => {
  const loggedIn = useIsLoggedIn();
  const qc = useQueryClient();

  useEffect(() => {
    if (!loggedIn) return undefined;
    const socket = acquireSocket();

    const onNotification = (raw: Record<string, any>) => {
      if (!raw) return;
      const item = normalizeNotification({ ...raw, unread: true });
      qc.setQueryData<AppNotification[]>(NOTIFICATIONS_KEY, (cur = []) =>
        cur.some((n) => n.id === item.id) ? cur : [item, ...cur].slice(0, 100),
      );
      toast(item.title);
    };
    const onChatActivity = () => {
      qc.invalidateQueries({ queryKey: UNREAD_CHAT_KEY });
      qc.invalidateQueries({ queryKey: ["conversations"] });
    };

    socket.on("notification:new", onNotification);
    socket.on("conversation:updated", onChatActivity);
    socket.on("message:new", onChatActivity);

    let lastSync = Date.now();
    const sub = AppState.addEventListener("change", (state) => {
      if (state !== "active") return;
      reconnectSocket();
      if (Date.now() - lastSync > 30_000) {
        lastSync = Date.now();
        qc.invalidateQueries({ queryKey: NOTIFICATIONS_KEY });
        qc.invalidateQueries({ queryKey: UNREAD_CHAT_KEY });
      }
    });

    return () => {
      sub.remove();
      socket.off("notification:new", onNotification);
      socket.off("conversation:updated", onChatActivity);
      socket.off("message:new", onChatActivity);
      releaseSocket(socket);
    };
  }, [loggedIn, qc]);
};

export const useNotifications = () => {
  const loggedIn = useIsLoggedIn();
  const q = useQuery({ queryKey: NOTIFICATIONS_KEY, queryFn: notificationApi.list, enabled: loggedIn, staleTime: 30_000 });
  const items = loggedIn ? q.data || [] : [];
  return { ...q, items, unreadCount: items.filter((n) => n.unread).length };
};

export const useChatUnread = () => {
  const loggedIn = useIsLoggedIn();
  const q = useQuery({
    queryKey: UNREAD_CHAT_KEY,
    queryFn: chatApi.unreadCount,
    enabled: loggedIn,
    refetchInterval: 45_000, // same cadence as the website's shared poller
    staleTime: 15_000,
  });
  return loggedIn ? q.data || 0 : 0;
};
