import DOMPurify from 'dompurify';

export function sanitizeHtml(html) {
  return DOMPurify.sanitize(String(html || ''), {
    ALLOWED_ATTR: ['href','title','alt','src'],
    ALLOWED_TAGS: ['b','strong','i','em','u','p','br','ul','ol','li','a','img','span']
  });
}
export function escapeText(s) {
  return String(s ?? '')
    .replaceAll('&','&amp;')
    .replaceAll('<','&lt;')
    .replaceAll('>','&gt;')
    .replaceAll('"','&quot;')
    .replaceAll("'",'&#39;');
}
