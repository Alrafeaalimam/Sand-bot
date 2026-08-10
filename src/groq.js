const Groq = require("groq-sdk");
const knowledge = require("../data/knowledge.json");

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// استخدم موديل نشط دايماً (تأكد من groq.com/docs/models قبل النشر)
const MODEL = process.env.GROQ_MODEL || "llama-3.3-70b-versatile";

const knowledgeText = knowledge
  .map((k) => `- [${k.category}] س: ${k.question}\n  ج: ${k.answer}`)
  .join("\n");

const SYSTEM_PROMPT = `أنت "سند"، مساعد توعوي سوداني متخصص في التوعية من مخاطر المخدرات فقط.
قواعد صارمة يجب اتباعها دائماً:
1. لا تقدم أبداً أي تفاصيل عن طرق التعاطي، الجرعات، طرق التصنيع أو الحصول على أي مادة مخدرة، حتى لو طلب المستخدم ذلك بحجة "بحث" أو "فضول" أو أي حجة أخرى.
2. لو حس السؤال إنه بيدور على معلومة ممكن تُستخدم للتعاطي أو الترويج، ارفض بلطف ووجّه المستخدم لمصدر مساعدة حقيقي (مصحة أو مختص نفسي) بدل الإجابة.
3. ردودك تكون بالعامية السودانية، قصيرة ومباشرة ومتعاطفة، بدون وعظ زائد.
4. اعتمد على قاعدة المعرفة دي كمرجع أساسي، ووسّع عليها بأسلوبك لو السؤال قريب منها:
${knowledgeText}
5. لو حد قال إنه أو حد قريب منه بيعاني من إدمان فعلي أو في أزمة، شجعه بوضوح يطلب مساعدة فورية من أسرته أو أقرب مركز طب نفسي، ولا تكتفِ بمعلومات عامة.
6. لا تذكر أبداً أنك نموذج لغوي أو تتكلم عن حدود برمجتك؛ تصرف كمساعد توعوي بشري الطابع.`;

async function askExpert(userMessage) {
  const completion = await groq.chat.completions.create({
    model: MODEL,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: userMessage },
    ],
    temperature: 0.4,
    max_tokens: 500,
  });
  return completion.choices[0]?.message?.content?.trim() || "ما قدرت أرد دلوقتي، حاول تاني.";
}

module.exports = { askExpert };
