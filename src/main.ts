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
import LoginModal from './components/Login/LoginModal.vue';
import AboutAppModal from './components/Settings/AboutAppModal.vue';
import SettingsPanel from './components/Settings/SettingsPanel.vue';
import UserFocusModal from './components/User/UserFocusModal.vue';
import PostFocusModal from './components/Post/PostFocusModal.vue';
import FeedEditModal from './components/Feed/FeedEditModal.vue';

//Thanks to @groenroos from https://medium.com/@groenroos/twitter-style-modals-in-vue-3-vue-router-4-ffcc15bd6841
function keepDefaultView(to, from) {
    if (from.matched.length) {
        to.matched[0].components.default = from.matched[0].components.default;
        if(typeof from.matched[0].components.modal != 'undefined')
            to.matched[0].components.modal = from.matched[0].components.modal; //if modal exists, keep showing
        //If we are navigating from the main view and trying to login, DO NOT SHOW any modal - discard
        if(to.path == '/login' && typeof to.matched[0].components.modal != 'undefined' && from.path == '/'){
            to.matched[0].components = {default:to.matched[0].components.default, login:LoginModal};
        }
    }
    else{
        to.matched[0].components.default = Sidebar;
    }
}

const routes:RouteRecordRaw[] = [
    { path:'/',component: Sidebar },
    { path:'/login', meta:{title:'Login'}, components:{ login:LoginModal }, beforeEnter:[keepDefaultView] },
    { path:'/about', components:{ modal:AboutAppModal }, beforeEnter:[keepDefaultView] },
    { path:'/settings', components:{ modal:SettingsPanel }, beforeEnter:[keepDefaultView] },
    { path:'/profile/:handle', components:{ modal:UserFocusModal }, beforeEnter:[keepDefaultView], props:true },
    { path:'/profile/:handle/post/:postDid', components:{ modal:PostFocusModal }, beforeEnter:[keepDefaultView], props:true },
    // { path:'/profile/:handle/post/:postDid/:clickedMediaIndex', components:{ modal:PostFocusModal }, beforeEnter:[keepDefaultView], props:true, name:'postWithMedia'},
    { path:'/profile/:handle/post/:postDid/:clickedMediaIndex', components:{ modal:PostFocusModal }, beforeEnter:[keepDefaultView],
    props: route=> ({clickedMediaIndex: parseInt(route.params.clickedMediaIndex), handle: route.params.handle, postDid: route.params.postDid}),
    name:'postWithMedia'},
    { path:'/create/feed/', components:{ modal:FeedEditModal }, beforeEnter:[keepDefaultView], props:true },
    { path:'/create/feed/:feedType', components:{ modal:FeedEditModal }, beforeEnter:[keepDefaultView], props:true },
    { path: '/:pathMatch(.*)*', redirect:'/' }, //catches all invalid routes
]

export const router = createRouter({
    history: createWebHistory(),
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

app.mount("#app");