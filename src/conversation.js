const store = require("./store");
const gameEngine = require("./gameEngine");
const { askExpert } = require("./groq");
const menu = require("./menu");

/**
 * يرجع رد نصي واحد بناءً على رسالة المستخدم وحالته المخزنة.
 * id: معرف فريد للمستخدم (رقم واتساب أو sessionId من الويب)
 */
async function handleMessage(id, body) {
  const lower = body.trim();
  const user = store.getUser(id);

  if (["قايمة", "menu", "0"].includes(lower.toLowerCase())) {
    store.resetUser(id);
    return menu.WELCOME;
  }

  if (["مساعدة", "help"].includes(lower.toLowerCase())) {
    return menu.HELP_CONTACTS;
  }

  if (user.mode === "idle" && !["1", "2", "3"].includes(lower)) {
    return menu.WELCOME;
  }

  if (user.mode === "idle") {
    if (lower === "1") {
      store.setUser(id, { mode: "expert" });
      return menu.EXPERT_INTRO;
    }
    if (lower === "2") {
      store.setUser(id, { mode: "game_select" });
      return menu.gameMenu();
    }
    if (lower === "3") {
      return menu.HELP_CONTACTS;
    }
  }

  if (user.mode === "game_select") {
    const idx = parseInt(lower) - 1;
    const result = gameEngine.startScenario(idx);
    if (!result) return menu.gameMenu();
    store.setUser(id, {
      mode: "game",
      scenario: result.scenario,
      node: result.node,
    });
    return result.text;
  }

  if (user.mode === "game") {
    const idx = parseInt(lower) - 1;
    if (isNaN(idx)) {
      return 'اختار رقم من الخيارات المعروضة، أو اكتب "قايمة".';
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

  if (user.mode === "expert") {
    return await askExpert(body);
  }

  store.resetUser(id);
  return menu.WELCOME;
}

module.exports = { handleMessage };
