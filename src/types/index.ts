// ─── Kiểu dữ liệu dùng chung cho Dashboard điều hành Xuân Hoà Số ─────────────

export type Role =
  | "SUPER_ADMIN"
  | "PHUONG_ADMIN"
  | "CONTENT_EDITOR"
  | "FEEDBACK_OFFICER"
  | "NEIGHBORHOOD_LEADER"
  | "NEIGHBORHOOD_STAFF";

export type Module =
  | "overview" | "tasks" | "content" | "feedback" | "neighborhoods"
  | "waste" | "surveys" | "literacy" | "media" | "utilities"
  | "preview" | "reports" | "users" | "settings";

export type Action = "view" | "create" | "edit" | "delete" | "approve" | "publish" | "export";

export interface User {
  id: string;
  fullName: string;
  username: string;
  role: Role;
  unit: string;
  hoodId: number | null;
  phone: string;
  email: string;
  status: "active" | "locked";
  lastLogin: string;
  canPublishDirectly: boolean;
}

export type ContentType = "news" | "announcement" | "event" | "banner" | "literacy";
export type ContentStatus =
  | "draft" | "pending" | "needs_revision" | "approved"
  | "scheduled" | "published" | "hidden";

export interface ContentItem {
  id: string;
  type: ContentType;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  image: string;
  gallery: string[];
  videoUrl?: string;
  hoodId: number | null;
  authorId: string;
  status: ContentStatus;
  createdAt: string;
  publishedAt: string | null;
  scheduledAt: string | null;
  startAt?: string | null;
  endAt?: string | null;
  place?: string;
  pinned: boolean;
  featured: boolean;
  views: number;
  seoTitle?: string;
  seoDescription?: string;
  topic?: string;
  level?: "easy" | "medium";
  audience?: string;
  history: ApprovalEntry[];
}

export interface ApprovalEntry {
  at: string;
  by: string;
  action: "created" | "submitted" | "approved" | "rejected" | "published" | "hidden" | "scheduled" | "updated";
  note?: string;
}

export type FeedbackStatus =
  | "new" | "assigned" | "processing" | "waiting" | "completed" | "reopened";
export type Priority = "urgent" | "high" | "normal";

export interface Feedback {
  id: string;
  code: string;
  summary: string;
  content: string;
  field: string;
  hoodId: number;
  senderName: string;
  senderPhone: string;
  address: string;
  lat?: number;
  lng?: number;
  images: string[];
  createdAt: string;
  dueAt: string;
  assigneeId: string | null;
  unit: string | null;
  status: FeedbackStatus;
  priority: Priority;
  timeline: FeedbackEvent[];
  result?: string;
}

export interface FeedbackEvent {
  at: string;
  by: string;
  action: string;
  note?: string;
}

export interface Neighborhood {
  id: number;
  name: string;
  leaderId: string;
  leaderName: string;
  phone: string;
  population: number;
  households: number;
  image: string;
  intro: string;
  board: { name: string; role: string; phone: string }[];
  lastUpdate: string;
  active: boolean;
}

export interface WasteSchedule {
  id: string;
  hoodId: number;
  route: string;
  weekdays: number[];
  timeRange: string;
  wasteType: string;
  provider: string;
  note: string;
  effectiveFrom: string;
  status: "active" | "paused";
}

export interface SurveyQuestion {
  id: string;
  label: string;
  type: "text" | "single" | "multiple" | "number";
  required: boolean;
  options?: string[];
}

export interface Survey {
  id: string;
  title: string;
  description: string;
  kind: "survey" | "register_event" | "register_support" | "form";
  openAt: string;
  closeAt: string;
  hoodIds: number[] | null;
  limit: number | null;
  responses: number;
  publicResult: boolean;
  status: "draft" | "open" | "closed";
  questions: SurveyQuestion[];
}

export interface MediaItem {
  id: string;
  url: string;
  kind: "image" | "video";
  name: string;
  album: string;
  hoodId: number | null;
  event: string;
  size: string;
  uploadedAt: string;
  uploadedBy: string;
  usedIn: string[];
}

export interface Utility {
  id: string;
  name: string;
  icon: string;
  category: string;
  description: string;
  link: string;
  order: number;
  onHome: boolean;
  status: "active" | "hidden";
}

export interface ActivityLog {
  id: string;
  at: string;
  actorId: string;
  action: string;
  target: string;
  hoodId: number | null;
}

export interface Notification {
  id: string;
  at: string;
  kind: "feedback" | "content" | "event" | "survey";
  title: string;
  description: string;
  link: string;
  read: boolean;
  hoodId: number | null;
}

export interface HomeConfig {
  bannerIds: string[];
  pinnedAnnouncementId: string | null;
  featuredNewsIds: string[];
  utilityIds: string[];
  hoodIds: number[];
  literacyIds: string[];
  communityNewsIds: string[];
  sections: Record<string, boolean>;
}

export interface OrgSettings {
  name: string;
  address: string;
  phone: string;
  email: string;
  zaloOA: string;
  fanpage: string;
  website: string;
  copyright: string;
}
