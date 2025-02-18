import { createApp } from "vue";
import App from "./App.vue";
import './index.css';
import PrimeVue from 'primevue/config';
import Aura from "@primevue/themes/aura";
import Lara from "@primevue/themes/lara";
import Material from "@primevue/themes/material";
import Nora from "@primevue/themes/nora";
import FloatLabel from "primevue/floatlabel";
import Toast from "primevue/toast";
import ToastService from "primevue/toastservice";
import InputText from "primevue/inputtext";

const app = createApp(App)
app.use(PrimeVue, {
    theme: {
        preset: Nora,
        // unstyled: true
    }
});
app.use(ToastService);
app.component("FloatLabel", FloatLabel);
app.component("InputText", InputText);
app.component("Toast", Toast);

app.mount("#app");