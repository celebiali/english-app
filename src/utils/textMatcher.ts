/**
 * Turkish String Normalizer
 * Handles Turkish specific characters (I/ı, İ/i), punctuation, and whitespace
 */
export function normalizeTurkishText(text: string): string {
  if (!text) return '';
  return text
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLowerCase()
    .replace(/[\(\)\[\]\{\}\-\–\—\.\,\;\:\?\!\"\'\`\/]/g, ' ') // Replace punctuation with space
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
}

/**
 * Validates if the user's typed input matches the target meaning or synonyms.
 * @param userInput String entered by the user
 * @param primaryMeaning Target meaning string e.g. "terk etmek, vazgeçmek"
 * @param synonyms List of synonyms e.g. ["desert", "forsake"]
 */
export function checkAnswerCorrectness(
  userInput: string,
  primaryMeaning: string,
  synonyms: string[] = []
): boolean {
  const cleanInput = normalizeTurkishText(userInput);
  if (!cleanInput) return false;

  // Split primary meaning into acceptable sub-tokens (by comma, slash, semicolon, or 'veya')
  const possibleAnswers = primaryMeaning
    .split(/[,/;\n|]|\bveya\b/g)
    .map((s) => normalizeTurkishText(s))
    .filter((s) => s.length > 0);

  // Add normalized synonyms if any
  synonyms.forEach((syn) => {
    const cleanSyn = normalizeTurkishText(syn);
    if (cleanSyn.length > 0) {
      possibleAnswers.push(cleanSyn);
    }
  });

  // Check 1: Exact match with any option
  if (possibleAnswers.some((ans) => ans === cleanInput)) {
    return true;
  }

  // Check 2: Partial/Sub-phrase containment match (if input is at least 3 chars)
  if (cleanInput.length >= 3) {
    for (const ans of possibleAnswers) {
      if (ans.includes(cleanInput) || cleanInput.includes(ans)) {
        return true;
      }
    }
  }

  return false;
}
