import { AppBskyFeedDefs } from "@atproto/api";
import { agent } from "../api";

export async function getUserHomeFeed(){
    var result;
    try{
        result = await agent.getTimeline();
        console.log(result?.data);
    }
    catch(error){
        result = error;
    }
    return result;
}