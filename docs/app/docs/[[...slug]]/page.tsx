import { existsSync } from 'node:fs';
import { join } from 'node:path';
import defaultMdxComponents from 'fumadocs-ui/mdx';
import { DocsBody, DocsDescription, DocsPage, DocsTitle } from 'fumadocs-ui/page';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { MarkdownCopyButton, ViewOptionsPopover } from '@/components/ai/page-actions';
import { source } from '@/lib/source';

const CONTENT_DIR = join(process.cwd(), 'content', 'docs');

/** Resolve the source file path for a page, handling index files. */
function resolveSource(slugs: string[]): { relPath: string; ext: string } {
  const base = slugs.length > 0 ? slugs.join('/') : 'index';

  for (const ext of ['.mdx', '.md']) {
    if (existsSync(join(CONTENT_DIR, `${base}${ext}`))) {
      return { relPath: base, ext };
    }
  }
  // Not a leaf file — must be a directory index
  return { relPath: `${base}/index`, ext: '.md' };
}

export default async function Page(props: { params: Promise<{ slug?: string[] }> }) {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  const MDX = page.data.body;

  const { relPath, ext } = resolveSource(page.slugs);

  const markdownUrl = `/llms/${relPath}/index.md`;
  const githubUrl = `https://github.com/borapesa/pesa/blob/master/docs/content/docs/${relPath}${ext}`;

  return (
    <DocsPage
      toc={page.data.toc}
      full={page.data.full}
      tableOfContent={{
        style: 'clerk',
        single: false,
      }}
    >
      <div
        style={{
          display: 'flex',
          gap: '0.5rem',
          alignItems: 'center',
          paddingBottom: '1.5rem',
          marginBottom: '1.5rem',
          borderBottom: '1px solid var(--color-fd-border)',
        }}
      >
        <MarkdownCopyButton markdownUrl={markdownUrl} />
        <ViewOptionsPopover markdownUrl={markdownUrl} githubUrl={githubUrl} />
      </div>
      <DocsBody>
        <DocsTitle>{page.data.title}</DocsTitle>
        <DocsDescription>{page.data.description}</DocsDescription>
        <MDX components={defaultMdxComponents} />
      </DocsBody>
    </DocsPage>
  );
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}): Promise<Metadata> {
  const params = await props.params;
  const page = source.getPage(params.slug);
  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({ slug: page.slugs }));
}
