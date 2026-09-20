import type { Metadata } from 'next';
import WebSystemsPageContent from '@/components/pages/WebSystemsPageContent';

export const metadata: Metadata = {
  title: 'Web Systems & Digital Solutions for Business | Mahleek Design',
  description: 'We build purposeful web systems—from booking and lead capture systems to custom customer portals—designed to solve real business problems in Nigeria and beyond.',
};

export default function WebSystemsPage() {
  return <WebSystemsPageContent />;
}
