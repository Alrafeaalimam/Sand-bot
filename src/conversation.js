const store = require("./store");
const gameEngine = require("./gameEngine");
const { askExpert } = require("./groq");
const menu = require("./menu");

/**
 * يرجع رد نصي واحد بناءً على رسالة المستخدم وحالته المخزنة.
 * id: معرف فريد للمستخدم (رقم واتساب أو sessionId من الويب)
 */
function normalizeInput(str) {
  if (!str) return "";
  let clean = str.trim();
  // تحويل الأرقام العربية (٠-٩) إلى أرقام إنجليزية (0-9)
  clean = clean.replace(/[٠-٩]/g, (d) => "٠١٢٣٤٥٦٧٨٩".indexOf(d).toString());
  // إزالة إيموجي المفاتيح 1️⃣ -> 1
  clean = clean.replace(/([0-9])\uFE0F?\u20E3/g, "$1");
  return clean.trim();
}

/**
 * يرجع رد نصي واحد بناءً على رسالة المستخدم وحالته المخزنة.
 * id: معرف فريد للمستخدم (رقم واتساب أو sessionId من الويب)
 */
async function handleMessage(id, body) {
  const normalized = normalizeInput(body);
  const lower = normalized.toLowerCase();
  const user = store.getUser(id);

  // العودة للقائمة الرئيسية
  if (
    ["قايمة", "menu", "0", "الرئيسية", "قائمة", "رجوع"].includes(lower) ||
    lower.startsWith("0") ||
    lower.includes("الرئيسية")
  ) {
    store.resetUser(id);
    return menu.WELCOME;
  }

  // جهات المساعدة
  if (
    ["مساعدة", "help", "طوارئ", "جهات علاج", "جهات مساعدة"].some((k) =>
      lower.includes(k)
    )
  ) {
    return menu.HELP_CONTACTS;
  }

  // إذا كان المستخدم في القائمة الرئيسية
  if (user.mode === "idle") {
    // 1: الخبير المجهول
    if (lower === "1" || lower.startsWith("1") || lower.includes("خبير") || lower.includes("اسأل")) {
      store.setUser(id, { mode: "expert" });
      return menu.EXPERT_INTRO;
    }
    // 2: لعبة القرار
    if (lower === "2" || lower.startsWith("2") || lower.includes("لعبة") || lower.includes("قرار")) {
      store.setUser(id, { mode: "game_select" });
      return menu.gameMenu();
    }
    // 3: جهات مساعدة وعلاج
    if (lower === "3" || lower.startsWith("3") || lower.includes("جهات") || lower.includes("علاج")) {
      return menu.HELP_CONTACTS;
    }
    return menu.WELCOME;
  }

  // اختيار سيناريو اللعبة
  if (user.mode === "game_select") {
    let idx = -1;
    const match = lower.match(/\b([1-9])\b/) || lower.match(/^([1-9])/);
    if (match) {
      idx = parseInt(match[1]) - 1;
    } else if (lower.includes("حفلة")) {
      idx = 0;
    } else if (lower.includes("صاحبك") || lower.includes("تغير")) {
      idx = 1;
    }

    if (idx >= 0) {
      const result = gameEngine.startScenario(idx);
      if (result) {
        store.setUser(id, {
          mode: "game",
          scenario: result.scenario,
          node: result.node,
        });
        return result.text;
      }
    }
    return menu.gameMenu();
  }

  // داخل لعبة القرار
  if (user.mode === "game") {
    let idx = -1;
    const match = lower.match(/\b([1-9])\b/) || lower.match(/^([1-9])/);
    if (match) {
      idx = parseInt(match[1]) - 1;
    } else {
      idx = parseInt(lower) - 1;
    }

    if (isNaN(idx) || idx < 0) {
      return 'اختار رقم من الخيارات المعروضة، أو اكتب "قايمة" للرجوع.';
    }

    const result = gameEngine.choose(user.node, idx);
    if (!result) {
      return 'خيار غير صحيح، جرب رقم من الخيارات المعروضة أو اكتب "قايمة".';
    }
    if (result.isEnding) {
      store.resetUser(id);
    } else {
      store.setUser(id, { node: result.node });
    }
    return result.text;
  }

  // وضع الخبير المجهول
  if (user.mode === "expert") {
    return await askExpert(body);
  }

  store.resetUser(id);
  return menu.WELCOME;
}

module.exports = { handleMessage };
