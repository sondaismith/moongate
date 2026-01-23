import { createApp } from "vue";
// import { createApp } from "vue/dist/vue.esm-bundler";
import App from "./App.vue";
import './index.css';
import PrimeVue from 'primevue/config';
import Aura from "@primevue/themes/aura";
import Toast from "primevue/toast";
import ToastService from "primevue/toastservice";
import { createRouter, createWebHistory } from 'vue-router';
import { routes } from "./lib/router";

export const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: routes,
    scrollBehavior(to, from, savedPosition) {
        if(savedPosition){
            return new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve(savedPosition)
                }, 500)
            })
        }
        else{
            return {top:0};
        }
    },
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

///Code below used to use Mock Service Worker browser integration for request mocking
// async function enableMocking() {
//   if (process.env.NODE_ENV !== 'development') {
//     return
//   }

//   const { worker } = await import('./mocks/browser')

//   // `worker.start()` returns a Promise that resolves
//   // once the Service Worker is up and ready to intercept requests.
//   return worker.start()
// }

// enableMocking().then(() => {
//   app.mount("#app");
// })

app.mount("#app");