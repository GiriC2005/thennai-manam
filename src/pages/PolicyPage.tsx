import type { ReactNode } from 'react';

interface Props {
  title: string;
  children: ReactNode;
}

export default function PolicyPage({ title, children }: Props) {
  return (
    <div className="container-page py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="font-heading text-3xl lg:text-4xl text-ink mb-8">{title}</h1>
        <div className="prose prose-sm max-w-none text-ink-soft leading-relaxed space-y-4">
          {children}
        </div>
        <p className="text-xs text-ink-soft mt-12 pt-6 border-t border-ink/10">
          Last updated: {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>
    </div>
  );
}
