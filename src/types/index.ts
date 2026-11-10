// Shapes returned by the shared Unideals backend (see backend/src/services).
// Kept deliberately loose: the API is the source of truth and the website
// tolerates missing fields everywhere, so the app does too.

export type ImageRef = { url: string; fileId?: string; _id?: string };
export type Avatar = { url?: string; fileId?: string } | string | null | undefined;

export type Tier = "base_user" | "pro" | "pro_plus" | string;

export type Campus = {
  _id: string;
  slug: string;
  name: string;
  short_name?: string;
  city?: string;
  is_active?: boolean;
};

export type User = {
  _id: string;
  id?: string;
  name: string;
  email: string;
  avatar?: Avatar;
  role?: "user" | "admin" | "support" | string;
  status?: string;
  subscription?: Tier;
  gender?: "female" | "male" | null;
  genderUpdatedAt?: string | null;
  campus_id?: Campus | string | null;
  is_email_verified?: boolean;
  mobile?: string | number | null;
  createdAt?: string;
  chat_settings?: Record<string, unknown>;
  gamification?: { level?: number; rank_title?: string; total_xp?: number };
  rating?: { avg?: number; count?: number };
};

export type Seller = {
  _id: string;
  name: string;
  avatar?: Avatar;
  subscription?: Tier;
  role?: string;
  createdAt?: string;
  is_email_verified?: boolean;
  gamification?: { level?: number; rank_title?: string };
  rating?: { avg?: number; count?: number };
};

export type Product = {
  _id: string;
  slug?: string;
  title: string;
  description?: string;
  category: string;
  condition?: string;
  images: ImageRef[];
  selling_price: number;
  original_price?: number;
  quantity?: number;
  is_negotiable?: boolean;
  payment_preference?: "cash" | "upi" | "both" | string;
  attributes?: {
    brand?: string;
    color?: string;
    usage_duration?: string;
    purchase_date?: string | null;
  };
  pickup_address_snapshot?: { address_line?: string; city?: string };
  status?: "listed" | "draft" | "sold" | "unlisted" | "blocked" | string;
  is_boosted?: boolean;
  boost_expires_at?: string;
  boost_tier?: string;
  hot_until?: string;
  views_count?: number;
  isGirlsOnly?: boolean;
  createdAt?: string;
  updatedAt?: string;
  // feed rows
  seller?: Seller;
  // detail rows
  seller_id?: Seller | string;
  campus_id?: Campus | string;
  reservation?: { reserved: boolean; buyerId: string | null };
  seller_stats?: { active_listings?: number | null };
  is_deleted?: boolean;
};

export type Pagination = { total: number; page: number; limit: number; totalPages: number };

export type FeedResponse = {
  success: boolean;
  data: Product[];
  pagination: Pagination;
  filterMeta?: { price: { min: number; max: number } };
};

export type PickupSpot = { _id: string; name: string; detail: string; isPrimary?: boolean };

export type DealStatus =
  | "negotiating"
  | "offer_accepted"
  | "deal_confirmed"
  | "pickup_scheduled"
  | "payment_confirmed"
  | "completed"
  | "cancelled";

export type Offer = {
  _id?: string;
  amount: number;
  offered_by?: string;
  offered_by_role?: "buyer" | "seller" | string;
  message_id?: string;
  status?: "pending" | "accepted" | "declined" | "countered" | "expired" | string;
  created_at?: string;
};

export type Deal = {
  _id: string;
  conversation_id: string;
  status: DealStatus;
  original_price?: number;
  current_price?: number;
  offer_history?: Offer[];
  pickup?: { scheduled_date?: string; location?: { address_line?: string; city?: string } };
  payment_confirmed?: { is_confirmed?: boolean; confirmed_at?: string };
  item_received?: { is_confirmed?: boolean; confirmed_at?: string };
  completed_at?: string;
  cancelled_at?: string;
  cancellation_reason?: string;
};

export type Party = { _id: string; name: string; avatar?: Avatar; subscription?: Tier; role?: string };

export type ConversationRow = {
  _id: string;
  role: "buying" | "selling";
  otherParty: Party | null;
  product: {
    _id?: string;
    title?: string;
    selling_price?: number;
    images?: ImageRef[];
    status?: string;
    is_negotiable?: boolean;
    pickup_address_snapshot?: { address_line?: string; city?: string };
  };
  last_message?: string;
  last_message_type?: string;
  last_activity_at?: string;
  unread: number;
  dealStatus: DealStatus;
  dealPrice?: number;
};

export type ConversationDetail = {
  _id: string;
  role: "buying" | "selling" | null;
  otherParty: Party | null;
  product_id?: {
    _id: string;
    title?: string;
    selling_price?: number;
    images?: ImageRef[];
    status?: string;
    is_negotiable?: boolean;
    pickup_address_snapshot?: { address_line?: string; city?: string };
  } | null;
  product_snapshot?: { title?: string; selling_price?: number; image?: string };
  deal: Deal | null;
  unread?: number;
};

export type Message = {
  _id: string;
  conversation_id: string;
  sender_id: string | { _id: string };
  receiver_id?: string | { _id: string };
  message_type: "text" | "offer" | "system" | string;
  text: string;
  deal_id?: string;
  reply_to?: string | null;
  reply?: { _id?: string; text?: string; sender_id?: string; sender_name?: string; message_type?: string } | null;
  message_status?: "sent" | "delivered" | "read";
  is_flagged?: boolean;
  createdAt: string;
  // client-only
  pending?: boolean;
  failed?: boolean;
};

export type AppNotification = {
  id: string;
  _id?: string;
  title: string;
  description: string;
  time?: string;
  actionPath?: string;
  unread: boolean;
  type?: string;
  imageUrl?: string;
  actionLabel?: string;
  createdAt?: string;
};

export type Order = {
  _id: string;
  conversation_id?: string;
  role?: "buying" | "selling";
  status?: DealStatus;
  [key: string]: unknown;
};
