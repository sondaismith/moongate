<script lang="ts">
import { ComAtprotoServerCreateSession } from "@atproto/api/dist/client";
import { GetBrowsingAgent, LoginAgent } from "../api.vue";

export default{
    name:"Login API Methods"
}

export async function LoginBskyAccount(handle:string, password:string):Promise<ComAtprotoServerCreateSession.Response>{
    let result:ComAtprotoServerCreateSession.Response = {data:{accessJwt:'',refreshJwt:'',did:'',handle:''},headers:{},success:false};
    await LoginAgent(handle,password)
    .then(res => {
        result = res
    })
    // console.log(result.message);//DEBUG
    // if(result.success){
    //     console.log("Logged in!")
    // }
    // console.log(await GetCurrentUsersProfile());
    return result;
}

//DEBUG
export async function GetCurrentUsersProfile(){
    const data = await GetBrowsingAgent().getTimeline();
    return data;
}
</script>