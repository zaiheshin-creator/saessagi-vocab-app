import wordExtras from '../data/wordExtras.json';

// 800단어 중 일부만 이모지·예문을 직접 만들어뒀다. 없는 단어는
// 유닛 아이콘을 이모지로, 간단한 템플릿 문장을 예문으로 대신 쓴다.
export function withExtras(word) {
  const extra = wordExtras[word.no];
  if (extra) return { ...word, ...extra };
  return {
    ...word,
    emoji: word.unitIcon || '📘',
    example: `This is "${word.en}".`,
    exampleKr: `이것은 "${word.kr}"(이)라는 뜻이에요.`,
  };
}

export function speak(text) {
  if (!('speechSynthesis' in window)) return;
  window.speechSynthesis.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = 'en-US';
  u.rate = 0.9;
  window.speechSynthesis.speak(u);
}

export function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
