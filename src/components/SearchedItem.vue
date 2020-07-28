<template>
  <tr>
    <td>
      <div class="box">
        <img :src="icon" />
        <h3>{{ name }}</h3>
        <div class="box">
          <template v-if="loadStoneUrl != null">
            <a :href="loadStoneUrl" target="_blank" class="eorzeadb_link">
              <img src="/load_stone_logo.png" alt="" />
            </a>
          </template>
          <v-btn icon @click="showDialog">
            <v-icon>mdi-playlist-plus</v-icon>
          </v-btn>
        </div>
      </div>
      <v-dialog scrollable v-model="data.isShow">
        <v-card>
          <v-card-title>Add List</v-card-title>
          <v-divider />
          <v-card-text style="max-height: 300px">
            <p>
              <v-text-field
                v-model="data.addingListName"
                label="Create List"
                append-outer-icon="mdi-plus-box"
                @click:append-outer="addList"
              />
            </p>
            <v-list shaped>
              <v-list-item-group v-model="data.selectedListNames" multiple>
                <v-list-item
                  v-for="name in Object.keys(data.list).sort()"
                  :key="name"
                  :value="name"
                  active-class="deep-purple--text text--accent-4"
                >
                  <template v-slot:default="{ active, toggle }">
                    <v-list-item-action>
                      <v-checkbox
                        :input-value="active"
                        :true-value="name"
                        color="deep-purple accent-4"
                        @click="toggle"
                      ></v-checkbox>
                    </v-list-item-action>
                    <v-list-item-content>
                      <v-list-item-title v-text="name"></v-list-item-title>
                    </v-list-item-content>
                  </template>
                </v-list-item>
              </v-list-item-group>
            </v-list>
          </v-card-text>
          <v-divider />
          <v-card-actions class="right-actions">
            <v-btn text color="blue" @click="data.isShow = false">Cancel</v-btn>
            <v-btn text color="blue" @click="saveItem">Save</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </td>
  </tr>
</template>

<script lang="ts">
import {
  defineComponent,
  PropOptions,
  reactive,
  computed,
  SetupContext
} from "@vue/composition-api";
import { XivItem } from "@/models/XivItem";
import { loadLanguage, LANGUAGE_LIST } from "@/usecases/LanguageConfig";
import { resolveEorzeaDatabaseUrl } from "@/usecases/LoadStone";
import { loadStore, saveStore } from "@/usecases/Store";
import { List } from "@/models/Store";

const itemProps: PropOptions = {
  type: Object,
  required: true
};

type Props = {
  item: XivItem;
};

type LoadStoneUrl = string | null;

type Data = {
  isShow: boolean;
  addingListName: string;
  list: List;
  selectedListNames: string[];
  previousListNames: string[];
};

function resolveName(item: XivItem, lang: string): string {
  if (!LANGUAGE_LIST.includes(lang)) {
    throw new Error("wrong lang code.");
  }
  if (lang === "de") return item.Name_de;
  if (lang === "en") return item.Name_en;
  if (lang === "fr") return item.Name_fr;
  return item.Name_ja;
}

export default defineComponent({
  props: {
    item: itemProps
  },
  setup(props: Props, context: SetupContext) {
    const icon = `https://xivapi.com${props.item.Icon}`;
    const lang = loadLanguage();
    const name = resolveName(props.item, lang);
    const loadStoneUrl: LoadStoneUrl = resolveEorzeaDatabaseUrl(props.item.ID);
    const data = reactive<Data>({
      isShow: false,
      addingListName: "",
      list: {},
      selectedListNames: [],
      previousListNames: []
    });
    const listNames = computed(() => {
      return Object.keys(data.list);
    });
    const showDialog = async () => {
      data.list = await loadStore();
      data.isShow = true;
      data.selectedListNames = [];
      for (const entry of Object.entries(data.list)) {
        if (entry[1].includes(props.item.ID))
          data.selectedListNames.push(entry[0]);
      }
      data.previousListNames = JSON.parse(
        JSON.stringify(data.selectedListNames)
      );
    };
    const addList = async (evt: object) => {
      console.log("addList", evt);
      if (data.addingListName.length == 0) return;
      if (Object.keys(data.list).includes(data.addingListName)) {
        alert("there is same name list.");
        return;
      }
      data.list[data.addingListName] = [];
      await saveStore(data.list);
      data.addingListName = "";
    };
    const saveItem = async () => {
      const isAdd = data.selectedListNames.filter(key => {
        return !data.previousListNames.includes(key);
      });
      const isDeleted = data.previousListNames.filter(key => {
        return !data.selectedListNames.includes(key);
      });
      const id = props.item.ID;
      for (const listName of isAdd) {
        data.list[listName].push(id);
      }
      for (const listName of isDeleted) {
        const index = data.list[listName].findIndex(key => key === id);
        console.log(listName, index);
        if (index == null) continue;
        data.list[listName].splice(index, 1);
      }
      await saveStore(data.list);
      context.emit("refresh");
      data.isShow = false;
    };
    return {
      icon,
      name,
      loadStoneUrl,
      data,
      showDialog,
      addList,
      listNames,
      saveItem
    };
  }
});
</script>

<style scoped>
div.box {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.right-actions {
  justify-content: flex-end;
}
</style>
