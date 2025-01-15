<script lang="ts">
import { reactive } from 'vue'
import { IPostDetails, IPostDetailsList } from '../interfaces/PostInterfaces';
import { PostTypes } from '../enums/PostEnums';
import { emptyPostModalData, firstPostObject } from '../fake-data/dumPostData';

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
})

function updatePostDetails(postToOpen:IPostDetails):IPostDetails{
    return postToOpen;
}
</script>