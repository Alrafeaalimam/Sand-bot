const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "..", "data", "users.json");

function loadAll() {
  if (!fs.existsSync(DB_PATH)) return {};
  try {
    return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  } catch {
    return {};
  }
}

function saveAll(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

// حالة كل مستخدم: { mode: "idle"|"expert"|"game", scenario, node }
function getUser(jid) {
  const all = loadAll();
  if (!all[jid]) {
    all[jid] = { mode: "idle", scenario: null, node: null };
    saveAll(all);
  }
  return all[jid];
}

function setUser(jid, state) {
  const all = loadAll();
  all[jid] = { ...all[jid], ...state };
  saveAll(all);
  return all[jid];
}

function resetUser(jid) {
  setUser(jid, { mode: "idle", scenario: null, node: null });
}

module.exports = { getUser, setUser, resetUser };
