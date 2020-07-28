import mapping from "@/mapping.json";

function resolveID(apiId: number): string | null {
  return mapping[apiId.toString()];
}

export function resolveEorzeaDatabaseUrl(apiId: number): string | null {
  const databaseId = resolveID(apiId);
  if (databaseId == null) {
    return null;
  } else {
    return `https://jp.finalfantasyxiv.com/lodestone/playguide/db/item/${databaseId}/`;
  }
}
