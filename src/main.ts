import { createApp } from "vue";
// import { createApp } from "vue/dist/vue.esm-bundler";
import App from "./App.vue";
import './index.css';
import PrimeVue from 'primevue/config';
import Aura from "@primevue/themes/aura";
import Toast from "primevue/toast";
import ToastService from "primevue/toastservice";
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Sidebar from './Sidebar.vue';
import AboutAppModal from './components/Settings/AboutAppModal.vue';
import SettingsPanel from './components/Settings/SettingsPanel.vue';

//Thanks to @groenroos from https://medium.com/@groenroos/twitter-style-modals-in-vue-3-vue-router-4-ffcc15bd6841
function keepDefaultView(to, from) {
    if (from.matched.length) {
        to.matched[0].components.default = from.matched[0].components.default;
    } else {
        to.matched[0].components.default = Sidebar;
    }
}

const routes:RouteRecordRaw[] = [
    { path:'/',component: Sidebar },
    { path:'/about', components:{ modal:AboutAppModal }, beforeEnter:[keepDefaultView] },
    { path:'/settings', components:{ modal:SettingsPanel }, beforeEnter:[keepDefaultView] },
    { path: '/:pathMatch(.*)*', redirect:'/' }, //catches all invalid routes
]

export const router = createRouter({
    history: createWebHistory(),
    routes: routes
})

const app = createApp(App);
app.use(PrimeVue, {
    // theme:{ preset: PrimeVueCustomTheme },
    theme:{ preset: Aura },
    // theme: 'none',
    // unstyled: true, //allows us to custom style components
});
app.use(ToastService);
app.component("Toast", Toast);
app.use(router);

app.mount("#app");