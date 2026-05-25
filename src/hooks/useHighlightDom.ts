import { useEffect, useRef } from 'react';

const MARK_CLASS = 'search-highlight';
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA', 'SELECT', 'MARK', 'SVG']);

function clearHighlights(): void {
  const marks = document.querySelectorAll(`mark.${MARK_CLASS}`);
  marks.forEach((mark) => {
    const parent = mark.parentNode;
    if (parent == null) return;
    const text = document.createTextNode(mark.textContent ?? '');
    parent.replaceChild(text, mark);
    parent.normalize();
  });
}

function highlightText(term: string): void {
  if (term.trim() === '') return;

  const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node): number {
        const parent = node.parentElement;
        if (parent == null) return NodeFilter.FILTER_REJECT;
        if (SKIP_TAGS.has(parent.tagName)) return NodeFilter.FILTER_REJECT;
        if ((node.textContent ?? '').trim() === '') return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      },
    },
  );

  const textNodes: Text[] = [];
  let current = walker.nextNode();
  while (current != null) {
    textNodes.push(current as Text);
    current = walker.nextNode();
  }

  textNodes.forEach((textNode) => {
    const content = textNode.textContent ?? '';
    if (!regex.test(content)) return;
    regex.lastIndex = 0;

    const fragment = document.createDocumentFragment();
    let lastIndex = 0;
    let match = regex.exec(content);

    while (match != null) {
      if (match.index > lastIndex) {
        fragment.appendChild(document.createTextNode(content.slice(lastIndex, match.index)));
      }

      const mark = document.createElement('mark');
      mark.className = MARK_CLASS;
      mark.textContent = match[0];
      fragment.appendChild(mark);

      lastIndex = match.index + match[0].length;
      match = regex.exec(content);
    }

    if (lastIndex < content.length) {
      fragment.appendChild(document.createTextNode(content.slice(lastIndex)));
    }

    textNode.parentNode?.replaceChild(fragment, textNode);
  });
}

export function useHighlightDom(searchTerm: string, deps: unknown[] = []): void {
  const debounceRef = useRef<number | null>(null);

  useEffect((): (() => void) => {
    if (debounceRef.current != null) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = window.setTimeout(() => {
      clearHighlights();
      if (searchTerm.trim().length >= 2) {
        highlightText(searchTerm);
      }
    }, 200);

    return (): void => {
      if (debounceRef.current != null) {
        clearTimeout(debounceRef.current);
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, ...deps]);

  // Cleanup on unmount
  useEffect((): (() => void) => {
    return (): void => {
      clearHighlights();
    };
  }, []);
}
