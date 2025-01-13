<template>
    <div class="pr-2">
        <component :is="getFeedIcon()"/>
    </div>
</template>

<script lang="ts">
//Available Icons
import MingcuteGroup3Fill from '~icons/mingcute/group-3-fill';
import MdiPaintOutline from '~icons/mdi/paint-outline';
import MdiNewspaperVariantMultiple from '~icons/mdi/newspaper-variant-multiple';
import MingcuteQuestionLine from '~icons/mingcute/question-line';
import MingcuteMusicLine from '~icons/mingcute/music-line';

import { defineComponent, FunctionalComponent } from 'vue'
import { FeedEnums } from '../../enums/FeedEnums';

interface IFeedIconTypes{
    name : FeedEnums.Types,
    icon : FunctionalComponent
}

var FeedIconTypes : IFeedIconTypes[] = [
    { name: FeedEnums.Types.Friends, icon: MingcuteGroup3Fill },
    { name: FeedEnums.Types.News, icon: MdiNewspaperVariantMultiple },
    { name: FeedEnums.Types.Art, icon: MdiPaintOutline },
    { name: FeedEnums.Types.Music, icon: MingcuteMusicLine },
]

export default defineComponent({
    props:{
        icon:String
    },
    methods:{
        getFeedIcon():FunctionalComponent{
            var ss = FeedIconTypes.findIndex(x => x.name === this.icon)
            if(ss >= 0)
            {
                return FeedIconTypes[ss].icon;
            }
            else{ return MingcuteQuestionLine; }
        },
    },
    setup () {
        return {}
    }
})
</script>

<style scoped>
</style>