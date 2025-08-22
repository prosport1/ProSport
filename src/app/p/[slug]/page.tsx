import { getPageContent } from '@/lib/storage';
import { notFound } from 'next/navigation';

export default function SportPage({ params }: { params: { slug: string } }) {
  const content = getPageContent(params.slug);

  if (!content) {
    notFound();
  }
  
  // Check if content is a full HTML document
  if (content.trim().startsWith('<!DOCTYPE html>')) {
     return (
        <div
        dangerouslySetInnerHTML={{ __html: content }}
        />
     );
  }

  // If content is Markdown or partial HTML, wrap it
  return (
    <div className="prose prose-invert mx-auto p-8">
      <div
        dangerouslySetInnerHTML={{ __html: content }}
      />
    </div>
  );
}
