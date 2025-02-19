<template>
    <div class="absolute z-20 flex flex-col w-full h-full bg-slate-900/80">
        <form class="flex flex-col w-4/5 md:w-2/3 lg:max-w-[700px] h-2/3 bg-slate-800 p-4 mx-auto my-auto rounded-md">
            <div class="text-3xl text-blue-700 font-extrabold">Login</div>
            <div class="text-sm md:text-lg font-bold">Enter your username and password</div>
            <div class="h-[1px] bg-slate-500 my-2"></div>
            <div class="flex flex-col">
                <!-- <div>Hosting Provider</div>
                <div>bsky.social</div> -->
                <div class="group-heading">Account</div>
                <InLaInput v-model="enteredUsername" textLabel="Handle"/>
                <InLaInput v-model="enteredPassword" textLabel="Password"/>
            </div>
            <div class="flex">
                <a @click="testToast" tabindex="0" class="relative flex rounded cursor-pointer
                    bg-blue-700 justify-center px-3 py-2 font-semibold
                    hover:text-white hover:bg-blue-500 focus:bg-blue-600">Login</a>
            </div>
        </form>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import InLaInput from '../Utilities/InLaInput.vue';

export default defineComponent({
    data(){
        return{
            enteredUsername: "",
            enteredPassword: "",
        }
    },
    methods:{
        testToast(){
            this.$toast.add({summary:"Test", detail:`Hello ${this.enteredUsername}, attempting to login...`, severity:'info', life:1500});
        }
    },
    setup () {
        return {}
    }
})
</script>

<style scoped>
    /* div{
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        font-weight: 300;
    } */
    div.group-heading{
        font-size: 12px;
        line-height: 20px;
        font-weight: 800;
        margin-bottom: 0.25rem;
    }
</style>