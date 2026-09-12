export type ProjectCategory = "brand-identity" | "web-systems" | "brand-web";

export interface ProjectFeature {
  id?: string;
  project_id?: string;
  name: string;
  description?: string;
  sort_order: number;
}

export interface ProjectImage {
  id?: string;
  project_id?: string;
  image_url: string;
  alt_text?: string;
  sort_order: number;
}

export interface Project {
  id: string;
  title: string;
  slug: string;
  client?: string;
  industry?: string;
  category: ProjectCategory;
  short_description: string;
  challenge?: string;
  thinking?: string;
  solution?: string;
  outcome?: string;
  cover_image: string;
  images: ProjectImage[];
  live_url?: string;
  github_url?: string;
  tags: string[];
  services: string[];
  technologies: string[];
  features: ProjectFeature[];
  created_at: string;
  updated_at: string;
  featured: boolean;
  published: boolean;
  sort_order: number;
  meta_title?: string;
  meta_description?: string;
  og_image?: string;
  archived?: boolean;
  canonical_url?: string | null;
  year?: string | null;
}

export interface Testimonial {
  id: string;
  name: string;
  business: string;
  role?: string;
  content: string;
  image_url?: string;
  project_id?: string;
  published: boolean;
  featured: boolean;
  created_at: string;
  sort_order?: number;
}

export type EnquiryStatus = "new" | "contacted" | "discussion" | "won" | "closed";
export type EnquiryPriority = "low" | "normal" | "high" | "urgent";

export interface Enquiry {
  id: string;
  name: string;
  email: string;
  business?: string;
  project_type: "brand-identity" | "web-systems" | "brand-web" | "business-website" | "custom" | "not-sure";
  message: string;
  budget?: string;
  timeline?: string;
  status: EnquiryStatus;
  notes?: string;
  created_at: string;
  updated_at: string;
  read_at?: string | null;
  archived?: boolean;
  source?: string;
  priority?: EnquiryPriority;
  next_follow_up_at?: string | null;
  last_contacted_at?: string | null;
  phone?: string | null;
  client_id?: string | null;
}

export interface Service {
  id: string;
  name: string;
  short_description: string;
  full_description?: string;
  icon?: string;
  image_url?: string;
  features: string[];
  sort_order: number;
  published: boolean;
  created_at?: string;
  updated_at?: string;
}

// ── Admin Control Center ──────────────────────────────────────────────────────

export type Role = "admin" | "editor" | "staff";

export interface Profile {
  user_id: string;
  email: string;
  full_name?: string | null;
  role: Role;
  avatar_url?: string | null;
  last_active_at?: string | null;
  created_at?: string;
}

export interface Client {
  id: string;
  name: string;
  company?: string | null;
  email?: string | null;
  phone?: string | null;
  status: "active" | "lead" | "past";
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export type AppointmentStatus =
  | "pending"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "no-show"
  | "rejected";

export interface Appointment {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  company?: string | null;
  project_type?: string | null;
  message?: string | null;
  appointment_date?: string | null;
  appointment_time?: string | null;
  duration_minutes: number;
  status: AppointmentStatus;
  notes?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Availability {
  id: number;
  working_days: number[];
  start_time: string;
  end_time: string;
  slot_duration_minutes: number;
  buffer_minutes: number;
  max_bookings_per_day: number;
  blocked_dates: string[];
  timezone: string;
  updated_at?: string;
}

export interface MediaItem {
  id: string;
  name: string;
  path: string;
  bucket: string;
  url?: string | null;
  mime_type?: string | null;
  size_bytes?: number | null;
  alt_text?: string | null;
  width?: number | null;
  height?: number | null;
  uploaded_by?: string | null;
  created_at: string;
}

export interface ActivityLog {
  id: string;
  actor_id?: string | null;
  actor_email?: string | null;
  action: string;
  entity_type?: string | null;
  entity_id?: string | null;
  entity_title?: string | null;
  meta?: Record<string, unknown>;
  created_at: string;
}

export type NotificationType = "enquiry" | "appointment" | "system" | "lead" | "content";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string | null;
  link?: string | null;
  read: boolean;
  created_at: string;
}

export interface SettingsRow {
  key: string;
  value: Record<string, unknown>;
  updated_at?: string;
}

export interface AnalyticsEvent {
  id: number;
  event_type: "page_view" | "project_view" | "enquiry" | "booking";
  entity_type?: string | null;
  entity_id?: string | null;
  entity_slug?: string | null;
  path?: string | null;
  view_date: string;
  created_at: string;
}
