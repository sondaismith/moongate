<script lang="ts">
import { reactive } from 'vue'
import { IPostDetailsList } from '../interfaces/PostInterfaces';

export const postDetails : IPostDetailsList = reactive({
    // isVisible:{
    //     type: Boolean,
    //     default(){return false}
    // },
    isVisible: false,
    menuClickPos: [0, -500],
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
    ],
    showModal(){
        this.isVisible = true;
    },
    hideModal(){
        this.isVisible = false;
    },
    isPostOptionsMenuVisible: false,
    /**
     * Shows the "Post Options" menu.
     */
    showPostOptionsMenu(event:PointerEvent){
        (event.target as HTMLElement).classList.add('text-white') //keep button "hover" state
        this.isPostOptionsMenuVisible = true;
        this.clickedElement = event.currentTarget;

        var el = document.getElementById('post-option-menu');
        setTimeout(() => {
            var menuHeight = el?.clientHeight;
            var viewportHeight = document.getElementById('app-viewport').offsetHeight;
            this.menuClickPos = [event.clientX, event.clientY];
            var menuClearence = viewportHeight - (menuHeight+postDetails.menuClickPos[1]);

            if(menuClearence < 0){
                this.menuClickPos = [event.clientX, event.clientY-menuHeight];
            }
            else{
                this.menuClickPos = [event.clientX, event.clientY];
            }
        }, 100);
    },
    /**
     * Hides the "Post Options" menu.
     */
    hidePostOptionsMenu(event:PointerEvent){
        // if((event.target === (event.currentTarget as HTMLElement).children[1])){
        if((event.target as HTMLElement).classList.contains('menu-closer')){
            //remove button "hover" state
            (event.target as HTMLElement).parentElement?.parentElement?.children[0].classList.remove('text-white');
            this.clickedElement.classList.remove('text-white');
            var el = document.getElementById('post-option-menu');
            el.style.top = '-500px';
            this.isPostOptionsMenuVisible = false;
        }
    },
    clickedElement: document.children[0].children[1].children[1] as HTMLElement,
})
</script>