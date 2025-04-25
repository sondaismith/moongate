// import { createApp } from "vue";
import { createApp } from "vue/dist/vue.esm-bundler";
import App from "./App.vue";
import './index.css';
import PrimeVue from 'primevue/config';
import Aura from "@primevue/themes/aura";
import Lara from "@primevue/themes/lara";
import Material from "@primevue/themes/material";
import Nora from "@primevue/themes/nora";
import Toast from "primevue/toast";
import ToastService from "primevue/toastservice";
import { definePreset } from "@primevue/themes";

const PrimeVueCustomTheme = definePreset(Aura,{
    components:{
        toast:{
            // borderWidth:'15px'
            width: '200px'
        }
    }
});

const app = createApp(App);
app.use(PrimeVue, {
    // theme:{ preset: PrimeVueCustomTheme },
    theme:{ preset: Aura },
    // theme: 'none',
    // unstyled: true, //allows us to custom style components
});
app.use(ToastService);
app.component("Toast", Toast);

app.mount("#app");