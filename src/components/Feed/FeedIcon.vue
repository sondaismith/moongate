<template>
    <!-- <div class="pr-2"> -->
        <component :is="getFeedIcon()" :class="$attrs.class"/>
    <!-- </div> -->
</template>

<script lang="ts">
//Available Icons
import MingcuteHome4Line from '~icons/mingcute/home-4-line';
import MingcuteSettings2Line from '~icons/mingcute/settings-2-line';
import MdiPlaylistAdd from '~icons/mdi/playlist-add';
import MdiPlaylistRemove from '~icons/mdi/playlist-remove';
import MdiPencilPlus from '~icons/mdi/pencil-plus';
import MingcuteGroup3Fill from '~icons/mingcute/group-3-fill';
import MdiPaintOutline from '~icons/mdi/paint-outline';
import MdiNewspaperVariantMultiple from '~icons/mdi/newspaper-variant-multiple';
import MingcuteQuestionLine from '~icons/mingcute/question-line';
import MingcuteMusicLine from '~icons/mingcute/music-line';
import SolarHashtagChatBold from '~icons/solar/hashtag-chat-bold';

import { defineComponent, FunctionalComponent } from 'vue'
import { FeedEnums } from '../../enums/FeedEnums';
import { IFeedIconTypes } from '../../interfaces/FeedInterfaces';

var FeedIconTypes : IFeedIconTypes[] = [
    { name: FeedEnums.Icons.Home, icon: MingcuteHome4Line },
    { name: FeedEnums.Icons.Settings, icon: MingcuteSettings2Line },
    { name: FeedEnums.Icons.AddList, icon: MdiPlaylistAdd },
    { name: FeedEnums.Icons.RemoveList, icon: MdiPlaylistRemove },
    { name: FeedEnums.Icons.CreatePost, icon: MdiPencilPlus },
    { name: FeedEnums.Icons.Friends, icon: MingcuteGroup3Fill },
    { name: FeedEnums.Icons.News, icon: MdiNewspaperVariantMultiple },
    { name: FeedEnums.Icons.Art, icon: MdiPaintOutline },
    { name: FeedEnums.Icons.Music, icon: MingcuteMusicLine },
    { name: FeedEnums.Icons.Hashtag, icon: SolarHashtagChatBold },
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