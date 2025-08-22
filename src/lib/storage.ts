// This is a simple in-memory store.
// In a real application, you would use a database.
const pageStore = new Map<string, string>();

export function setPageContent(slug: string, content: string) {
  pageStore.set(slug, content);
}

export function getPageContent(slug: string): string | undefined {
  return pageStore.get(slug);
}
