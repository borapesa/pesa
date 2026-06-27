import { source } from '@/lib/source';

/**
 * `*.md` endpoint — serves any docs page as raw markdown.
 *
 * Accessed by appending `.md` to any docs URL.
 * Also supports content negotiation via `Accept: text/markdown`.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params;
  const page = source.getPage(slug);

  if (!page) {
    return new Response('Not Found', { status: 404 });
  }

  // Use the processed markdown from the page data
  const content = await page.data.getText?.('processed');
  if (content) {
    return new Response(content, {
      headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
    });
  }

  // Fallback: return structured page info
  const fallback = `# ${page.data.title}\n\n${page.data.description || ''}\n\n[View on docs site](/docs/${slug?.join('/') || ''})`;
  return new Response(fallback, {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  });
}
