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

console.log('üzerinde stem:', getTrStem('üzerinde'));
console.log('üzerine stem:', getTrStem('üzerine'));
console.log('üzerinden stem:', getTrStem('üzerinden'));
console.log('yukarısında stem:', getTrStem('yukarısında'));
console.log('yukarıda stem:', getTrStem('yukarıda'));
console.log('altında stem:', getTrStem('altında'));
console.log('altına stem:', getTrStem('altına'));
console.log('gözlemlemek stem:', getTrStem('gözlemlemek'));
console.log('gözlem stem:', getTrStem('gözlem'));
