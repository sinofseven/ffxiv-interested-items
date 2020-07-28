import { loadLanguage } from "@/usecases/LanguageConfig";
import axios from "axios";
import { XivItem } from "@/models/XivItem";

const SEARCH_URL = "https://xivapi.com/search";
const ITEM_URL = "https://xivapi.com/item";

export async function searchItem(text: string): Promise<XivItem[]> {
  const query = {
    indexes: "item",
    limit: 100,
    columns: "ID,Icon,Name_de,Name_en,Name_fr,Name_ja",
    filters: "ItemSearchCategory.ID>=1",
    sort_field: "ItemSearchCategory.ID",
    language: loadLanguage(),
    string: text
  };
  const resp = await axios.get(SEARCH_URL, { params: query });
  return resp.data.Results;
}

type Pagination = {
  PageTotal: number;
};

type ItemSearchCategory = {
  ID: number;
};

type ExtendXivItem = XivItem & {
  ItemSearchCategory: ItemSearchCategory;
};

type ListItemResponse = {
  Pagination: Pagination;
  Results: ExtendXivItem[];
};

async function curlListItems(
  ids: number[],
  page: number
): Promise<ListItemResponse> {
  const query = {
    columns: "ID,Icon,Name_de,Name_en,Name_fr,Name_ja,ItemSearchCategory.ID",
    ids: ids.join(","),
    page: page
  };
  const resp = await axios.get(ITEM_URL, { params: query });
  return resp.data;
}

export async function listItems(ids: number[]): Promise<XivItem[]> {
  let result: ExtendXivItem[] = [];
  let max = 1;
  for (let i = 1; i <= max; i++) {
    const resp = await curlListItems(ids, i);
    if (i === 1) {
      max = resp.Pagination.PageTotal;
    }
    result = result.concat(resp.Results);
  }
  return result.sort((a, b) => {
    return a.ItemSearchCategory.ID - b.ItemSearchCategory.ID;
  });
}
