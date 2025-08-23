
import { getPageContent } from '@/lib/storage';
import { notFound } from 'next/navigation';

export default function SportPage({ params }: { params: { slug: string } }) {
  const content = getPageContent(params.slug);

  if (!content) {
    notFound();
  }
  
  // The content from storage will be either Markdown or partial HTML.
  // We check if it's likely a full HTML page just in case, but the new
  // logic ensures we get partial HTML for the enhanced sportpage.
  const isFullHtml = content.trim().toLowerCase().startsWith('<!doctype html>') || content.trim().toLowerCase().startsWith('<html>');
  
  if (isFullHtml) {
     return (
        <div
          dangerouslySetInnerHTML={{ __html: content }}
        />
     );
  }

  // If content is Markdown or partial HTML, wrap it for consistent styling.
  // The enhanced sport page is now just the inner body content, so it fits here perfectly.
  return (
    <div
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
}
