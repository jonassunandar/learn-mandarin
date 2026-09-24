import { symbols } from "./symbols";
export type Reading = {
  hanzi: string;
  zhuyin: string;
  pinyin: string;
  meaning: string;
  meaningId: string;
  note?: string;
};
export type Check = {
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
};
export type Lesson = {
  id: string;
  title: string;
  level: "Beginner" | "Developing" | "Intermediate";
  goal: string;
  paragraphs: string[];
  symbols: string[];
  examples: Reading[];
  checks: Check[];
};
const r = (
  hanzi: string,
  zhuyin: string,
  pinyin: string,
  meaning: string,
  meaningId: string,
  note?: string,
): Reading => ({ hanzi, zhuyin, pinyin, meaning, meaningId, note });
function q(
  prompt: string,
  answer: string,
  distractors: string[],
  explanation: string,
): Check {
  const options = [...distractors];
  options.splice(prompt.length % (options.length + 1), 0, answer);
  return { prompt, answer, options, explanation };
}
function group(
  id: string,
  title: string,
  chars: string,
  goal: string,
  paragraphs: string[],
): Lesson {
  const selected = Array.from(chars).map((c) =>
    symbols.find((s) => s.symbol === c)!,
  );
  return {
    id,
    title,
    level: "Beginner",
    goal,
    paragraphs,
    symbols: Array.from(chars),
    examples: selected.map((s) =>
      r(s.example, s.zhuyin, s.examplePinyin, s.meaning, s.meaningId),
    ),
    checks: selected.slice(0, 3).map((s, i) =>
      q(
        `Which symbol corresponds to Pinyin ${s.pinyin}?`,
        s.symbol,
        selected
          .filter((_, j) => j !== i)
          .slice(0, 2)
          .map((s) => s.symbol),
        `${s.symbol} corresponds to ${s.pinyin}. ${s.tip}`,
      ),
    ),
  };
}
export const lessons: Lesson[] = [
  group(
    "first-symbols",
    "Your first four sounds",
    "ㄅㄆㄇㄈ",
    "Recognize ㄅ ㄆ ㄇ ㄈ and hear how they differ.",
    [
      "Bopomofo, also called Zhuyin (注音), is a way to write Mandarin sounds. Its name comes from the first four symbols. The modern system has 37 symbols. A symbol represents a sound, not a word or a meaning.",
      "Start with the mouth: ㄅ and ㄆ both begin with closed lips. ㄆ has a stronger puff of air. ㄇ is a hum through the nose; ㄈ uses the upper teeth against the lower lip. Hold a hand in front of your mouth to feel the difference.",
      "Tap a symbol to hear its teaching pronunciation, watch its strokes, and write it. Consonant recordings use a supporting vowel so you can hear them; do not add that vowel when combining sounds. Pinyin b is a sound hint, not the English letter name bee.",
    ],
  ),
  group(
    "open-vowels",
    "Give the sounds a voice",
    "ㄚㄛㄜㄝ",
    "Distinguish four vowel symbols and read a first syllable.",
    [
      "A vowel lets the breath flow freely. ㄚ is open; ㄛ uses rounded lips. ㄜ and ㄝ are different: ㄜ is farther back, while ㄝ is a more open front vowel. The recordings are more useful than English approximations.",
      "Blend, rather than spell out, ㄇ + ㄚ → ㄇㄚ (mā). Two symbols here make one syllable. Mandarin syllables can also start directly with a vowel.",
      "ㄝ is often combined with ㄧ or ㄩ: ㄧㄝ is ye and ㄩㄝ is yue in Pinyin. Do not replace ㄜ with ㄝ just because Pinyin uses e in both places.",
    ],
  ),
  {
    id: "tones",
    title: "Four tones and a light syllable",
    level: "Beginner",
    goal: "Read the tone mark as part of every syllable.",
    symbols: [],
    paragraphs: [
      "Tone is the pitch pattern of a syllable. The same consonants and vowels can mean different things when the tone changes. First tone is high and level; second rises; third is low (with a dip and rise when said carefully alone); fourth falls sharply.",
      "In this course’s horizontal Zhuyin, first tone has no mark. Put ˊ, ˇ, or ˋ after the syllable for tones 2, 3, or 4. The neutral-tone dot ˙ goes before the syllable. It means short and light, not a fixed fifth pitch.",
      "Read ㄇㄚ, ㄇㄚˊ, ㄇㄚˇ, ㄇㄚˋ, ˙ㄇㄚ. These are mā, má, mǎ, mà, ma. A missing mark means first tone, not neutral tone. In vertical print the neutral dot sits above the symbol stack.",
    ],
    examples: [
      r("妈", "ㄇㄚ", "mā", "mother", "ibu"),
      r("麻", "ㄇㄚˊ", "má", "hemp / numb", "rami / kebas"),
      r("马", "ㄇㄚˇ", "mǎ", "horse", "kuda"),
      r("骂", "ㄇㄚˋ", "mà", "scold", "memarahi"),
      r("吗", "˙ㄇㄚ", "ma", "question particle", "partikel tanya"),
    ],
    checks: [
      q(
        "Which syllable is third tone?",
        "ㄇㄚˇ",
        ["ㄇㄚˊ", "ㄇㄚˋ"],
        "The caron ˇ marks third tone.",
      ),
      q(
        "Which syllable has a neutral tone?",
        "˙ㄇㄚ",
        ["ㄇㄚ", "ㄇㄚˊ"],
        "The dot comes before a horizontal neutral-tone syllable.",
      ),
      q(
        "What does ㄇㄚ without a tone mark mean?",
        "First tone",
        ["Neutral tone", "Tone is unknown"],
        "First tone is normally left unmarked in Zhuyin.",
      ),
    ],
  },
  group(
    "tongue-tip",
    "Sounds behind the teeth",
    "ㄉㄊㄋㄌ",
    "Separate ㄉ / ㄊ and ㄋ / ㄌ.",
    [
      "Touch the ridge just behind your upper teeth with your tongue tip. ㄉ and ㄊ start there: ㄉ has little puff; ㄊ has a clear puff. Mandarin contrasts the air release, so do not rely only on an English d/t comparison.",
      "ㄋ lets the voice resonate through the nose. ㄌ lets air pass around the tongue. Try alternating ㄋㄚ and ㄌㄚ slowly, keeping the vowel the same.",
      "Notice how a consonant, vowel, and tone work together: ㄉㄚˋ is dà, ‘big’. Always include the tone when you practise a full syllable.",
    ],
  ),
  group(
    "back-sounds",
    "Sounds at the back",
    "ㄍㄎㄏ",
    "Recognize g, k, and h without confusing their air release.",
    [
      "For ㄍ and ㄎ, the back of the tongue briefly meets the soft palate. Release gently for ㄍ and with a puff for ㄎ. ㄏ keeps air flowing through a narrowed space at the back.",
      "Compare ㄍㄜ (gē), ㄎㄜ (kē), and ㄏㄜ (hē). Keep the vowel and tone steady so you can focus on the beginning.",
      "Learn each symbol’s shape separately. Read it aloud before copying, then hide the model and write once from memory.",
    ],
  ),
  group(
    "three-medials",
    "The three bridge sounds",
    "ㄧㄨㄩ",
    "Hear i, u, and ü and use them as syllable bridges.",
    [
      "ㄧ, ㄨ, and ㄩ can be vowels on their own or bridge sounds (medials) inside a syllable. ㄧ is a front vowel with unrounded lips; ㄨ is farther back with rounded lips.",
      "For ㄩ, say an i-like vowel and round your lips while keeping the tongue forward. It is not the same as ㄨ. Pinyin normally shows this sound with ü, although its dots disappear in some spellings.",
      "With no starting consonant, ㄧ, ㄨ, and ㄩ are written yi, wu, and yu in Pinyin. Zhuyin does not need extra symbols for the written y and w.",
    ],
  ),
  group(
    "front-sounds",
    "The j, q, x family",
    "ㄐㄑㄒ",
    "Recognize front-of-tongue sounds before ㄧ and ㄩ.",
    [
      "Keep the tongue tip down near the lower teeth and raise the front of the tongue toward the hard palate. ㄐ begins with a brief closure and little puff. ㄑ adds a puff. ㄒ is continuous friction.",
      "These initials combine with ㄧ or ㄩ sounds. Compare ㄐㄧ (jī), ㄑㄧ (qī), and ㄒㄧ (xī), then ㄐㄩ (jū), ㄑㄩ (qū), and ㄒㄩ (xū).",
      "The u after Pinyin j, q, or x represents ü. Thus ju is ㄐㄩ, not ㄐㄨ. Keep this distinction in mind when moving from Pinyin to Zhuyin.",
    ],
  ),
  group(
    "raised-tongue",
    "The zh, ch, sh, r family",
    "ㄓㄔㄕㄖ",
    "Read the raised-tongue initials and their standalone syllables.",
    [
      "Raise the tongue tip toward the roof of the mouth, farther back than for ㄗ ㄘ ㄙ. Avoid pressing hard or curling excessively. Regional Mandarin accents differ in how strongly these sounds are distinguished.",
      "ㄓ has little puff, ㄔ has a puff, ㄕ has continuous friction, and ㄖ is voiced. Use the recordings as a guide rather than English spelling.",
      "Pinyin zhi, chi, shi, and ri do not use the same i vowel as yi. Zhuyin writes these syllables with the initial alone: ㄓ, ㄔ, ㄕ, ㄖ, plus a tone mark when needed. Do not add ㄧ.",
    ],
  ),
  group(
    "near-teeth",
    "The z, c, s family",
    "ㄗㄘㄙ",
    "Keep the tongue forward and distinguish these from zh, ch, sh.",
    [
      "For ㄗ ㄘ ㄙ, keep the tongue near the teeth rather than raised back toward the roof. ㄗ has little puff; ㄘ has a puff; ㄙ is continuous friction.",
      "Pinyin zi, ci, and si are written ㄗ, ㄘ, and ㄙ in Zhuyin. Their i is not ㄧ. 四 sì is ㄙˋ, not ㄙㄧˋ.",
      "Alternate ㄗ / ㄓ, ㄘ / ㄔ, and ㄙ / ㄕ. Use a slow pace and notice tongue position. Accent differences exist, but learning the standard contrast helps you read accurately.",
    ],
  ),
  group(
    "gliding-vowels",
    "Vowels that glide",
    "ㄞㄟㄠㄡ",
    "Read ai, ei, ao, and ou as one syllable ending.",
    [
      "Each of these symbols represents a vowel glide: the mouth moves during the sound. ㄞ is ai, ㄟ is ei, ㄠ is ao, and ㄡ is ou. Keep each glide within a single syllable.",
      "Blend ㄏ + ㄠ + ˇ → ㄏㄠˇ (hǎo). You do not spell ao using separate ㄚ and ㄛ symbols: ㄠ already represents the whole ending.",
      "Compare ㄞ / ㄟ and ㄠ / ㄡ. Start slowly, then blend naturally without adding an extra syllable between the sounds.",
    ],
  ),
  group(
    "nasal-endings",
    "Nasal endings and ㄦ",
    "ㄢㄣㄤㄥㄦ",
    "Distinguish n from ng and finish the 37-symbol chart.",
    [
      "ㄢ (an) and ㄣ (en) end with n: the tongue tip touches behind the upper teeth. ㄤ (ang) and ㄥ (eng) end with ng: the back of the tongue rises. Do not pronounce a separate g after ng.",
      "The vowel can change when a medial comes before it. ㄧㄣ is in, ㄧㄥ is ing, and ㄨㄥ after a consonant corresponds to ong. Learn the combined syllable by ear, not by adding English letter sounds.",
      "ㄦ is er, a vowel with an r-like quality. It can stand alone, as in ㄦˋ (èr, two). It also appears in erhua, the r-colored ending used in some Mandarin varieties; that is different from adding a full new syllable.",
    ],
  ),
  {
    id: "blend-syllables",
    title: "Build a syllable",
    level: "Developing",
    goal: "Combine an initial and a vowel, then attach the tone.",
    symbols: [],
    paragraphs: [
      "A Mandarin syllable may have an initial consonant, a medial, a final, and a tone. Some parts are absent. Start by reading two-symbol syllables as one continuous unit.",
      "Read the symbols in order, then apply the tone to the whole syllable: ㄋ + ㄧ + ˇ → ㄋㄧˇ. The tone mark is not a separate sound. Space separates syllables in our course examples.",
      "Try the Zhuyin first. Reveal Pinyin only after you have attempted to say it. Match the result to the audio, and repeat the complete syllable.",
    ],
    examples: [
      r("你", "ㄋㄧˇ", "nǐ", "you", "kamu"),
      r("我", "ㄨㄛˇ", "wǒ", "I / me", "saya"),
      r("喝", "ㄏㄜ", "hē", "drink", "minum"),
    ],
    checks: [
      q(
        "Combine ㄋ + ㄧ + third tone.",
        "ㄋㄧˇ",
        ["ㄋㄧˊ", "ㄌㄧˇ"],
        "ㄋ is n, ㄧ is i, and ˇ gives nǐ.",
      ),
      q(
        "How many syllables are in ㄋㄧˇ ㄏㄠˇ?",
        "Two",
        ["Four", "One"],
        "Each space-separated group is a syllable: nǐ and hǎo.",
      ),
      q(
        "Which reading is wǒ?",
        "ㄨㄛˇ",
        ["ㄨㄛˋ", "ㄇㄛˇ"],
        "ㄨ + ㄛ gives wo; ˇ marks third tone.",
      ),
    ],
  },
  {
    id: "three-symbols",
    title: "Read three-symbol syllables",
    level: "Developing",
    goal: "Blend a consonant, a medial, and a final.",
    symbols: [],
    paragraphs: [
      "A medial bridges the beginning and ending. In ㄒㄧㄠˇ (xiǎo), ㄒ is the initial, ㄧ is the medial, ㄠ is the final, and ˇ is the tone. All three symbols still form one syllable.",
      "Compare ㄍㄚ and ㄍㄨㄚ: ㄨ adds a rounded glide. Compare ㄐㄧㄚ and ㄐㄧㄠ: the final changes from a to ao. Read through the sequence without pausing between symbols.",
      "Not every possible symbol combination is a Mandarin syllable. Learn useful combinations from real words rather than inventing arbitrary strings.",
    ],
    examples: [
      r("小", "ㄒㄧㄠˇ", "xiǎo", "small", "kecil"),
      r("家", "ㄐㄧㄚ", "jiā", "home", "rumah"),
      r("光", "ㄍㄨㄤ", "guāng", "light", "cahaya"),
    ],
    checks: [
      q(
        "What is the medial in ㄒㄧㄠˇ?",
        "ㄧ",
        ["ㄒ", "ㄠ"],
        "ㄧ connects the initial ㄒ with the final ㄠ.",
      ),
      q(
        "Choose the reading for jiā.",
        "ㄐㄧㄚ",
        ["ㄐㄧㄠ", "ㄐㄩㄚ"],
        "ㄐ + ㄧ + ㄚ blends into jiā.",
      ),
      q(
        "How many syllables are in ㄍㄨㄤ?",
        "One",
        ["Two", "Three"],
        "Three symbols can belong to one Mandarin syllable.",
      ),
    ],
  },
  {
    id: "pinyin-bridges",
    title: "When Pinyin hides the pieces",
    level: "Developing",
    goal: "Read iu, ui, un, and the y/w spellings.",
    symbols: [],
    paragraphs: [
      "Pinyin shortens some finals after an initial: iou becomes iu, uei becomes ui, and uen becomes un. Zhuyin keeps the pieces visible: ㄧㄡ, ㄨㄟ, and ㄨㄣ.",
      "六 liù is ㄌㄧㄡˋ; 水 shuǐ is ㄕㄨㄟˇ; 论 lùn is ㄌㄨㄣˋ. Do not mistake Pinyin iu for just ㄧㄨ, or ui for just ㄨㄧ.",
      "At the start of a syllable, Pinyin uses y and w spelling conventions: you = ㄧㄡ, wei = ㄨㄟ, wen = ㄨㄣ. They do not require separate y or w symbols.",
    ],
    examples: [
      r("六", "ㄌㄧㄡˋ", "liù", "six", "enam"),
      r("水", "ㄕㄨㄟˇ", "shuǐ", "water", "air"),
      r("有", "ㄧㄡˇ", "yǒu", "have", "punya"),
    ],
    checks: [
      q(
        "Which ending corresponds to Pinyin iu?",
        "ㄧㄡ",
        ["ㄧㄨ", "ㄨㄧ"],
        "Pinyin iu is the contracted spelling of iou after a consonant.",
      ),
      q(
        "Choose the reading for shuǐ.",
        "ㄕㄨㄟˇ",
        ["ㄕㄨㄧˇ", "ㄒㄨㄟˇ"],
        "ㄕ + ㄨ + ㄟ with third tone gives shuǐ.",
      ),
      q(
        "How is Pinyin wen written in Zhuyin, without tone?",
        "ㄨㄣ",
        ["ㄨㄥ", "ㄩㄣ"],
        "The initial w in this Pinyin spelling does not need its own Zhuyin symbol.",
      ),
    ],
  },
  {
    id: "rounded-front-vowel",
    title: "Follow the hidden ü",
    level: "Developing",
    goal: "Recognize ㄩ even when Pinyin drops the dots.",
    symbols: [],
    paragraphs: [
      "After j, q, and x, Pinyin writes u for the ü sound because the plain u sound does not occur there. ju, qu, xu therefore use ㄩ. In nü and lü, the dots stay because nu and lu are different syllables.",
      "ㄩㄝ is written yue without an initial and ue after j, q, x. ㄩㄣ is yun on its own and un after j, q, x. ㄩㄢ is yuan on its own and uan after j, q, x.",
      "Compare ㄋㄨˇ (nǔ) and ㄋㄩˇ (nǚ). Keep the tongue forward for ㄩ. In ㄩㄢ, the vowel is more fronted than a simple English a; use the whole spoken syllable as your model.",
    ],
    examples: [
      r("女", "ㄋㄩˇ", "nǚ", "female / woman", "perempuan"),
      r("学", "ㄒㄩㄝˊ", "xué", "learn", "belajar"),
      r("去", "ㄑㄩˋ", "qù", "go", "pergi"),
      r("月", "ㄩㄝˋ", "yuè", "month / moon", "bulan"),
    ],
    checks: [
      q(
        "Which reading is qù?",
        "ㄑㄩˋ",
        ["ㄑㄨˋ", "ㄎㄨˋ"],
        "Pinyin qu uses ü, represented by ㄩ.",
      ),
      q(
        "Choose xué.",
        "ㄒㄩㄝˊ",
        ["ㄒㄨㄜˊ", "ㄒㄧㄝˊ"],
        "xue = ㄒ + ㄩ + ㄝ, with second tone.",
      ),
      q(
        "Which Pinyin spelling keeps the dots on ü?",
        "nǚ",
        ["qù", "yuè"],
        "After n and l, ü must be distinguished from plain u.",
      ),
    ],
  },
  {
    id: "sound-contrasts",
    title: "Hear the small differences",
    level: "Intermediate",
    goal: "Keep aspiration, tongue position, and nasal endings distinct.",
    symbols: [],
    paragraphs: [
      "Practise contrasts while keeping the rest of a syllable steady. ㄅ / ㄆ, ㄉ / ㄊ, ㄍ / ㄎ, ㄐ / ㄑ, ㄓ / ㄔ, and ㄗ / ㄘ differ in aspiration: a stronger puff for the second member.",
      "For ㄗ / ㄓ, ㄘ / ㄔ, and ㄙ / ㄕ, focus on tongue position instead. For ㄢ / ㄤ and ㄣ / ㄥ, focus on the end of the syllable: tongue tip for n, tongue back for ng.",
      "ㄧㄣ (in) and ㄧㄥ (ing) also differ at the ending. ㄨㄥ is weng when it stands alone, but corresponds to ong after an initial, as in ㄓㄨㄥ (zhōng). ㄩㄥ corresponds to iong after j, q, x and yong without an initial.",
    ],
    examples: [
      r("三", "ㄙㄢ", "sān", "three", "tiga"),
      r("山", "ㄕㄢ", "shān", "mountain", "gunung"),
      r("心", "ㄒㄧㄣ", "xīn", "heart", "hati"),
      r("星", "ㄒㄧㄥ", "xīng", "star", "bintang"),
      r("中", "ㄓㄨㄥ", "zhōng", "middle", "tengah"),
    ],
    checks: [
      q(
        "Which pair contrasts n and ng endings?",
        "ㄒㄧㄣ / ㄒㄧㄥ",
        ["ㄅㄚ / ㄆㄚ", "ㄙㄢ / ㄕㄢ"],
        "xīn and xīng differ in their nasal ending.",
      ),
      q(
        "Which initial has a stronger puff of air?",
        "ㄆ",
        ["ㄅ", "ㄇ"],
        "ㄆ is the aspirated partner of ㄅ.",
      ),
      q(
        "Choose the reading for zhōng.",
        "ㄓㄨㄥ",
        ["ㄓㄨㄣ", "ㄗㄨㄥ"],
        "After an initial, ㄨㄥ corresponds to Pinyin ong.",
      ),
    ],
  },
  {
    id: "tone-changes",
    title: "Written tones, spoken tones",
    level: "Intermediate",
    goal: "Understand why connected speech can sound different from the written tones.",
    symbols: [],
    paragraphs: [
      "We show dictionary tones in Zhuyin and Pinyin unless a note explicitly labels a spoken form. In speech, when two third tones are adjacent within a phrase, the first is pronounced like second tone. Thus 你好 is written nǐ hǎo but commonly said ní hǎo.",
      "Third tone before a first, second, or fourth tone is usually low, without a full rise. Longer runs of third tones depend on word grouping; do not apply a blanket rule to every syllable in a long sentence.",
      "不 bù becomes bú before a fourth tone: 不是 is commonly said bú shì. 一 yī becomes yí before a fourth tone, and yì before first, second, or third tones. When counting, used alone, or in an ordinal such as 第一, 一 keeps yī.",
    ],
    examples: [
      r(
        "你好",
        "ㄋㄧˇ ㄏㄠˇ",
        "nǐ hǎo",
        "hello",
        "halo",
        "Spoken cue: ní hǎo → ㄋㄧˊ ㄏㄠˇ. The first third tone changes.",
      ),
      r(
        "不是",
        "ㄅㄨˋ ㄕˋ",
        "bù shì",
        "is not",
        "bukan",
        "Spoken cue: bú shì → ㄅㄨˊ ㄕˋ.",
      ),
      r(
        "一天",
        "ㄧ ㄊㄧㄢ",
        "yī tiān",
        "one day",
        "satu hari",
        "Spoken cue: yì tiān → ㄧˋ ㄊㄧㄢ.",
      ),
      r(
        "一个",
        "ㄧ ㄍㄜˋ",
        "yī gè",
        "one (item)",
        "satu (buah)",
        "When 个 has fourth tone, spoken cue: yí gè → ㄧˊ ㄍㄜˋ. 个 can be light in some speech.",
      ),
    ],
    checks: [
      q(
        "How is 你好 commonly pronounced in connected speech?",
        "ní hǎo",
        ["nǐ hào", "nì hǎo"],
        "The first of two adjacent third tones changes to second tone.",
      ),
      q(
        "How is 不 commonly pronounced before 是 shì?",
        "bú",
        ["bù", "bǔ"],
        "不 changes to second tone before a fourth-tone syllable.",
      ),
      q(
        "In counting 一、二、三, what tone does 一 keep?",
        "First tone",
        ["Second tone", "Fourth tone"],
        "一 keeps its original first tone when counting.",
      ),
    ],
  },
  {
    id: "neutral-and-er",
    title: "Light syllables and r endings",
    level: "Intermediate",
    goal: "Read the neutral dot and recognize erhua without adding a syllable.",
    symbols: [],
    paragraphs: [
      "A neutral syllable is short and unstressed. Its actual pitch depends partly on the preceding tone. In horizontal Zhuyin the dot comes first: ˙ㄇㄚ. Do not read it as first tone.",
      "Words and regions differ in how often they use neutral tone. 我们 is shown here with light men; some Taiwanese pronunciations give the second syllable a full tone. The purpose is to learn the notation, not to label one regional accent as wrong.",
      "ㄦ can be a whole syllable, as in 二 ㄦˋ. In erhua it instead colors the preceding syllable with an r-like ending. 哪儿 nǎr is one syllable, written ㄋㄚˇㄦ here, with the tone before the added ㄦ. 哪里 nǎlǐ is an alternative without erhua.",
    ],
    examples: [
      r("我们", "ㄨㄛˇ ˙ㄇㄣ", "wǒmen", "we / us", "kami / kita"),
      r("吗", "˙ㄇㄚ", "ma", "question particle", "partikel tanya"),
      r(
        "哪儿",
        "ㄋㄚˇㄦ",
        "nǎr",
        "where",
        "di mana",
        "One syllable with an r-colored ending; compare 哪里 nǎlǐ.",
      ),
    ],
    checks: [
      q(
        "Where is the neutral dot placed in horizontal Zhuyin?",
        "Before the syllable",
        ["After the syllable", "It is omitted"],
        "The horizontal neutral-tone dot precedes the symbol group.",
      ),
      q(
        "How many syllables are in 哪儿 nǎr?",
        "One",
        ["Two", "Three"],
        "The r ending modifies nǎ rather than adding a full er syllable.",
      ),
      q(
        "Is a neutral tone always the same pitch?",
        "No, context affects its pitch",
        ["Yes, always high", "Yes, always rising"],
        "Neutral tone is defined by reduced stress and duration; its pitch is context-dependent.",
      ),
    ],
  },
  {
    id: "read-phrases",
    title: "Read words without Pinyin",
    level: "Intermediate",
    goal: "Decode familiar words directly from Zhuyin.",
    symbols: [],
    paragraphs: [
      "Read one syllable group at a time, include its tone, then join the groups naturally. Try the Zhuyin before revealing the Pinyin and meaning below it.",
      "Keep dictionary tones distinct from spoken changes. In 你好, the first written third tone changes in connected speech. Other combinations, such as 喝水 hē shuǐ, keep their basic tone categories.",
      "These examples keep Hanzi100’s Simplified Chinese. Zhuyin represents pronunciation, so it can annotate Simplified or Traditional characters. It is especially common alongside Traditional Chinese in Taiwan.",
    ],
    examples: [
      r("你好", "ㄋㄧˇ ㄏㄠˇ", "nǐ hǎo", "hello", "halo"),
      r("喝水", "ㄏㄜ ㄕㄨㄟˇ", "hē shuǐ", "drink water", "minum air"),
      r("学习", "ㄒㄩㄝˊ ㄒㄧˊ", "xué xí", "study / learn", "belajar"),
      r("今天", "ㄐㄧㄣ ㄊㄧㄢ", "jīn tiān", "today", "hari ini"),
    ],
    checks: [
      q(
        "Read ㄏㄜ ㄕㄨㄟˇ.",
        "hē shuǐ",
        ["hē shǔ", "hé shuì"],
        "ㄕㄨㄟ is shui; ˇ marks third tone.",
      ),
      q(
        "Which word is ㄒㄩㄝˊ ㄒㄧˊ?",
        "学习 · study",
        ["今天 · today", "你好 · hello"],
        "ㄒㄩㄝˊ is xué and ㄒㄧˊ is xí.",
      ),
      q(
        "Read ㄐㄧㄣ ㄊㄧㄢ.",
        "jīn tiān",
        ["jīng tiān", "jìn tián"],
        "ㄧㄣ is in, not ing; both syllables are first tone.",
      ),
    ],
  },
  {
    id: "independent-reading",
    title: "Your first independent reading",
    level: "Intermediate",
    goal: "Read short sentences and choose what to revisit.",
    symbols: [],
    paragraphs: [
      "Start with the Zhuyin only. Read each sentence aloud slowly, then reveal the Hanzi, Pinyin, and meanings to check yourself. Sentence punctuation marks a pause, not an extra tone.",
      "If a group is difficult, break it into initial, medial, final, and tone. Revisit the 37-symbol chart for shape or sound confusion, and the bridge lessons for Pinyin spelling differences.",
      "Finishing this course means you have worked through the reading system, not that every sound is mastered. Re-read unfamiliar groups, write the symbols you confuse, and listen again. Continue vocabulary practice to make the notation useful.",
    ],
    examples: [
      r(
        "我喝水。",
        "ㄨㄛˇ ㄏㄜ ㄕㄨㄟˇ。",
        "Wǒ hē shuǐ.",
        "I drink water.",
        "Saya minum air.",
      ),
      r(
        "他在家。",
        "ㄊㄚ ㄗㄞˋ ㄐㄧㄚ。",
        "Tā zài jiā.",
        "He is at home.",
        "Dia ada di rumah.",
      ),
      r(
        "你去哪里？",
        "ㄋㄧˇ ㄑㄩˋ ㄋㄚˇ ㄌㄧˇ？",
        "Nǐ qù nǎlǐ?",
        "Where are you going?",
        "Kamu mau pergi ke mana?",
        "The adjacent third tones in 哪里 usually sound ná lǐ.",
      ),
    ],
    checks: [
      q(
        "What does ㄨㄛˇ ㄏㄜ ㄕㄨㄟˇ mean?",
        "I drink water.",
        ["He is at home.", "Where are you going?"],
        "ㄨㄛˇ = I, ㄏㄜ = drink, ㄕㄨㄟˇ = water.",
      ),
      q(
        "Which group reads zài jiā?",
        "ㄗㄞˋ ㄐㄧㄚ",
        ["ㄓㄞˋ ㄐㄧㄚ", "ㄗㄞˊ ㄐㄧㄠ"],
        "z is ㄗ, ai is ㄞ, and jia is ㄐㄧㄚ.",
      ),
      q(
        "In ㄋㄧˇ ㄑㄩˋ ㄋㄚˇ ㄌㄧˇ, which group means go?",
        "ㄑㄩˋ",
        ["ㄋㄧˇ", "ㄋㄚˇ ㄌㄧˇ"],
        "ㄑㄩˋ is qù, go. The u in Pinyin qu represents ㄩ.",
      ),
    ],
  },
];
