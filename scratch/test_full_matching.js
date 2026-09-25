function normalizeTr(txt) {
  return (txt || '')
    .replace(/İ/g, 'i')
    .replace(/I/g, 'ı')
    .toLocaleLowerCase('tr-TR')
    .replace(/[\-–—_.,\/#!$%\^&\*;:{}=\`~()\"\'\?\[\]]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function foldAscii(txt) {
  return normalizeTr(txt)
    .replace(/[çÇ]/g, 'c')
    .replace(/[ğĞ]/g, 'g')
    .replace(/[ıİ]/g, 'i')
    .replace(/[öÖ]/g, 'o')
    .replace(/[şŞ]/g, 's')
    .replace(/[üÜ]/g, 'u');
}

function getTrStem(txt) {
  let norm = normalizeTr(txt);
  // Conjunctions / clauses
  norm = norm
    .replace(/(dığı için|diği için|duğu için|düğü için)$/g, '')
    .replace(/(e rağmen|a rağmen|e karşın|a karşın)$/g, '');

  // Verbs
  norm = norm
    .replace(/(mekte olan|makta olan)$/g, '')
    .replace(/(mektedir|maktadır|miştir|mıştır|müştür|muştur)$/g, '')
    .replace(/(mekte|makta|mesi|ması|mek|mak|me|ma)$/g, '')
    .replace(/(ildi|ıldı|üldü|uldu|ilmek|ılmak|ülmek|ulmak)$/g, '');

  // Turkish noun & postposition case / possessive suffixes (locative, dative, ablative, possessive)
  norm = norm
    .replace(/(sinden|sından|sünden|sundan|sinde|sında|sünde|sunda|sine|sına|süne|suna)$/g, '')
    .replace(/(nden|ndan|nten|ntan|nde|nda|nte|nta|ne|na)$/g, '')
    .replace(/(den|dan|ten|tan|de|da|te|ta|ye|ya|e|a)$/g, '')
    .replace(/(nin|nın|nün|nun|in|ın|ün|un)$/g, '')
    .replace(/(leri|ları|ler|lar)$/g, '')
    .replace(/(si|sı|sü|su|i|ı|ü|u)$/g, '')
    .trim();

  return norm;
}

function check(userInput, targetMeaning, englishWord = '') {
  const cleanInput = normalizeTr(userInput);
  const inputStem = getTrStem(cleanInput);
  const inputAscii = foldAscii(userInput);

  const rawTargetParts = (targetMeaning || '')
    .split(/[,\/;|•\n()]+/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0);

  for (const rawPart of rawTargetParts) {
    const partNorm = normalizeTr(rawPart);
    if (!partNorm) continue;
    const partAscii = foldAscii(rawPart);

    // Exact
    if (partNorm === cleanInput || partAscii === inputAscii) return true;

    // Stem
    const targetStem = getTrStem(partNorm);
    if (targetStem.length >= 3 && inputStem.length >= 3) {
      if (targetStem === inputStem || foldAscii(targetStem) === foldAscii(inputStem)) return true;
    }

    // Common prefix
    if (cleanInput.length >= 4 && partNorm.length >= 4) {
      let commonLen = 0;
      while (commonLen < cleanInput.length && commonLen < partNorm.length && cleanInput[commonLen] === partNorm[commonLen]) {
        commonLen++;
      }
      if (commonLen >= 4) {
        const inputRemainder = cleanInput.slice(commonLen);
        const targetRemainder = partNorm.slice(commonLen);
        const suffixRegex = /^(nde|nda|de|da|te|ta|ne|na|ye|ya|e|a|den|dan|ten|tan|nden|ndan|si|sı|sü|su|i|ı|ü|u|lik|lık|luk|lük|ler|lar)?$/;
        if (suffixRegex.test(inputRemainder) && suffixRegex.test(targetRemainder)) {
          return true;
        }
      }
    }
  }
  return false;
}

console.log('üzerinde vs "üzerine, yukarısında, yukarıda":', check('üzerinde', 'üzerine, yukarısında, yukarıda'));
console.log('ÜZERİNDE vs "üzerine, yukarısında, yukarıda":', check('ÜZERİNDE', 'üzerine, yukarısında, yukarıda'));
console.log('uzerinde vs "üzerine, yukarısında, yukarıda":', check('uzerinde', 'üzerine, yukarısında, yukarıda'));
console.log('yukarıda vs "üzerine, yukarısında, yukarıda":', check('yukarıda', 'üzerine, yukarısında, yukarıda'));
console.log('yukarısında vs "üzerine, yukarısında, yukarıda":', check('yukarısında', 'üzerine, yukarısında, yukarıda'));
console.log('altında vs "altına, aşağısında":', check('altında', 'altına, aşağısında'));
console.log('önünde vs "önüne":', check('önünde', 'önüne'));
console.log('elma vs "üzerine, yukarısında, yukarıda":', check('elma', 'üzerine, yukarısında, yukarıda'));
