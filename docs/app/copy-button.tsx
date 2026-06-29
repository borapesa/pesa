'use client';

import { Check, Clipboard } from 'lucide-react';
import { useState } from 'react';

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center justify-center p-1 rounded border border-fd-border bg-transparent text-fd-muted-foreground cursor-pointer transition-all duration-150 hover:bg-fd-accent [&_svg]:size-3.5"
      aria-label="Copy to clipboard"
    >
      {copied ? <Check /> : <Clipboard />}
    </button>
  );
}
