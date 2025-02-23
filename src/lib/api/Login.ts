import { agent, LoginAgent, LogoutAgent } from "../api";

const PDS = "bsky.social";

export async function LoginBskyAccount(handle:string, password:string) {
    const result = await LoginAgent(handle,password)
    console.log(result.message);//DEBUG
    if(result.success){
        console.log("Logged in!")
    }
    // console.log(await GetCurrentUsersProfile());
    return result;
}

//DEBUG
export async function GetCurrentUsersProfile(){
    const data = await agent.getTimeline();
    return data;
}