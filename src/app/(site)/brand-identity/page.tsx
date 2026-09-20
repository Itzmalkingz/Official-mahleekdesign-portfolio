import type { Metadata } from 'next';
import BrandIdentityPageContent from '@/components/pages/BrandIdentityPageContent';

export const metadata: Metadata = {
  title: 'Brand Identity Design Services | Mahleek Design',
  description: 'We create recognizable brand identities, visual languages, and brand strategies that help businesses stand out and build lasting connections.',
};

export default function BrandIdentityPage() {
  return <BrandIdentityPageContent />;
}
