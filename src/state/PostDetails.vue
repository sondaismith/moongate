<script lang="ts">
import { reactive } from 'vue'

interface IPostDetails{
    userName: String,
    userHandle: String,
    totalComments: number, //not going to actually be in final version, just use .length
    totalReposts: number,
    totalLikes: number,
    postText: String,
    postMedia?: String,
    comments: IPostDetails[],
    // timestamp?: Date
}

interface IPostDetailsList{
    postDetailsList : IPostDetails[]
}

export const postDetails : IPostDetailsList = reactive({
    postDetailsList:[
        {userName:'Modal', userHandle:'modalTest.moon.social', totalComments:6, totalReposts: 12, totalLikes: 42, postText:'Test',
            comments:[
                {userName:'angry-man', userHandle:'angryangry', totalComments:6, totalReposts: 0, totalLikes: 4, postText:'Hello. I am an angry robot!',
                    comments:[
                        {userName:'robot', userHandle:'happyhappy', totalComments:0, totalReposts: 12, totalLikes: 42, postText:'Why are you angry?', comments:[]},
                    ]},
                {userName:'user1', userHandle:'user1', totalComments:0, totalReposts: 12, totalLikes: 22, postText:'Hi?', comments:[]},
                {userName:'user2', userHandle:'user2', totalComments:0, totalReposts: 2, totalLikes: 1, postText:'Hello?', comments:[]},
            ]
        }
    ]
})
</script>