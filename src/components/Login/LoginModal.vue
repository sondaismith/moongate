<template>
    <div class="absolute z-20 flex flex-col h-full w-1/2 bg-blue-700 p-4">
        <!-- <FloatLabel>
            <InputText id="username"/>
            <label for="username">Handle</label>
        </FloatLabel>
        <FloatLabel>
            <InputText id="password"/>
            <label for="password">Password</label>
        </FloatLabel> -->
        <div class="relative">
            <div class="flex">
                <label>Handle</label>
                <input v-model="enteredUsername"/>
            </div>
            <div class="flex">
                <label>Password</label>
                <input/>
            </div>
        </div>
        <div class="flex">
            <a @click="testToast" class="relative flex rounded-sm cursor-pointer bg-slate-400 justify-center p-2 hover:text-white hover:bg-slate-500">Login</a>
        </div>
    </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
    data(){
        return{
            enteredUsername: "",
            enteredPassword: "Bassword",
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
</style>