<template>
    <div class="flex items-center">
        <i-solar:chat-dots-outline v-if="iconType == iconTypes.Comment" class="text-lg"/>
        <i-mingcute:repeat-line v-else-if="iconType == iconTypes.Reposts" class="text-lg"/>
        <i-mingcute:heart-fill v-else-if="iconType == iconTypes.Likes" class="text-lg"/>
        <i-solar-share-bold v-else-if="iconType == iconTypes.Share" class="text-lg"/>
        <i-mdi-dots-horizontal v-else-if="iconType == iconTypes.Options" class="text-lg"/>
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