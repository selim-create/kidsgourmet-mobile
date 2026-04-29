import React, { useMemo } from 'react';
import { useWindowDimensions, Linking } from 'react-native';
import RenderHtml, { defaultSystemFonts } from 'react-native-render-html';
import type { MixedStyleDeclaration } from 'react-native-render-html';

interface BlogContentProps {
  html: string;
}

const tagsStyles: Record<string, MixedStyleDeclaration> = {
  body: { color: '#1F2937', fontSize: 16, lineHeight: 26 },
  p: { marginTop: 0, marginBottom: 14, fontSize: 16, lineHeight: 26, color: '#1F2937' },
  h1: { fontSize: 26, fontWeight: '800', color: '#0F172A', marginTop: 24, marginBottom: 12, lineHeight: 32 },
  h2: { fontSize: 22, fontWeight: '800', color: '#0F172A', marginTop: 22, marginBottom: 10, lineHeight: 28 },
  h3: { fontSize: 18, fontWeight: '700', color: '#0F172A', marginTop: 18, marginBottom: 8, lineHeight: 24 },
  h4: { fontSize: 16, fontWeight: '700', color: '#0F172A', marginTop: 14, marginBottom: 6, lineHeight: 22 },
  a: { color: '#F97316', textDecorationLine: 'underline' },
  strong: { fontWeight: '700', color: '#0F172A' },
  em: { fontStyle: 'italic' },
  ul: { marginTop: 0, marginBottom: 14, paddingLeft: 18 },
  ol: { marginTop: 0, marginBottom: 14, paddingLeft: 18 },
  li: { marginBottom: 6, fontSize: 16, lineHeight: 24, color: '#1F2937' },
  blockquote: {
    borderLeftWidth: 4,
    borderLeftColor: '#F97316',
    paddingLeft: 14,
    paddingTop: 6,
    paddingBottom: 6,
    marginVertical: 14,
    backgroundColor: '#FFF7ED',
    fontStyle: 'italic',
  },
  img: { borderRadius: 12, marginVertical: 14 },
  figure: { marginVertical: 14 },
  figcaption: { fontSize: 12, color: '#6B7280', textAlign: 'center', marginTop: 6 },
  hr: { backgroundColor: '#F3F4F6', height: 1, marginVertical: 18 },
  table: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 8, marginVertical: 14 },
  th: { backgroundColor: '#F9FAFB', padding: 8, fontWeight: '700' },
  td: { padding: 8, borderTopWidth: 1, borderTopColor: '#F3F4F6' },
  iframe: { marginVertical: 14, borderRadius: 12 },
};

const classesStyles: Record<string, MixedStyleDeclaration> = {
  'wp-block-quote': {
    borderLeftWidth: 4,
    borderLeftColor: '#F97316',
    paddingLeft: 14,
    marginVertical: 14,
    backgroundColor: '#FFF7ED',
  },
};

/** WordPress'ten gelen HTML'de boş paragrafları ve fazla boşlukları temizler. */
function normalizeHtml(html: string): string {
  return html
    .replace(/<p>(\s|&nbsp;|<br\s*\/?>)*<\/p>/gi, '')
    .replace(/(\s*<br\s*\/?>\s*){3,}/gi, '<br/><br/>')
    .replace(/&nbsp;/g, ' ')
    .trim();
}

export function BlogContent({ html }: BlogContentProps) {
  const { width } = useWindowDimensions();
  const source = useMemo(() => ({ html: normalizeHtml(html) }), [html]);

  return (
    <RenderHtml
      contentWidth={width - 32}
      source={source}
      tagsStyles={tagsStyles}
      classesStyles={classesStyles}
      systemFonts={defaultSystemFonts}
      enableExperimentalMarginCollapsing
      defaultTextProps={{ selectable: true }}
      renderersProps={{
        a: {
          onPress: (_e: unknown, href: string) => {
            Linking.openURL(href).catch(() => {});
          },
        },
        img: { enableExperimentalPercentWidth: true },
      }}
      ignoredDomTags={['script', 'style', 'noscript']}
    />
  );
}
