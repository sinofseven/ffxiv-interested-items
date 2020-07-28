<template>
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
      </tbody>
    </template>
  </v-simple-table>
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

export default defineComponent({
  setup(_: never, context: SetupContext) {
    const darkModeState = ref<boolean>(loadDarkModeConfig());
    const lang = ref<string>(loadLanguage());

    const toggleDarkMode = () => {
      const state: boolean = darkModeState.value;
      saveDarkModeConfig(state);
      context.root.$vuetify.theme.dark = state;
    };

    const changeLanguage = () => {
      saveLanguage(lang.value);
    };

    return {
      darkModeState,
      toggleDarkMode,
      lang,
      changeLanguage,
      LANGUAGE_LIST
    };
  }
});
</script>
