export type HskWeek = {
  title: string;
  stage: string;
  goal: string;
  topics: string[];
  explanation: string;
  examples: [string, string, string, string][];
  prompt: string;
  checkpoint: string;
  question: string;
  options: string[];
  answer: string;
};
// Original teaching material. These are study stages, not claims of complete exam coverage.
export const weeks: HskWeek[] = [
  {
    title: "Your first introduction",
    stage: "HSK 1 foundations",
    goal: "Introduce yourself and recognise the four tones.",
    topics: [
      "Pinyin initials and finals",
      "Four tones and the neutral tone",
      "I, you, he and she",
      "Names and nationalities",
      "Yes/no questions with 吗",
      "Introduce yourself aloud",
    ],
    explanation:
      "Mandarin syllables have tones that change meaning. Start by listening, then imitate. Use 是 to identify someone: subject + 是 + identity. Add 吗 to a statement to make a yes/no question. Do not add 吗 to a question that already uses 什么 or 谁.",
    examples: [
      [
        "我是学生。",
        "Wǒ shì xuésheng.",
        "I am a student.",
        "Saya seorang pelajar.",
      ],
      [
        "你是老师吗？",
        "Nǐ shì lǎoshī ma?",
        "Are you a teacher?",
        "Apakah kamu seorang guru?",
      ],
      [
        "你叫什么名字？",
        "Nǐ jiào shénme míngzi?",
        "What is your name?",
        "Siapa namamu?",
      ],
    ],
    prompt:
      "Say your name and whether you are a student. Ask someone their name. Repeat without looking.",
    checkpoint:
      "Introduce yourself in three sentences, distinguish four tone shapes, and recognise 20 familiar words without Pinyin.",
    question: "Which sentence asks ‘Are you a student?’",
    options: ["你是学生吗？", "你叫什么名字？", "我是学生。"],
    answer: "你是学生吗？",
  },
  {
    title: "People, numbers and things",
    stage: "HSK 1 foundations",
    goal: "Count, describe your family, and say what you have.",
    topics: [
      "Numbers 0–10",
      "Numbers 11–100",
      "Family and people",
      "Possession with 的",
      "Having and not having",
      "Measure words: 个 and 本",
    ],
    explanation:
      "Use 有 for ‘have’ and 没有 for ‘do not have’. 的 links an owner to a thing. A number usually needs a measure word before a noun: 一本书, one book. Use 两 rather than 二 before most measure words: 两个人, two people.",
    examples: [
      [
        "这是我的书。",
        "Zhè shì wǒ de shū.",
        "This is my book.",
        "Ini buku saya.",
      ],
      [
        "我有两本书。",
        "Wǒ yǒu liǎng běn shū.",
        "I have two books.",
        "Saya punya dua buku.",
      ],
      [
        "我没有哥哥。",
        "Wǒ méiyǒu gēge.",
        "I do not have an older brother.",
        "Saya tidak punya kakak laki-laki.",
      ],
    ],
    prompt:
      "Count five objects. Say who owns them and describe two family members.",
    checkpoint:
      "Understand spoken numbers up to 100 and describe three possessions using the correct measure words.",
    question: "How do you say ‘I do not have a book’?",
    options: ["我不是书。", "我没有书。", "我不有书。"],
    answer: "我没有书。",
  },
  {
    title: "Food, time and everyday places",
    stage: "HSK 1 foundations",
    goal: "Order a simple drink and describe your daily routine.",
    topics: [
      "Food and drinks",
      "Wanting with 想 and 要",
      "Today, tomorrow and yesterday",
      "Clock time and dates",
      "Locations with 在",
      "A simple daily routine",
    ],
    explanation:
      "Place time before the verb, often after the subject. 在 + place tells where something is or where an activity happens. 想 + verb expresses wanting to do something. Adjectives can be predicates without 是: 水很热 means the water is hot; 很 is often a neutral link here.",
    examples: [
      [
        "我想喝水。",
        "Wǒ xiǎng hē shuǐ.",
        "I would like to drink water.",
        "Saya ingin minum air.",
      ],
      [
        "我八点去学校。",
        "Wǒ bā diǎn qù xuéxiào.",
        "I go to school at eight.",
        "Saya pergi ke sekolah pukul delapan.",
      ],
      [
        "他在家吃饭。",
        "Tā zài jiā chī fàn.",
        "He eats at home.",
        "Dia makan di rumah.",
      ],
    ],
    prompt:
      "Describe when and where you eat. Order water politely, then say what you want to do tomorrow.",
    checkpoint:
      "Listen to a short introduction, identify who/where/when, then try official Level 1 sample tasks before moving on.",
    question: "Which means ‘I go to school at eight’?",
    options: ["我去八点学校。", "我八点去学校。", "八我点去学校。"],
    answer: "我八点去学校。",
  },
  {
    title: "Routines and abilities",
    stage: "Toward HSK 2",
    goal: "Talk about what you can do and what you are doing.",
    topics: [
      "Daily routines",
      "Frequency: 每天 and 常常",
      "Learned skills with 会",
      "Possibility with 能",
      "Permission with 可以",
      "Actions happening with 正在",
    ],
    explanation:
      "会 often means a learned skill; 能 describes ability or circumstances; 可以 often gives permission. 正在 before a verb emphasises an action in progress. 不 negates habits or intentions, while 没 usually negates completed events.",
    examples: [
      [
        "我会说一点儿汉语。",
        "Wǒ huì shuō yìdiǎnr Hànyǔ.",
        "I can speak a little Chinese.",
        "Saya bisa berbicara sedikit bahasa Mandarin.",
      ],
      [
        "他正在看书。",
        "Tā zhèngzài kàn shū.",
        "He is reading a book.",
        "Dia sedang membaca buku.",
      ],
      [
        "这里可以坐吗？",
        "Zhèlǐ kěyǐ zuò ma?",
        "May I sit here?",
        "Bolehkah saya duduk di sini?",
      ],
    ],
    prompt:
      "Say two things you can do, ask permission, and describe what someone is doing now.",
    checkpoint:
      "Answer five questions about your routine aloud without first translating each word.",
    question: "Which word best expresses a learned skill?",
    options: ["会", "正在", "每天"],
    answer: "会",
  },
  {
    title: "Shopping and comparing",
    stage: "Toward HSK 2",
    goal: "Ask prices and compare two choices.",
    topics: [
      "Prices and money",
      "Clothes and colours",
      "Comparisons with 比",
      "Too much with 太…了",
      "Requests and polite questions",
      "Choosing a purchase",
    ],
    explanation:
      "A + 比 + B + adjective compares two things. Do not insert 很 immediately before the adjective in this basic pattern. 多少钱 asks a price. 太 + adjective + 了 expresses an excessive degree or strong feeling; 了 here does not mean past tense.",
    examples: [
      [
        "这个多少钱？",
        "Zhège duōshao qián?",
        "How much is this?",
        "Berapa harga ini?",
      ],
      [
        "这本书比那本书便宜。",
        "Zhè běn shū bǐ nà běn shū piányi.",
        "This book is cheaper than that one.",
        "Buku ini lebih murah daripada buku itu.",
      ],
      ["太贵了！", "Tài guì le!", "It is too expensive!", "Terlalu mahal!"],
    ],
    prompt:
      "Imagine buying two books. Ask the prices, compare them, and explain your choice.",
    checkpoint:
      "Understand prices in a short shop dialogue and make three accurate comparisons.",
    question: "Which comparison is correct?",
    options: [
      "这本书比那本书便宜。",
      "这本书比那本书很便宜。",
      "比这本书便宜那本书。",
    ],
    answer: "这本书比那本书便宜。",
  },
  {
    title: "Plans and completed actions",
    stage: "Toward HSK 2",
    goal: "Describe yesterday and arrange tomorrow.",
    topics: [
      "Travel and transport",
      "Completed actions with 了",
      "Negating past events with 没",
      "Plans with 要",
      "Reasons with 因为…所以…",
      "Level 2 review",
    ],
    explanation:
      "Verb + 了 can mark an action as completed; Mandarin verbs do not conjugate for past tense. With 没 to deny completion, normally omit this 了. 因为 gives a reason and 所以 introduces its result. Use time words to make the timeline clear.",
    examples: [
      [
        "我昨天买了一本书。",
        "Wǒ zuótiān mǎi le yì běn shū.",
        "I bought a book yesterday.",
        "Saya membeli sebuah buku kemarin.",
      ],
      [
        "我昨天没去学校。",
        "Wǒ zuótiān méi qù xuéxiào.",
        "I did not go to school yesterday.",
        "Saya tidak pergi ke sekolah kemarin.",
      ],
      [
        "因为下雨，所以我不去。",
        "Yīnwèi xià yǔ, suǒyǐ wǒ bú qù.",
        "Because it is raining, I am not going.",
        "Karena hujan, saya tidak pergi.",
      ],
    ],
    prompt:
      "Say what you did yesterday and what you did not do. Arrange a meeting for tomorrow with a time and place.",
    checkpoint:
      "Try official Level 2 sample tasks. Review every missed item, then explain yesterday and tomorrow without a script.",
    question: "Which correctly negates ‘I went yesterday’?",
    options: ["我昨天不去了。", "我昨天没去。", "我昨天没去了。"],
    answer: "我昨天没去。",
  },
  {
    title: "Experiences and results",
    stage: "Toward HSK 3",
    goal: "Describe experiences and whether an action succeeded.",
    topics: [
      "Experiences with 过",
      "Never having done something",
      "Results with 完",
      "Understanding with 懂",
      "Finding with 到",
      "Tell a short experience",
    ],
    explanation:
      "Verb + 过 describes an experience at some time before now. 没 + verb + 过 denies that experience. A result complement follows the verb: 看完, finish reading; 听懂, understand what you hear. It tells the outcome, not just the activity.",
    examples: [
      [
        "我去过中国。",
        "Wǒ qù guo Zhōngguó.",
        "I have been to China.",
        "Saya pernah pergi ke Tiongkok.",
      ],
      [
        "我没吃过这个。",
        "Wǒ méi chī guo zhège.",
        "I have never eaten this.",
        "Saya belum pernah makan ini.",
      ],
      [
        "这本书我看完了。",
        "Zhè běn shū wǒ kàn wán le.",
        "I have finished reading this book.",
        "Saya sudah selesai membaca buku ini.",
      ],
    ],
    prompt:
      "Tell someone about a place you have visited and a food you have never tried. Say what you finished today.",
    checkpoint:
      "Distinguish completed events from life experiences and identify three result complements in reading.",
    question: "Which expresses ‘I have been to China’?",
    options: ["我去过中国。", "我要去中国。", "我正在去中国。"],
    answer: "我去过中国。",
  },
  {
    title: "Directions and getting things done",
    stage: "Toward HSK 3",
    goal: "Follow directions and describe movement.",
    topics: [
      "Left, right and straight ahead",
      "Distance with 离",
      "Coming and going",
      "Directional complements",
      "Sequences with 先…再…",
      "Ask for and give directions",
    ],
    explanation:
      "离 relates one place to another when describing distance. 来 indicates movement toward the speaker and 去 movement away. Combine a movement verb with direction: 走进去, walk in away from the speaker. 先…再… puts actions in sequence.",
    examples: [
      [
        "学校离我家很近。",
        "Xuéxiào lí wǒ jiā hěn jìn.",
        "The school is close to my home.",
        "Sekolah dekat dengan rumah saya.",
      ],
      ["请进来。", "Qǐng jìn lái.", "Please come in.", "Silakan masuk."],
      [
        "先往左走，再往右走。",
        "Xiān wǎng zuǒ zǒu, zài wǎng yòu zǒu.",
        "First go left, then go right.",
        "Pertama berjalan ke kiri, lalu ke kanan.",
      ],
    ],
    prompt:
      "Give directions from your home to a nearby shop. Include a sequence and a distance description.",
    checkpoint:
      "Follow a short spoken route and retell it using left/right, distance, and sequence words.",
    question: "Which word introduces distance from a place?",
    options: ["离", "过", "比"],
    answer: "离",
  },
  {
    title: "Descriptions and changes",
    stage: "Toward HSK 3",
    goal: "Describe how well you do something and what is changing.",
    topics: [
      "Manner with 得",
      "Duration of activities",
      "Change with sentence-final 了",
      "Increasing degree",
      "Health and feelings",
      "Describe a change",
    ],
    explanation:
      "得 links a verb to a description of its manner or degree: 说得很好. Sentence-final 了 can mark a new situation, rather than a completed action. 越来越 + adjective expresses increasing degree. Practise these patterns separately before combining them.",
    examples: [
      [
        "她说得很好。",
        "Tā shuō de hěn hǎo.",
        "She speaks very well.",
        "Dia berbicara dengan sangat baik.",
      ],
      [
        "天气越来越冷了。",
        "Tiānqì yuè lái yuè lěng le.",
        "The weather is getting colder and colder.",
        "Cuaca semakin dingin.",
      ],
      [
        "我不喝咖啡了。",
        "Wǒ bù hē kāfēi le.",
        "I no longer drink coffee.",
        "Saya tidak minum kopi lagi.",
      ],
    ],
    prompt:
      "Describe something you do well and something that has changed in your life. Explain how your Chinese is developing.",
    checkpoint:
      "Read a short description and distinguish ability, manner, and a change of situation.",
    question: "What does 我不喝咖啡了 mean?",
    options: [
      "I no longer drink coffee.",
      "I have never drunk coffee.",
      "I am drinking coffee.",
    ],
    answer: "I no longer drink coffee.",
  },
  {
    title: "Connect your ideas",
    stage: "Toward HSK 3",
    goal: "Explain choices, contrasts and conditions.",
    topics: [
      "Reasons and results",
      "Contrasts with 虽然…但是…",
      "Conditions with 如果…就…",
      "Alternatives with 还是",
      "Statements with 或者",
      "Write a connected message",
    ],
    explanation:
      "虽然…但是… connects a concession and a contrast. 如果…就… links a condition and its consequence. Use 还是 for alternatives in a choice question; use 或者 for alternatives in a statement. Learn whole example sentences, then substitute familiar words.",
    examples: [
      [
        "虽然很累，但是我很高兴。",
        "Suīrán hěn lèi, dànshì wǒ hěn gāoxìng.",
        "Although I am tired, I am happy.",
        "Walaupun lelah, saya senang.",
      ],
      [
        "如果明天下雨，我就不去。",
        "Rúguǒ míngtiān xià yǔ, wǒ jiù bú qù.",
        "If it rains tomorrow, I will not go.",
        "Jika besok hujan, saya tidak akan pergi.",
      ],
      [
        "你喝茶还是喝水？",
        "Nǐ hē chá háishi hē shuǐ?",
        "Will you have tea or water?",
        "Kamu mau minum teh atau air?",
      ],
    ],
    prompt:
      "Write a five-sentence message making a plan. Include a reason, an alternative, and a condition.",
    checkpoint:
      "Connect five sentences about a real plan and explain your choices aloud without reading.",
    question: "Which fills a choice question: 你喝茶___喝水？",
    options: ["还是", "或者", "虽然"],
    answer: "还是",
  },
  {
    title: "Read, listen and respond",
    stage: "HSK 3 consolidation",
    goal: "Use familiar language across longer everyday tasks.",
    topics: [
      "Read messages without Pinyin",
      "Listen for people and places",
      "Listen for times and reasons",
      "Reorder sentence parts",
      "Describe an everyday problem",
      "Retell a short passage",
    ],
    explanation:
      "Read once for the main point before checking unknown words. In listening, identify who, where, when and why. On the second pass, check details. Retell the meaning with language you know instead of translating every word. Keep a small error notebook with a corrected example for each recurring mistake.",
    examples: [
      [
        "我今天不舒服，想早点儿回家。",
        "Wǒ jīntiān bù shūfu, xiǎng zǎo diǎnr huí jiā.",
        "I feel unwell today and want to go home a little earlier.",
        "Saya kurang sehat hari ini dan ingin pulang sedikit lebih awal.",
      ],
      [
        "请你帮我买点儿水果。",
        "Qǐng nǐ bāng wǒ mǎi diǎnr shuǐguǒ.",
        "Please help me buy some fruit.",
        "Tolong bantu saya membeli sedikit buah.",
      ],
      [
        "我到家以后给你打电话。",
        "Wǒ dào jiā yǐhòu gěi nǐ dǎ diànhuà.",
        "I will call you after I get home.",
        "Saya akan meneleponmu setelah sampai di rumah.",
      ],
    ],
    prompt:
      "Listen to the examples with the text hidden. Retell the situation, then write a short reply.",
    checkpoint:
      "Try official HSK 3 sample tasks untimed. Group errors into vocabulary, listening, word order and meaning.",
    question: "When will the person call: 我到家以后给你打电话？",
    options: [
      "After arriving home",
      "Before leaving school",
      "Yesterday morning",
    ],
    answer: "After arriving home",
  },
  {
    title: "Check readiness and repair gaps",
    stage: "HSK 3 consolidation",
    goal: "Use evidence from practice tasks to choose your next step.",
    topics: [
      "Official sample: listening",
      "Official sample: reading",
      "Official sample: writing",
      "Spoken responses",
      "Repair your weakest skill",
      "Repeat missed questions",
    ],
    explanation:
      "Use the official sample and its instructions for timing and scoring. A familiar sample is not a fresh assessment: repeat errors for learning, but use unseen material to judge readiness. A calendar finishing does not establish proficiency. If listening or vocabulary is still fragile, repeat the relevant weeks and continue reviewing.",
    examples: [
      [
        "我还需要多练习听力。",
        "Wǒ hái xūyào duō liànxí tīnglì.",
        "I still need more listening practice.",
        "Saya masih perlu lebih banyak latihan menyimak.",
      ],
      [
        "请再说一遍。",
        "Qǐng zài shuō yí biàn.",
        "Please say it once more.",
        "Tolong katakan sekali lagi.",
      ],
      [
        "我每天都复习学过的词。",
        "Wǒ měi tiān dōu fùxí xué guo de cí.",
        "I review the words I have learned every day.",
        "Saya mengulang kata-kata yang sudah saya pelajari setiap hari.",
      ],
    ],
    prompt:
      "Complete fresh official practice tasks. Write down your results and three specific gaps. Arrange human feedback on your spoken responses if preparing for an exam.",
    checkpoint:
      "Assess all tested skills with the current official sample and scoring guidance. Choose exam preparation or another consolidation cycle based on the result.",
    question: "What is the best evidence of readiness?",
    options: [
      "Finishing 90 calendar days",
      "Remembering the same sample answers",
      "Performing reliably on unseen tasks across skills",
    ],
    answer: "Performing reliably on unseen tasks across skills",
  },
];
export const dayModes = [
  "Meet the topic",
  "Listen and imitate",
  "Build sentences",
  "Read and recall",
  "Write and speak",
  "Use it in context",
  "Weekly checkpoint",
];
export const taskNames = [
  "Review & vocabulary",
  "Today’s lesson",
  "Listen & respond",
  "Write & recall",
];
export const HSK_DAYS = 90;
export function planDay(start: string, now = new Date()) {
  const [y, m, d] = start.split("-").map(Number);
  const elapsed = Math.floor(
    (Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) -
      Date.UTC(y, m - 1, d)) /
      86400000,
  );
  return Math.max(1, Math.min(HSK_DAYS, elapsed + 1));
}
export function dateAfter(start: string, days: number) {
  const [y, m, d] = start.split("-").map(Number);
  const date = new Date(y, m - 1, d + days, 12);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
export function dayWeek(day: number) {
  return weeks[Math.min(11, Math.floor((day - 1) / 7))];
}
export function taskKey(day: number, task: number) {
  return `day-${day}-${task}`;
}
export const officialSyllabus = "https://www.chinesetest.cn/syllabus";
