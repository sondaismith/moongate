<script lang="ts">
import { reactive } from 'vue'
import { IPostDetails, IPostDetailsList } from '../interfaces/PostInterfaces';
import { IconTypes } from '../enums/PostEnums';
import { emptyPostModalData, firstPostObject } from '../fake-data/dumPostData';

//DetailIcon Icons
import SolarChatDotsOutline from '~icons/solar/chat-dots-outline';
import MingcuteRepeatLine from '~icons/mingcute/repeat-line';
import MingcuteHeartFill from '~icons/mingcute/heart-fill';
import SolarShareBold from '~icons/solar/share-bold';
import MdiDotsHorizontal from '~icons/mdi/dots-horizontal';

// export const postDetails : IPostDetailsList = reactive({
export const postDetails :IPostDetailsList = reactive({
    // isVisible:{
    //     type: Boolean,
    //     default(){return false}
    // },
    isVisible: false,
    menuClickPos: [0, -500],
    postData: emptyPostModalData,
    // modalPostData: [],
    showModal(){
        this.isVisible = true;
    },
    showModalPost(postToShow:IPostDetails){
        this.isVisible = true;
        this.postData = updatePostDetails(postToShow);
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
        var appViewport = document.getElementById('app-viewport')
        setTimeout(() => {
            if(!el || !appViewport) return;
            var menuHeight = el.clientHeight;
            var viewportHeight = appViewport.offsetHeight;
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
    postDetailIconValues: [
        { label: 'N/A', type:IconTypes.Comment, icon: SolarChatDotsOutline, color: 'group-hover:text-yellow-500' },
        { label: 'N/A', type:IconTypes.Reposts, icon: MingcuteRepeatLine, color: 'group-hover:text-blue-500' },
        { label: 'N/A', type:IconTypes.Likes, icon: MingcuteHeartFill, color: 'group-hover:text-red-500' },
        { label: '', type:IconTypes.Share, icon: SolarShareBold, color: 'group-hover:text-blue-500' },
        { label: '', type:IconTypes.Options, icon: MdiDotsHorizontal, color: 'group-hover:text-white-500' },
    ],
    updatePostDetailIconValues(comments:string = "", reposts:string = "", likes:string = ""){
        if(comments) this.postDetailIconValues[0].label = comments;
        if(reposts) this.postDetailIconValues[1].label = reposts;
        if(likes) this.postDetailIconValues[2].label = likes;
    }
})

function updatePostDetails(postToOpen:IPostDetails):IPostDetails{
    return postToOpen;
}
</script>