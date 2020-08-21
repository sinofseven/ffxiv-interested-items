import { loadLanguage } from "@/usecases/LanguageConfig";
import axios from "axios";
import { XivItem } from "@/models/XivItem";

const SEARCH_URL = "https://ffxiv-itndb.luciferous.xyz/api/search";
const ITEM_URL = "https://ffxiv-itndb.luciferous.xyz/api/list";

export async function searchItem(text: string): Promise<XivItem[]> {
  const query = {
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
  Results: ExtendXivItem[];
};

async function curlListItems(ids: number[]): Promise<ListItemResponse> {
  const query = {
    ids: ids.join(",")
  };
  const resp = await axios.get(ITEM_URL, { params: query });
  return resp.data;
}

export async function listItems(ids: number[]): Promise<XivItem[]> {
  const resp = await curlListItems(ids);
  return resp.Results;
}
