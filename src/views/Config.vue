<template>
  <div>
    <v-simple-table>
      <template v-slot:default>
        <tbody>
          <tr>
            <th>
              <h2>Lang</h2>
            </th>
            <td>
              <v-select
                v-model="lang"
                :items="LANGUAGE_LIST"
                @change="changeLanguage"
              ></v-select>
            </td>
          </tr>
          <tr>
            <th>
              <h2>Dark Mode</h2>
            </th>
            <td>
              <v-switch v-model="darkModeState" @change="toggleDarkMode" />
            </td>
          </tr>
          <tr>
            <th>
              <h2>Cloud Save</h2>
            </th>
            <td>
              <p class="cloud-save-cell">
                <v-btn outlined @click="showDialog">{{
                  cloudKeyId == null ? "enable" : "disable"
                }}</v-btn>
              </p>
              <template v-if="cloudKeyId != null">
                <p class="cloud-save-cell">
                  <v-text-field
                    readonly
                    v-model="cloudKeyId"
                    label="CloudKeyId"
                    append-icon="mdi-clipboard-text-outline"
                    @click:append="copyId"
                  />
                </p>
              </template>
            </td>
          </tr>
        </tbody>
      </template>
    </v-simple-table>
    <v-dialog v-model="isShowCloudSaveDialog">
      <v-card>
        <v-card-title>Init Cloud Save</v-card-title>
        <v-divider />
        <v-card-text>
          <v-row>
            <v-col class="box">
              <v-btn x-large outlined @click="initCloudSave">新規作成</v-btn>
            </v-col>
            <v-col class="text-center">
              <v-text-field v-model="loadKeyId" label="CloudKeyId" />
              <v-checkbox
                v-model="isMergeLocalStore"
                label="端末のリストをクラウドのリストと統合する"
              />
              <v-btn x-large outlined @click="takeOverCloudSave"
                >引き継ぐ</v-btn
              >
            </v-col>
          </v-row>
          <v-overlay :value="isLoading">
            <v-progress-circular indeterminate />
          </v-overlay>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script lang="ts">
import { defineComponent, SetupContext, ref } from "@vue/composition-api";
import {
  loadDarkModeConfig,
  saveDarkModeConfig
} from "@/usecases/DarkModeConfig";
import {
  LANGUAGE_LIST,
  loadLanguage,
  saveLanguage
} from "@/usecases/LanguageConfig";
import {
  loadStore,
  saveStore,
  headStore,
  getCloudKeyId,
  saveCloudKeyId,
  createCloudKeyId,
  removeCloudKeyId,
  loadCloudStore,
  mergeStore
} from "@/usecases/Store";

export default defineComponent({
  setup(_: never, context: SetupContext) {
    const darkModeState = ref<boolean>(loadDarkModeConfig());
    const lang = ref<string>(loadLanguage());
    const cloudKeyId = ref<string | null>(getCloudKeyId());
    const isShowCloudSaveDialog = ref<boolean>(false);
    const loadKeyId = ref<string>("");
    const isMergeLocalStore = ref<boolean>(false);
    const isLoading = ref<boolean>(false);

    const toggleDarkMode = () => {
      const state: boolean = darkModeState.value;
      saveDarkModeConfig(state);
      context.root.$vuetify.theme.dark = state;
    };

    const changeLanguage = () => {
      saveLanguage(lang.value);
    };

    const copyId = () => {
      if (cloudKeyId.value == null) return;
      context.root.$copyText(cloudKeyId.value);
      alert("Cloud Key Id copied!");
    };

    const showDialog = () => {
      if (cloudKeyId.value == null) {
        // enable
        loadKeyId.value = "";
        isMergeLocalStore.value = false;
        isShowCloudSaveDialog.value = true;
      } else {
        // disable
        removeCloudKeyId();
        cloudKeyId.value = null;
      }
    };

    const initCloudSave = async () => {
      isLoading.value = true;
      try {
        const list = await loadStore();
        const keyId = createCloudKeyId();
        await saveStore(list);
        cloudKeyId.value = keyId;
        isShowCloudSaveDialog.value = false;
      } catch {
        cloudKeyId.value = null;
        removeCloudKeyId();
        alert("CloudSaveに失敗しました");
      } finally {
        isLoading.value = false;
      }
    };

    const takeOverCloudSave = async () => {
      isLoading.value = true;
      try {
        if (loadKeyId.value.length == 0) return;
        const canLoad = await headStore(loadKeyId.value);
        if (!canLoad) {
          alert("Cloud Key Idが正しくありません");
          return;
        }
        try {
          let list = await loadCloudStore(loadKeyId.value);
          if (isMergeLocalStore.value) {
            const localList = await loadStore();
            list = mergeStore(list, localList);
          }
          saveCloudKeyId(loadKeyId.value);
          await saveStore(list);
          cloudKeyId.value = loadKeyId.value;
          isShowCloudSaveDialog.value = false;
        } catch {
          alert("Cloud Saveの取得に失敗しました");
        }
      } finally {
        isLoading.value = false;
      }
    };

    return {
      darkModeState,
      toggleDarkMode,
      lang,
      changeLanguage,
      LANGUAGE_LIST,
      cloudKeyId,
      copyId,
      isShowCloudSaveDialog,
      loadKeyId,
      showDialog,
      initCloudSave,
      isMergeLocalStore,
      takeOverCloudSave,
      isLoading
    };
  }
});
</script>

<style scoped>
p.cloud-save-cell {
  margin: 8px 0;
}
.box {
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
