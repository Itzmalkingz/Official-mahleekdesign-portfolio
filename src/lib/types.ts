export interface Project {
  id: string;
  title: string;
  description: string;
  category: "web" | "design";
  image_url: string;
  images: string[];
  live_url: string;
  tags: string[];
  created_at: string;
  updated_at: string;
  featured: boolean;
  sort_order: number;
  case_study: string;
  services: string[];
}
