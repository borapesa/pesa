import { llms } from 'fumadocs-core/source';
import { source } from '@/lib/source';

export const dynamic = 'force-static';

const llmsHandler = llms(source);

export async function GET() {
  return new Response(llmsHandler.index(), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}
