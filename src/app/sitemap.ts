import { MetadataRoute } from 'next';
import { getAdminClient } from '@/lib/supabase/admin';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://mahleekdesign.vercel.app';
  const adminClient = getAdminClient();

  // Static routes
  const routes: MetadataRoute.Sitemap = [
    '',
    '/about',
    '/brand-identity',
    '/contact',
    '/gallery',
    '/web-projects',
    '/web-systems',
    '/work',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }));

  // Dynamic projects
  if (adminClient) {
    const { data: projects } = await adminClient
      .from('projects')
      .select('slug, created_at')
      .eq('published', true);

    if (projects) {
      projects.forEach((project) => {
        routes.push({
          url: `${baseUrl}/work/${project.slug}`,
          lastModified: new Date(project.created_at),
          changeFrequency: 'monthly' as const,
          priority: 0.6,
        });
      });
    }
  }

  return routes;
}
