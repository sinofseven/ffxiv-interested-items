import { List } from "@/models/Store";

const LIST_KEY = "listKey";
const CLOUD_ID_KEY = "cloudIdKey";

function loadLocalStore(): List {
  const raw = window.localStorage.getItem(LIST_KEY);
  if (raw == null) return {};
  return JSON.parse(raw);
}

function saveLocalStore(store: List) {
  const text = JSON.stringify(store);
  window.localStorage.setItem(LIST_KEY, text);
}

export async function loadStore(): Promise<List> {
  return loadLocalStore();
}

export async function saveStore(store: List) {
  saveLocalStore(store);
}
