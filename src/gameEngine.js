const game = require("../data/game.json");

function listScenarios() {
  return Object.entries(game.scenarios).map(
    ([key, s], i) => `${i + 1}️⃣ ${s.title}`
  );
}

function scenarioKeys() {
  return Object.keys(game.scenarios);
}

function startScenario(index) {
  const keys = scenarioKeys();
  const key = keys[index];
  if (!key) return null;
  const scenario = game.scenarios[key];
  const node = game.nodes[scenario.start];
  return { scenario: key, node: scenario.start, text: renderNode(node) };
}

function renderNode(node) {
  let msg = node.text;
  if (node.options) {
    msg += "\n\n" + node.options.map((o) => o.text).join("\n");
  }
  if (node.ending) {
    msg += `\n\n${node.feedback}\n\nاكتب "قايمة" للرجوع للقائمة الرئيسية.`;
  }
  return msg;
}

// choiceIndex: 0-based index بناءً على ترتيب الخيارات المعروضة
function choose(currentNodeId, choiceIndex) {
  const node = game.nodes[currentNodeId];
  if (!node || !node.options) return null;
  const opt = node.options[choiceIndex];
  if (!opt) return null;
  const nextNode = game.nodes[opt.next];
  return {
    node: opt.next,
    text: renderNode(nextNode),
    isEnding: !!nextNode.ending,
  };
}

module.exports = { listScenarios, scenarioKeys, startScenario, choose };
