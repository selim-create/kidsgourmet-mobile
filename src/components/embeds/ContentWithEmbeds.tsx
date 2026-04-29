import React from 'react';
import { View } from 'react-native';
import { BlogContent } from '../blog/BlogContent';
import { EmbedContainer } from './EmbedContainer';
import type { EmbedData } from '../../lib/types';

interface ContentWithEmbedsProps {
  htmlContent: string;
  embeddedContent?: EmbedData[];
}

/**
 * Splits HTML content at </p> boundaries and injects EmbedContainers
 * at the paragraph positions specified by each EmbedData item.
 * Mirrors the logic in the web's ContentWithEmbeds component.
 */
export function ContentWithEmbeds({ htmlContent, embeddedContent }: ContentWithEmbedsProps) {
  if (!embeddedContent || embeddedContent.length === 0) {
    return <BlogContent html={htmlContent} />;
  }

  // Split on closing </p> tags, keeping the delimiter as part of each segment
  const rawParts = htmlContent.split(/(<\/p>)/i);

  // Reassemble: pair each text chunk with its closing tag
  const paragraphs: string[] = [];
  for (let i = 0; i < rawParts.length; i += 2) {
    const chunk = rawParts[i];
    const closing = rawParts[i + 1] ?? '';
    const part = chunk + closing;
    if (part.trim()) {
      paragraphs.push(part);
    }
  }

  // Sort embeds by position so we inject them in order
  const sortedEmbeds = [...embeddedContent].sort((a, b) => a.position - b.position);

  const elements: React.ReactNode[] = [];

  paragraphs.forEach((paragraph, index) => {
    const position = index + 1; // 1-indexed

    elements.push(
      <BlogContent key={`para-${position}`} html={paragraph} />,
    );

    // Inject any embeds whose position matches this paragraph
    sortedEmbeds
      .filter((embed) => embed.position === position)
      .forEach((embed) => {
        elements.push(
          <EmbedContainer key={`embed-${embed.placeholder_id}`} embed={embed} />,
        );
      });
  });

  // Append embeds whose position exceeds the total paragraph count
  sortedEmbeds
    .filter((embed) => embed.position > paragraphs.length)
    .forEach((embed) => {
      elements.push(
        <EmbedContainer key={`embed-tail-${embed.placeholder_id}`} embed={embed} />,
      );
    });

  return <View>{elements}</View>;
}
