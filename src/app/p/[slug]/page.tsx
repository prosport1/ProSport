import { getPageContent } from '@/lib/storage';
import { notFound } from 'next/navigation';

export default function SportPage({ params }: { params: { slug: string } }) {
  const content = getPageContent(params.slug);

  if (!content) {
    notFound();
  }

  return (
    <div
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
