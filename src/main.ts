import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import vuetify from "./plugins/vuetify";
import CompositionApi from "@vue/composition-api";
import Amplify from "aws-amplify";
import { AWS_REGION, IDENTITY_POOL_ID } from "@/aws-config";
import VueClipboard from "vue-clipboard2";

Vue.config.productionTip = false;

Amplify.configure({
  Auth: {
    identityPoolId: IDENTITY_POOL_ID,
    region: AWS_REGION
  }
});

Vue.use(CompositionApi);
Vue.use(VueClipboard);

new Vue({
  router,
  vuetify,
  render: h => h(App)
}).$mount("#app");
