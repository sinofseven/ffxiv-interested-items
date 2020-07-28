<template>
  <div>
    <div class="box">
      <v-select
        v-model="data.selectedList"
        :items="Object.keys(data.list).sort()"
        :label="labelSelect"
        :readonly="hasNoList"
        @change="changeList"
      >
      </v-select>
      <v-menu offset-y>
        <template v-slot:activator="{ on, attrs }">
          <v-btn v-bind="attrs" v-on="on">
            <v-icon>mdi-dots-horizontal</v-icon>
          </v-btn>
        </template>
        <v-list>
          <v-list-item @click="data.isShowCreateList = true">
            <v-list-item-title>Create List</v-list-item-title>
          </v-list-item>
          <template v-if="data.selectedList.length > 0">
            <v-list-item @click="data.isShowRenameList = true">
              <v-list-item-title>Rename List</v-list-item-title>
            </v-list-item>
            <v-list-item @click="deleteList">
              <v-list-item-title>Delete List</v-list-item-title>
            </v-list-item>
          </template>
        </v-list>
      </v-menu>
    </div>
    <v-simple-table>
      <template v-slot:default>
        <tbody>
          <searched-item
            v-for="item in data.listItems"
            :key="item.ID"
            :item="item"
            @refresh="refresh"
          />
        </tbody>
      </template>
    </v-simple-table>
    <v-dialog v-model="data.isShowCreateList">
      <v-card>
        <v-card-title>Create List</v-card-title>
        <v-divider />
        <v-card-text>
          <p>
            <v-text-field v-model="data.createListName" label="List Name" />
          </p>
        </v-card-text>
        <v-divider />
        <v-card-actions style="justify-content: flex-end">
          <v-btn text color="blue" @click="data.isShowCreateList = false"
            >Cancel</v-btn
          >
          <v-btn text color="blue" @click="createList">Create</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
    <v-dialog v-model="data.isShowRenameList">
      <v-card>
        <v-card-title>Rename List</v-card-title>
        <v-divider />
        <v-card-text>
          <p>
            <v-text-field
              v-model="data.selectedList"
              readonly
              label="Previous List Name"
            />
          </p>
          <p>
            <v-text-field v-model="data.nextListName" label="Next List Name" />
          </p>
        </v-card-text>
        <v-divider />
        <v-card-actions style="justify-content: flex-end">
          <v-btn text color="blue" @click="data.isShowRenameList = false"
            >Cancel</v-btn
          >
          <v-btn text color="blue" @click="renameList">Rename</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from "@vue/composition-api";
import { loadStore, saveStore } from "@/usecases/Store";
import { List } from "@/models/Store";
import { XivItem } from "@/models/XivItem";
import { listItems } from "@/usecases/ItemSearch";
import SearchedItem from "@/components/SearchedItem.vue";

type Data = {
  list: List;
  selectedList: string;
  listItems: XivItem[];
  isShowCreateList: boolean;
  createListName: string;
  isShowRenameList: boolean;
  nextListName: string;
};

export default defineComponent({
  components: { SearchedItem },
  setup() {
    const data = reactive<Data>({
      list: {},
      selectedList: "",
      listItems: [],
      isShowCreateList: false,
      createListName: "",
      isShowRenameList: false,
      nextListName: ""
    });
    const hasNoList = computed(() => {
      return Object.keys(data.list).length == 0;
    });
    const labelSelect = computed(() => {
      return hasNoList.value ? "No List" : "Select List";
    });
    const changeList = async () => {
      if (data.selectedList === "") return;
      const ids = Array.from(new Set(data.list[data.selectedList]));
      data.listItems = [];
      data.listItems = await listItems(ids);
    };
    const refresh = async () => {
      data.list = await loadStore();
      await changeList();
    };
    const createList = async () => {
      if (data.createListName.length == 0) return;
      if (Object.keys(data.list).includes(data.createListName)) {
        alert("there is same name list.");
        return;
      }
      data.list[data.createListName] = [];
      data.selectedList = data.createListName;
      data.createListName = "";
      await saveStore(data.list);
      data.isShowCreateList = false;
    };
    const renameList = async () => {
      if (data.nextListName.length == 0) return;
      if (Object.keys(data.list).includes(data.nextListName)) {
        alert("there is same name list.");
        return;
      }
      const previousName = data.selectedList;
      data.list[data.nextListName] = data.list[previousName];
      data.selectedList = data.nextListName;
      delete data.list[previousName];
      data.nextListName = "";
      await saveStore(data.list);
      data.isShowRenameList = false;
    };
    const deleteList = async () => {
      const flag = confirm(`Delete "${data.selectedList}"?`);
      if (!flag) return;
      const name = data.selectedList;
      data.selectedList = "";
      delete data.list[name];
      await saveStore(data.list);
    };
    refresh();
    return {
      data,
      hasNoList,
      labelSelect,
      changeList,
      refresh,
      createList,
      renameList,
      deleteList
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
</style>
