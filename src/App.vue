<template>
  <v-app>
    <v-app-bar app>
      <div class="d-flex align-center">
        <v-toolbar-title>FFXIV Interested Items</v-toolbar-title>
      </div>
    </v-app-bar>

    <v-main>
      <v-tabs centered>
        <v-tab to="/search">Search</v-tab>
        <v-tab to="/saved">Saved</v-tab>
        <v-tab to="/config">Config</v-tab>
        <v-tab to="/about">About</v-tab>
      </v-tabs>
      <v-container>
        <router-view />
      </v-container>
    </v-main>
  </v-app>
</template>

<script lang="ts">
import { defineComponent, SetupContext } from "@vue/composition-api";
import { loadDarkModeConfig } from "@/usecases/DarkModeConfig";
import { loadLanguage, saveLanguage } from "@/usecases/LanguageConfig";

export default defineComponent({
  name: "App",
  setup(_: never, context: SetupContext) {
    context.root.$vuetify.theme.dark = loadDarkModeConfig();
    saveLanguage(loadLanguage());
  }
});
</script>
