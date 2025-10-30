// =============================================================================
// v0.0.1 2022_0220_0749 by Ben Jaffe
// The following JS allows you to put an emoji before any page with a given prefix,
// suffix, exact match, or substring match.
// You can define as many customizations as you want.
//   title (optional): makes the generated css prettier, but you won't see it anyway
//   value (required): the value it matches against
//   selector (required): whether we are matching on a prefix, suffix, or substring.
//   character (required): it must be a single character/emoji
//   color (optional): will change the color of the matched text
// =============================================================================

import {BlockStyle} from './App';

export const makeSelectorCSS = (
  title: string,
    {value, selector, character, color}: BlockStyle,
) => {
  // brittle, imitating `page-name-sanity` in the logseq source code
  const valueEscaped = value
    .replace(/[\[\:\\\*\?\"\<\>\|\]\+\%\#]/g, '_')
    .toLowerCase();
  return `
/* ${title} */
.page-reference[data-ref${selector}='${value}'] .page-ref,
.page-ref[data-ref${selector}='${valueEscaped}'],
.recent-item[data-ref${selector}='${valueEscaped}'] a,
.title[data-ref${selector}='${valueEscaped}'] {
  ${color ? `color: ${color}!important;` : 'color: inherit!important;'}
  font-weight: 500;
}
.recent-item[data-ref${selector}='${valueEscaped}'] {
  position: relative;
}
.recent-item[data-ref${selector}='${valueEscaped}'] .page-icon {
  visibility: hidden;
}
.page-reference[data-ref${selector}='${value}'] .page-ref:before,
.page-ref[data-ref${selector}='${valueEscaped}']:before,
.recent-item[data-ref${selector}='${valueEscaped}']:before,
.title[data-ref${selector}='${valueEscaped}']:before {
  display: ${character ? 'inline' : 'none'};
  content: '${character || ''}';
  margin-right: 2px;
}

.recent-item[data-ref${selector}='${valueEscaped}']:before {
  position: absolute;
  left: 20px;
  top: 3px;
}`;
};
