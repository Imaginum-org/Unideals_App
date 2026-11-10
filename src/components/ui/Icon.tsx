// Lucide icons — the same set the website uses (lucide-react), so glyphs
// match 1:1. Names are stable app-wide keys mapped to lucide components.
import {
  ArrowRight, BadgeCheck, Ban, Bell, BellOff, Bike, Bookmark, BookOpen, Briefcase, Calendar, CalendarDays, Camera, ChartColumn,
  Check, CheckCheck, ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Circle, CircleAlert, CircleCheck, CircleDot, CircleHelp,
  CircleUserRound, CircleX, Clock, CloudOff, Compass, Copy, Crown, Download, Dumbbell, Ellipsis, EllipsisVertical, Eye, EyeOff,
  FileText, Filter, Flag, FlaskConical, Flame, Flower2, Gem, Grid2x2, Handshake, Heart, House, ImageIcon, Images, Inbox, Info,
  KeyRound, Laptop, LayoutGrid, LifeBuoy, ListChecks, Lock, LogOut, Mail, MailOpen, MapPin, Menu, MessageCircle, MessageSquareText,
  MessagesSquare, Minus, Moon, Package, Palette, Pencil, Plus, Receipt, RefreshCw, Reply, Rocket, Search, SendHorizontal, Settings,
  Share2, Shield, ShieldCheck, Shirt, ShoppingBag, SlidersHorizontal, Sparkles, Square, SquareCheck, Star, Sun, Tag, Tags, Ticket,
  Timer, Trash2, TrendingUp, Trophy, User, UserRound, Wallet, Watch, X, Zap, Volleyball, Bed, Headphones, Bot, ArrowUpDown, Store,
  Phone, CreditCard, Cookie, Database, Gavel, GraduationCap, Scale, Sparkle, IndianRupee, HandCoins, ImagePlus, History, ArrowUpRight,
  type LucideIcon,
} from "lucide-react-native";
import type { StyleProp, ViewStyle } from "react-native";

const MAP = {
  // navigation
  home: House, "home-outline": House, compass: Compass, "compass-outline": Compass, add: Plus, plus: Plus, minus: Minus,
  chatbubbles: MessageCircle, "chatbubbles-outline": MessageCircle, "chatbubble-ellipses-outline": MessageSquareText, messages: MessagesSquare,
  "person-circle": CircleUserRound, "person-circle-outline": CircleUserRound, "person-outline": UserRound, user: User,
  "chevron-back": ChevronLeft, "chevron-forward": ChevronRight, "chevron-down": ChevronDown, "chevron-up": ChevronUp,
  "arrow-forward": ArrowRight, close: X, "close-circle": CircleX, menu: Menu, "ellipsis-vertical": EllipsisVertical, ellipsis: Ellipsis,
  // actions
  search: Search, "search-outline": Search, "options-outline": SlidersHorizontal, filter: Filter, "swap-vertical": ArrowUpDown,
  send: SendHorizontal, reply: Reply, copy: Copy, "share-social-outline": Share2, download: Download, refresh: RefreshCw,
  "create-outline": Pencil, "trash-outline": Trash2, "flag-outline": Flag, "log-out-outline": LogOut, ban: Ban,
  "eye-outline": Eye, "eye-off-outline": EyeOff, "lock-closed-outline": Lock, "key-outline": KeyRound,
  // status
  checkmark: Check, "checkmark-done": CheckCheck, "checkmark-done-outline": CheckCheck, "checkmark-circle": CircleCheck,
  "alert-circle": CircleAlert, "information-circle": Info, "help-circle-outline": CircleHelp, "time-outline": Clock, timer: Timer,
  "ellipse-outline": Circle, "radio-button-off": Circle, "radio-button-on": CircleDot, checkbox: SquareCheck, "square-outline": Square,
  "cloud-offline-outline": CloudOff, "file-tray-outline": Inbox, "notifications-outline": Bell, "notifications-off-outline": BellOff,
  "mail-outline": Mail, "mail-unread-outline": MailOpen, verified: BadgeCheck,
  // commerce
  heart: Heart, "heart-outline": Heart, star: Star, "star-outline": Star, flame: Flame, flash: Zap, "flash-outline": Zap, zap: Zap,
  "rocket-outline": Rocket, rocket: Rocket, pricetag: Tag, "pricetag-outline": Tag, "pricetags-outline": Tags, crown: Crown,
  "diamond-outline": Gem, "bag-handle-outline": ShoppingBag, bag: ShoppingBag, "cube-outline": Package, package: Package,
  "wallet-outline": Wallet, "receipt-outline": Receipt, "trending-up": TrendingUp, "trophy-outline": Trophy, handshake: Handshake,
  chart: ChartColumn, store: Store, bookmark: Bookmark,
  // places / misc
  location: MapPin, "location-outline": MapPin, "calendar-outline": CalendarDays, calendar: Calendar, "school-outline": Briefcase,
  "image-outline": ImageIcon, "images-outline": Images, camera: Camera, "camera-outline": Camera, "settings-outline": Settings,
  "color-palette-outline": Palette, "document-text-outline": FileText, "shield-outline": Shield, "shield-checkmark-outline": ShieldCheck,
  "sparkles-outline": Sparkles, sparkles: Sparkles, moon: Moon, sun: Sun, "life-buoy": LifeBuoy, "list-checks": ListChecks, bot: Bot,
  headphones: Headphones, "grid-outline": LayoutGrid, grid: Grid2x2,
  // category fallbacks
  "laptop-outline": Laptop, "book-outline": BookOpen, "bed-outline": Bed, "shirt-outline": Shirt, "watch-outline": Watch,
  "flask-outline": FlaskConical, "football-outline": Volleyball, "barbell-outline": Dumbbell, "bicycle-outline": Bike,
  "ticket-outline": Ticket, "woman-outline": User, "flower-outline": Flower2, "logo-google": CircleUserRound,
  // content files (faqData / legalContent icon keys)
  phone: Phone, card: CreditCard, cookie: Cookie, database: Database, gavel: Gavel, grad: GraduationCap, scale: Scale,
  trash: Trash2, check: Check, clock: Clock, chat: MessageCircle, tag: Tag, flower: Flower2, shield: Shield, info: Info,
  mail: Mail, rupee: IndianRupee, "hand-coins": HandCoins, "image-plus": ImagePlus, history: History, "arrow-up-right": ArrowUpRight, lock: Lock, eye: Eye, image: ImageIcon, share: Share2, settings: Settings, flag: Flag, trophy: Trophy, sparkle: Sparkle,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof MAP;


export function Icon({
  name,
  size = 20,
  color = "#0F172A",
  strokeWidth,
  filled,
  style,
}: {
  name: IconName;
  size?: number;
  color?: string;
  strokeWidth?: number;
  filled?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const C = MAP[name] || Circle;
  const fill = (filled ?? (name === "heart" || name === "star")) ? color : "none";
  return <C size={size} color={color} strokeWidth={strokeWidth ?? 2} fill={fill} style={style as any} />;
}
