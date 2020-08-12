<template>
  <div>
    <p>
      <v-text-field
        v-model="itemName"
        solo
        append-icon="mdi-magnify"
        @input="changeSearchWindow"
        @click:append="changeSearchWindow"
      />
      <v-text-field v-model="searchedItemName" readonly label="Searched Name" />
    </p>
    <template v-if="isShowTable">
      <v-simple-table>
        <template v-slot:default>
          <tbody>
            <searched-item
              :item="item"
              v-for="item in data.searchedItems"
              :key="item.ID"
            />
          </tbody>
        </template>
      </v-simple-table>
    </template>
    <template v-else>
      <h4>No Items</h4>
    </template>
  </div>
</template>

<script lang="ts">
import { searchItem } from "@/usecases/ItemSearch";
import { defineComponent, ref, reactive, computed } from "@vue/composition-api";
import { XivItem } from "@/models/XivItem";
import SearchedItem from "@/components/SearchedItem.vue";

type Data = {
  searchedItems: XivItem[];
};

export default defineComponent({
  components: { SearchedItem },
  setup() {
    const itemName = ref<string>("");
    const searchedItemName = ref<string>("");
    const data = reactive<Data>({
      searchedItems: []
    });
    const changeSearchWindow = async () => {
      searchedItemName.value = itemName.value;
      const items = await searchItem(itemName.value);
      data.searchedItems = items;
    };
    const isShowTable = computed<boolean>(() => {
      return data.searchedItems.length > 0;
    });
    return {
      itemName,
      changeSearchWindow,
      data,
      isShowTable,
      searchedItemName
    };
  }
});
</script>
