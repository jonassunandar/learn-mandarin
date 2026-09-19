export function speakMandarin(text: string): boolean {
  if (typeof window === "undefined" || !("speechSynthesis" in window))
    return false;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = 0.8;
  const voices = window.speechSynthesis.getVoices();
  const voice =
    voices.find((v) => /^zh[-_]CN/i.test(v.lang)) ??
    voices.find((v) => /^zh/i.test(v.lang));
  if (voice) utterance.voice = voice;
  window.speechSynthesis.speak(utterance);
  return true;
}
