
import { getPageContent } from '@/lib/storage';
import { notFound } from 'next/navigation';
import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

export default function SportPage({ params }: { params: { slug: string } }) {
  const content = getPageContent(params.slug);

  if (!content) {
    notFound();
  }
  
  // Create a DOMPurify instance in the JSDOM environment
  const window = new JSDOM('').window;
  const purify = DOMPurify(window as any);
  
  // Sanitize the HTML content
  const cleanHtml = purify.sanitize(content);

  const isFullHtml = cleanHtml.trim().toLowerCase().startsWith('<!doctype html>') || cleanHtml.trim().toLowerCase().startsWith('<html>');
  
  // If it's a full HTML page, render it directly.
  if (isFullHtml) {
     return (
        <div
          dangerouslySetInnerHTML={{ __html: cleanHtml }}
        />
     );
  }

  // Otherwise, wrap the content in a basic HTML structure with Tailwind loaded.
  // This handles both Markdown (which will be rendered as plain text but can be styled later)
  // and the new HTML fragments from the enhanced sportpage.
  const fullPageHtml = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <script src="https://cdn.tailwindcss.com"></script>
      <title>Athlete Page</title>
    </head>
    <body>
      ${cleanHtml}
    </body>
    </html>
  `;

  return (
    <div
      style={{width: '100%', height: '100vh'}}
      dangerouslySetInnerHTML={{ __html: fullPageHtml }}
    />
  );
}
