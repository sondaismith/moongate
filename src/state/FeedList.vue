<template>
    <div>

    </div>
</template>

<script lang="ts">
import { reactive } from 'vue';
import {FeedEnums} from '../enums/FeedEnums';
import { IFeedListing } from '../interfaces/FeedInterfaces';

//Code from Mulan at https://stackoverflow.com/a/27747377
function dec2hex (dec: number) {
    return dec.toString(16).padStart(2, "0")
}
//Code from Mulan at https://stackoverflow.com/a/27747377
export function GenerateUniqueId(len: number) : String{
    const arr = new Uint8Array((len || 40) / 2)
    crypto.getRandomValues(arr);
    const newId : String = Array.from(arr,dec2hex).join('');
    //Was supposed to be check to prevent dupes, not needed since this
    //wont be used live
    // feedListing.feedList.forEach(feed => {

    // });
    return newId;
}

export const userFeedList : IFeedListing = reactive({
    feedList: [
        {feedId:GenerateUniqueId(10), feedName:'Friends', feedHandle:'friends', feedType:FeedEnums.Types.Friends, newPosts: 3, totalPosts: 2},
        // {feedId:GenerateUniqueId(10), feedName:'Local News', feedHandle:'bbcNews', feedType:FeedEnums.Types.News, newPosts: 5, totalPosts: 3},
        // {feedId:GenerateUniqueId(10), feedName:'Artists', feedHandle:'artists', feedType:FeedEnums.Types.Art, newPosts: 7, totalPosts: 1},
    ]
})
</script>