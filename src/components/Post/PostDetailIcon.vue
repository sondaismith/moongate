<template>
    <div class="group flex items-center cursor-pointer hover:text-slate-300">
        <i-solar:chat-dots-outline v-if="iconType == iconTypes.Comment" class="pointer-events-none text-lg group-hover:text-yellow-500"/>
        <i-mingcute:repeat-line v-else-if="iconType == iconTypes.Reposts" class="pointer-events-none text-lg group-hover:text-green-500"/>
        <i-mingcute:heart-fill v-else-if="iconType == iconTypes.Likes" class="pointer-events-none text-lg group-hover:text-red-500"/>
        <i-solar-share-bold v-else-if="iconType == iconTypes.Share" class="pointer-events-none text-lg group-hover:text-blue-500"/>
        <i-mdi-dots-horizontal v-else-if="iconType == iconTypes.Options" class="pointer-events-none text-lg group-hover:text-white"/>
        <div v-else data-tooltip="ERROR: icon not found"><i-mingcute-warning-line class="text-lg"/></div>
        {{ void "above line handles situation where incorect iconType value has been set" }}
        <div v-if="iconText" class="pl-1">{{ iconText }}</div>
    </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue'
import { PostEnums } from '../../enums/PostEnums';

export default defineComponent({
    props:{
        iconType:{
            type: String as PropType<PostEnums.IconTypes>,
            required: true
        },
        iconText: Number
    },
    data(){
        return{
            iconTypes:PostEnums.IconTypes
        }
    },
    setup () {
        return {}
    }
})
</script>