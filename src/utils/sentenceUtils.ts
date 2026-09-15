/**
 * Sentence Utilities for YDS English
 * Filters boilerplate / dummy / template sentences and guarantees authentic academic usage examples.
 */

const BOILERPLATE_PATTERNS: string[] = [
  'frequently appears in yds',
  'frequently tested in yds',
  'in yds exam context',
  'frequently studied in modern literature',
  'widely used in academic and professional contexts',
  'widely used in academic texts and daily communication',
  'usage example for',
  'the connector "',
  'the word "',
  'kelimesi yds metinlerinde',
  'bağlacı yds',
  'yds bağlamındaki kullanımı',
  'akademik metinlerde ve günlük iletişimde',
  'akademik ve profesyonel bağlamda',
  'örnek cümle bulunamadı',
  'örnek bulunamadı',
];

/**
 * Checks if an example sentence is a generic/dummy boilerplate template rather than a real sentence.
 */
export function isBoilerplateSentence(sentence?: string | null): boolean {
  if (!sentence || typeof sentence !== 'string') return true;
  const s = sentence.trim().toLowerCase();
  if (s.length < 10) return true;

  return BOILERPLATE_PATTERNS.some((pattern) => s.includes(pattern));
}

/**
 * Returns a clean trimmed sentence if valid and non-boilerplate, otherwise returns null.
 */
export function getValidExampleSentence(sentence?: string | null): string | null {
  if (isBoilerplateSentence(sentence)) return null;
  const trimmed = (sentence || '').trim();
  // Strip redundant outer quotes if present
  return trimmed.replace(/^["'“”]+|["'“”]+$/g, '').trim();
}
