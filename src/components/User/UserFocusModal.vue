<template>
    <div class="absolute z-10 flex w-full h-full bg-slate-800/60 backdrop-blur-sm outline-none" tabindex="0">
        <div @click="closeModal" :class="$attrs.class" class="absolute z-10 w-full h-full"></div>
        {{ void "Fullscreen Image" }}
        <TransitionGroup>
            <div v-if="isPFPFullscreen" @click="hidePFPFullscreen" class="fixed flex h-full w-full text-primary items-center justify-center scroll-auto
            bg-black/90 sm:bg-black/70 bg-contain bg-center bg-no-repeat z-30">
                <img :src="UserFocusModalState.currentUserPageDetails.ProfileData.avatar" class="max-h-full max-w-full"/>
            </div>
            <div v-else-if="isBannerFullscreen" @click="hideBannerFullscreen" class="fixed flex h-full w-full text-primary items-center justify-center scroll-auto
            bg-black/90 sm:bg-black/70 bg-contain bg-center bg-no-repeat z-30">
                <img :src="UserFocusModalState.currentUserPageDetails.ProfileData.banner" class="max-h-full max-w-full"/>
            </div>
        </TransitionGroup>
        <div class="relative z-20 flex flex-col max-w-[40rem] w-full sm:w-2/3s h-[95%] sm:h-4/5
        mx-2 sm:mx-auto my-auto rounded bg-focusBG text-primary drop-shadow-lg overflow-hidden">
            {{ void "Control Bar" }}
            <div id="user-modal-navbar" class="flex z-[4] bg-banner sticky top-0 h-8 shrink-0 w-full self-start
            border-b border-outlineLighter *:w-12 *:shadow-none *:rounded-none *:border-none">
                <!-- <SquareButton :is-disabled="!hasPrevNavRecords"
                title="Go to previous User Feed page" @click="goToPreviousNavHistory"
                class="enabled:bg-navbarBtn transition-colors enabled:hover:bg-navbarBtnHover
                focus-visible:outline-none focus-visible:!bg-navbarBtnHover text-navbarBtnText">
                    <i-mingcute:arrow-left-fill
                    class="text-2xl"
                    :class="[{'text-disabled' : !hasPrevNavRecords}]"/>
                </SquareButton>
                <SquareButton :is-disabled="!hasNextNavRecords"
                title="Go to next User Feed page" @click="goToNextNavHistory(true)"
                class="enabled:bg-navbarBtn transition-colors enabled:hover:bg-navbarBtnHover
                focus-visible:outline-none focus-visible:!bg-navbarBtnHover text-navbarBtnText">
                    <i-mingcute:arrow-right-fill
                    class="text-2xl"
                    :class="[{'text-disabled' : !hasNextNavRecords}]"/>
                </SquareButton> -->
                <SquareButton
                title="Refresh page" :is-disabled="awaitingProfileData || isAwaitingTabSwitchData || !isHandleValid" @click="refreshPage"
                class="enabled:bg-navbarBtn transition-colors enabled:hover:bg-navbarBtnHover
                focus-visible:outline-none focus-visible:!bg-navbarBtnHover text-navbarBtnText">
                    <i-mingcute:refresh-3-fill class="text-2xl"/>
                </SquareButton>
                <SquareButton @click="closeModal" title="Close User Feed Modal"
                class="ml-auto bg-btn hover:bg-red-600 focus-visible:bg-red-600">
                    <i-mingcute:close-fill class="text-2xl"/>
                </SquareButton>
            </div>
            {{ void "Main Container" }}
            <div v-if="!isHandleValid" class="flex flex-col gap-1 items-center mx-auto py-4">
                <i-mdi:alert-circle class="size-14"/>
                <div class="text-center pb-2">
                    <div class="font-bold bg-pink-300s">Unable to resolve handle</div>
                    <div class="text-sm leading-[14px] bg-lime-500s">Account may not exist</div>
                </div>
                <button title="Account Options" class="px-1 rounded bg-checkedButtonBG hover:bg-checkedButtonBGHover
                border border-outlineLighter shadow-none mr-1"
                @click="updateDisplayedData">Try Again?</button>
            </div>
            <div v-else id="user-focus-container" class="h-full overflow-auto outline-none" style="clip-path: inset(0 0 0 0 round 0px);" tabindex="0">
                <div class="flex flex-col h-full">
                    {{ void "Posts + Post Type Filters" }}
                    <div class="flex flex-col min-h-0s grow items-center">
                        {{ void "Banner+PFP Placeholder" }}
                        <div v-if="awaitingProfileData" class="relative w-full animate-pulse z-[3] user-banner">
                            <div class="bg-slate-500 w-full max-h-40s aspect-[3/1] shrink-0"/>
                            <div class="absolute bg-slate-400 rounded-full size-24 top-[4.5rem]s top-28 left-4
                            shrink-0 border-2 border-slate-800 user-pfp"></div>
                        </div>
                        <div v-else class="relative w-full user-banner">
                            <div v-if="hasProfileBanner" @click="showBannerFullscreen" class="bg-userFocusModalBannerBG w-full aspect-[3/1] shrink-0
                            bg-no-repeat bg-center bg-cover overflow-hidden"
                            :class="{'cursor-pointer' : hasProfileBanner}">
                                <img :src="UserFocusModalState.currentUserPageDetails.ProfileData.banner" :class="{'blur-lg':isAccountBlocked}"/>
                            </div>
                            <div v-else id="userFocusModal-placeholder-banner" class="bg-userFocusModalBannerBG w-full max-h-40s h-40s aspect-[3/1] shrink-0 bg-centers"
                            :style="`mask: url(./assets/placeholder/no_banner_pattern.svg)`">
                            </div>
                            <div v-if="hasProfileAvatar" @click="showPFPFullscreen" class="absolute z-[3] flex rounded-full aspect-square size-24 left-4
                            items-center justify-center shrink-0 border-2 border-slate-800 bg-no-repeat bg-center bg-cover user-pfp
                            cursor-pointer transition-colors hover:border-hover overflow-hidden">
                                <img :src="UserFocusModalState.currentUserPageDetails.ProfileData.avatar"
                                :class="{'blur scale-150':isAccountBlocked}"/>
                            </div>
                            <div v-else class="absolute z-[3] flex rounded-full aspect-square size-24 left-4
                            items-center justify-center shrink-0 border-2 border-slate-800 bg-no-repeat bg-center bg-cover user-pfp
                            transition-colors overflow-hidden">
                                <i-mingcute:butterfly-2-fill class="h-full w-full bg-slate-300 p-2 text-blue-600"/>
                            </div>
                        </div>
                        {{ void "User Details Content" }}
                        <div id="user-summary" class="flex flex-col z-[2] w-full sticky top-0 mt-10 py-2 px-4 bg-focusBG">
                            <div v-if="awaitingProfileData" class="flex flex-col w-full mt-1 gap-2 animate-pulse">
                                <div class="flex gap-2">
                                    <div class="flex flex-col w-full gap-1">
                                        <div class="h-9 rounded bg-slate-500"></div>
                                        <div class="h-3 w-48 rounded bg-slate-500"></div>
                                    </div>
                                    <div class="relative flex gap-3">
                                        <div class="h-9 w-[6.5rem] rounded-full bg-slate-500"></div>
                                        <div class="h-9 aspect-square rounded-full bg-slate-500"></div>
                                    </div>
                                </div>
                                <div class="flex gap-2">
                                    <div class="flex gap-1">
                                        <div class="h-5 w-8 bg-slate-500 rounded"></div>
                                        <div class="h-5 w-16 bg-slate-500 rounded"></div>
                                    </div>
                                    <div class="flex gap-1">
                                        <div class="h-5 w-8 bg-slate-500 rounded"></div>
                                        <div class="h-5 w-16 bg-slate-500 rounded"></div>
                                    </div>
                                    <div class="flex gap-1">
                                        <div class="h-5 w-8 bg-slate-500 rounded"></div>
                                        <div class="h-5 w-16 bg-slate-500 rounded"></div>
                                    </div>
                                </div>
                            </div>
                            <div v-else class="flex flex-col w-full">
                                <div class="flex justify-between overflow-hiddens">
                                    <div class="overflow-hidden">
                                        <div class="flex flex-wrap items-center gap-1 *:leading-6s">
                                            <div class="flex text-2xl font-semibold overflow-hidden text-ellipsis">
                                                {{UserFocusModalState.currentUserPageDetails.ProfileData ? UserFocusModalState.currentUserPageDetails.ProfileData.displayName : "Username Title"}}
                                            </div>
                                            <VerifiedBadge v-if="isUserVerified"/>
                                        </div>
                                        <div class="text-xs">{{UserFocusModalState.currentUserPageDetails.ProfileData ? '@'+UserFocusModalState.currentUserPageDetails.ProfileData.handle : '@handle'}}</div>
                                    </div>
                                    <div class="relative flex items-center mt-1 gap-2 h-9">
                                        <!-- <Transition name="smooth"> -->
                                            <FollowUser v-if="!awaitingProfileData && !isAccountBlocked" class="px-4" :is-user-followed="isUserFollowed"
                                            :user-did="UserFocusModalState.currentUserPageDetails.ProfileData.did" :is-disabled="!AppState.isAuthBrowsing || isAccountBlocked"/>
                                        <!-- </Transition> -->
                                        <PillButton @click="showUserOptionsMenu($event,UserFocusModalState.currentUserPageDetails.ProfileData.handle)" class="aspect-square h-full bg-btn hover:bg-btnHover
                                        focus-visible:bg-btnHover">...</PillButton>
                                    </div>
                                </div>
                                <div v-if="!isAccountBlocked" class="flex mt-2">
                                    <div v-if="!AppSettingsState.Settings.isHidingFollowers" class="flex text-sm pr-2">
                                        <div class="font-bold pr-1">{{UserFocusModalState.currentUserPageDetails ? UserFocusModalState.currentUserPageDetails.ProfileData.followersCount : '1'}}</div>
                                        <div class="text-secondary">followers</div>
                                    </div>
                                    <div v-if="!AppSettingsState.Settings.isHidingFollowing" class="flex text-sm pr-2">
                                        <div class="font-bold pr-1">{{UserFocusModalState.currentUserPageDetails ? UserFocusModalState.currentUserPageDetails.ProfileData.followsCount : '33'}}</div>
                                        <div class="text-secondary">following</div>
                                    </div>
                                    <div class="flex text-sm pr-2">
                                        <div class="font-bold pr-1">{{UserFocusModalState.currentUserPageDetails ? UserFocusModalState.currentUserPageDetails.ProfileData.postsCount : '7'}}</div>
                                        <div class="text-secondary">posts</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="user-focus-bio" class="flex flex-col py-2 px-4 mb-2s w-full border-y border-outlineLighter shrink grow-0 self-start">
                            <div class="text-xs text-secondary" v-if="!isAccountBlocked">Bio</div>
                            <div v-if="awaitingProfileData" class="flex flex-col gap-1 animate-pulse">
                                <div class="bg-slate-500 rounded h-4 w-4/5"></div>
                                <div class="bg-slate-500 rounded h-4 w-2/3"></div>
                                <div class="bg-slate-500 rounded h-4 w-3/5"></div>
                            </div>
                            <!-- <RichPostText v-else :post-text="currentUserPageDetails.ProfileData ? currentUserPageDetails.ProfileData.description : 'No Description'"/> -->
                            <RichPostTextBsky v-else-if="!awaitingProfileData && !isNavigatingHistory && !isAccountBlocked" :post-text="UserFocusModalState.currentUserPageDetails.ProfileData ? UserFocusModalState.currentUserPageDetails.ProfileData.description : 'No Description'"/>
                            <AccountModerationLabel :is-muted="isAccountMuted" :is-blocked="isAccountBlocked"/>
                        </div>
                        <div v-if="!isAccountBlocked" id="user-post-tabs" class="flex z-[2] w-full sticky text-center justify-between border-b border-outlineLighter bg-focusBG"
                        :style="{'top':userSummaryBottomPos+'px'}">
                            <div @click="viewFeed" class="w-full hover:bg-btnHover cursor-pointer"
                            title="View User's Feed (Posts, Retweets)">
                                <div class="pt-2 pb-1">Feed</div>
                                <div v-if="isViewingFeed" class="bg-blue-400 h-1 w-10 ml-auto mr-auto"></div>
                            </div>
                            <div @click="viewPosts" class="w-full hover:bg-btnHover cursor-pointer"
                            title="View Posts only by current User">
                                <div class="pt-2 pb-1">Posts</div>
                                <div v-if="isViewingPosts" class="bg-blue-400 h-1 w-10 ml-auto mr-auto"></div>
                            </div>
                            <div @click="viewReplies" class="w-full hover:bg-btnHover cursor-pointer"
                            title="View User's Replies">
                                <div class="pt-2 pb-1">Replies</div>
                                <div v-if="isViewingReplies" class="bg-blue-400 h-1 w-10 ml-auto mr-auto"></div>
                            </div>
                            <div @click="viewMedia" class="w-full hover:bg-btnHover cursor-pointer"
                            title="View Posts User has made containing Images/Video">
                                <div class="pt-2 pb-1">Media</div>
                                <div v-if="isViewingMedia" class="bg-blue-400 h-1 w-10 ml-auto mr-auto"></div>
                            </div>
                            <div v-if="!awaitingProfileData && isThisCurrentUserAccount" @click="viewLikes" class="w-full hover:bg-btnHover cursor-pointer"
                            title="View Your Liked Posts">
                                <div class="pt-2 pb-1">Likes</div>
                                <div v-if="isViewingLikes" class="bg-blue-400 h-1 w-10 ml-auto mr-auto"></div>
                            </div>
                            <div v-if="!awaitingProfileData && isThisCurrentUserAccount" @click="viewBookmarks" class="w-full hover:bg-btnHover cursor-pointer"
                            title="View Your Saved Posts">
                                <div class="pt-2 pb-1">Saved</div>
                                <div v-if="isViewingBookmarks" class="bg-blue-400 h-1 w-10 ml-auto mr-auto"></div>
                            </div>
                        </div>
                        {{ void "General Posts" }}
                        <div v-if="(isViewingFeed || isViewingPosts || isViewingReplies || isViewingLikes) && !isAccountBlocked"
                        class="flex flex-col flex-wrap items-start py-2 px-4 gap-2 max-w-[30rem] w-full">
                            {{ void "Placeholder Post" }}
                            <div v-if="awaitingProfileData || isAwaitingTabSwitchData" class="flex flex-col w-full p-2 gap-2 rounded-lg border border-slate-600 animate-pulse">
                                <div class="flex h-10 gap-2">
                                    <div class="rounded-full size-10 bg-slate-500"></div>
                                    <div class="flex flex-col gap-1 overflow-hidden">
                                        <div class="h-5 w-24 rounded bg-slate-500"></div>
                                        <div class="h-4 w-20 rounded bg-slate-500"></div>
                                    </div>
                                    <div class="h-3 w-20 rounded bg-slate-500 ml-auto"></div>
                                </div>
                                <div class="flex flex-col w-full gap-1 mt-1">
                                    <div class="h-5 w-3/5 rounded bg-slate-500"></div>
                                    <div class="h-5 w-4/5 rounded bg-slate-500"></div>
                                    <div class="h-5 w-2/5 rounded bg-slate-500"></div>
                                </div>
                                <div class="h-48 rounded-lg p-2 border border-slate-600">
                                    <div class="w-full h-full rounded bg-slate-500"></div>
                                </div>
                                <div class="flex justify-between">
                                    <div class="flex gap-1">
                                        <div class="h-5 w-6 rounded-lg bg-slate-500"></div>
                                        <div class="h-5 w-8 rounded-lg bg-slate-500"></div>
                                    </div>
                                    <div class="flex gap-1">
                                        <div class="h-5 w-6 rounded-lg bg-slate-500"></div>
                                        <div class="h-5 w-8 rounded-lg bg-slate-500"></div>
                                    </div>
                                    <div class="flex gap-1">
                                        <div class="h-5 w-6 rounded-lg bg-slate-500"></div>
                                        <div class="h-5 w-8 rounded-lg bg-slate-500"></div>
                                    </div>
                                    <div class="flex gap-1">
                                        <div class="h-5 w-6 rounded-lg bg-slate-500"></div>
                                        <div class="h-5 w-8 rounded-lg bg-slate-500"></div>
                                    </div>
                                    <div class="flex gap-1">
                                        <div class="h-5 w-6 rounded-lg bg-slate-500"></div>
                                        <div class="h-5 w-8 rounded-lg bg-slate-500"></div>
                                    </div>
                                </div>
                            </div>
                            <div v-else-if="!awaitingProfileData && !isNavigatingHistory" v-for="n in UserFocusModalState.currentUserPageDetails.FeedData.data as FeedViewPost[]"
                            class="w-full shrink-0s">
                                <!-- <FocusFeedPost :post-data="n.post" :post-reason="n.reason" :reply="n.reply" @focus-post-avatar-clicked="updateDisplayedData"/> -->
                                <FocusFeedPost :post-data="({$type:'app.bsky.feed.defs#postView',...n.post} as PostView)" :post-reason="n.reason" :reply="n.reply" @focus-post-avatar-clicked="updateDisplayedData"/>
                            </div>
                            <div v-if="!awaitingProfileData && !UserFocusModalState.currentUserPageDetails.FeedData.cursor"
                            class="flex justify-center rounded p-1 gap-1 w-full items-center
                            border border-outline bg-disabled select-none">
                                <i-mdi:block/>
                                <div>End of posts</div>
                            </div>
                            <SquareButton v-else-if="!awaitingProfileData && UserFocusModalState.currentUserPageDetails.FeedData.cursor"
                            @click="loadOlderPosts"
                            focus-padding="[1px]"
                            class="rounded h-8 p-1 mt-4s w-full items-center cursor-pointer
                            border border-outline bg-btn hover:bg-btnHover"
                            :title="isViewingLikes ? 'NOTE: Currently loading likes is broken - cannot currently identify end of stream' : 'Click to load older posts'">
                                <div class="flex items-center gap-1">
                                    <i-mingcute:loading-fill v-if="isAwaitingLoadMorePosts" class="spinner"/>
                                    <i-mingcute:plus-fill v-else/>
                                    <div>Load more</div>
                                </div>
                            </SquareButton>
                        </div>
                        {{ void "Bookmarks" }}
                        <div v-if="isViewingBookmarks" class="flex flex-col flex-wrap items-start py-2 px-4 gap-2 max-w-[30rem] w-full">
                            {{ void "Placeholder Post" }}
                            <div v-if="awaitingProfileData || isAwaitingTabSwitchData" class="flex flex-col w-full p-2 gap-2 rounded-lg border border-slate-600 animate-pulse">
                                <div class="flex h-10 gap-2">
                                    <div class="rounded-full size-10 bg-slate-500"></div>
                                    <div class="flex flex-col gap-1 overflow-hidden">
                                        <div class="h-5 w-24 rounded bg-slate-500"></div>
                                        <div class="h-4 w-20 rounded bg-slate-500"></div>
                                    </div>
                                    <div class="h-3 w-20 rounded bg-slate-500 ml-auto"></div>
                                </div>
                                <div class="flex flex-col w-full gap-1 mt-1">
                                    <div class="h-5 w-3/5 rounded bg-slate-500"></div>
                                    <div class="h-5 w-4/5 rounded bg-slate-500"></div>
                                    <div class="h-5 w-2/5 rounded bg-slate-500"></div>
                                </div>
                                <div class="h-48 rounded-lg p-2 border border-slate-600">
                                    <div class="w-full h-full rounded bg-slate-500"></div>
                                </div>
                                <div class="flex justify-between">
                                    <div class="flex gap-1">
                                        <div class="h-5 w-6 rounded-lg bg-slate-500"></div>
                                        <div class="h-5 w-8 rounded-lg bg-slate-500"></div>
                                    </div>
                                    <div class="flex gap-1">
                                        <div class="h-5 w-6 rounded-lg bg-slate-500"></div>
                                        <div class="h-5 w-8 rounded-lg bg-slate-500"></div>
                                    </div>
                                    <div class="flex gap-1">
                                        <div class="h-5 w-6 rounded-lg bg-slate-500"></div>
                                        <div class="h-5 w-8 rounded-lg bg-slate-500"></div>
                                    </div>
                                    <div class="flex gap-1">
                                        <div class="h-5 w-6 rounded-lg bg-slate-500"></div>
                                        <div class="h-5 w-8 rounded-lg bg-slate-500"></div>
                                    </div>
                                    <div class="flex gap-1">
                                        <div class="h-5 w-6 rounded-lg bg-slate-500"></div>
                                        <div class="h-5 w-8 rounded-lg bg-slate-500"></div>
                                    </div>
                                </div>
                            </div>
                            <div v-else-if="!awaitingProfileData && !isNavigatingHistory" class="flex flex-col w-full gap-2">
                                <div v-for="b in UserFocusModalState.currentUserPageDetails.Bookmarks">
                                    <FocusFeedPost @focus-post-avatar-clicked="updateDisplayedData" v-if="isPostView(b.item)" :post-data="b.item"></FocusFeedPost>
                                </div>
                                <div v-if="!awaitingProfileData && hasEndOfBookmarksBeenReached"
                                class="flex justify-center rounded p-1 gap-1 w-full items-center
                                border border-outline bg-disabled select-none">
                                    <i-mdi:block/>
                                    <div>End of Saved Posts</div>
                                </div>
                                <SquareButton v-else-if="!awaitingProfileData && typeof UserFocusModalState.currentUserPageDetails.FeedData.cursor != 'undefined'"
                                @click="loadOlderPosts"
                                focus-padding="[1px]"
                                class="rounded h-8 p-1 w-full items-center cursor-pointer
                                border border-outline bg-btn hover:bg-btnHover"
                                :title="isViewingLikes ? 'NOTE: Currently loading likes is broken - cannot currently identify end of stream' : 'Click to load older posts'">
                                    <div class="flex items-center gap-1">
                                        <i-mingcute:loading-fill v-if="isAwaitingLoadMorePosts" class="spinner"/>
                                        <i-mingcute:plus-fill v-else/>
                                        <div>Load more</div>
                                    </div>
                                </SquareButton>
                            </div>
                        </div>
                        {{ void "Media Posts" }}
                        <div v-if="isViewingMedia" class="py-4 w-full">
                            <div v-if="awaitingProfileData || isAwaitingTabSwitchData" class="grid gap-2 self-center
                            grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] justify-items-center
                            backdrop-blur-0 overflow-x-hiddens">
                                <div v-for="x in 6" class="size-44 rounded bg-slate-500 border border-outlineLighter animate-pulse"></div>
                            </div>
                            <div v-else-if="!awaitingProfileData" class="grid gap-2 self-center
                            grid-cols-[repeat(auto-fill,minmax(11rem,1fr))] justify-items-center
                            backdrop-blur-0 overflow-x-hiddens">
                                <div v-for="n in UserFocusModalState.currentUserPageDetails.FeedData.data.filter(
                                    x => x.post.embed && x.post.author.did == UserFocusModalState.currentUserPageDetails.ProfileData.did &&
                                    (AppBskyEmbedImages.isView(x.post.embed) || AppBskyEmbedVideo.isView(x.post.embed)))"
                                    class="relative rounded aspect-square size-44 overflow-hidden border border-outlineLighter">
                                    <div v-if="n.post.embed.images && n.post.embed.images.length>1" class="select-none">
                                        <div class="absolute z-[3] flex rounded top-2 right-2 size-6 bg-slate-300 backdrop-blur-sm text-slate-900 font-bold items-center justify-center drop-shadow">{{ n.post.embed?.images.length }}</div>
                                        <div class="absolute z-[2] flex rounded top-[5px] right-[5px] size-6 bg-slate-300/60 text-slate-900 font-bold items-center justify-center drop-shadow"></div>
                                    </div>
                                    <div v-if="n.post.embed.images" class="absolute z-[2] rounded-md bottom-1 right-1 p-1 text-xs text-white bg-black/70 select-none">Photo</div>
                                    <div v-else class="absolute z-[2] rounded-md bottom-1 right-1 p-1 text-xs text-white bg-black/70 select-none">Video</div>
                                    <SpoilerOverlay class="z-[1]" :labels="n.post.labels" :has-sensitive-content="hasSensitiveContent(n)" :media-type="n.post.embed?.images ? MediaType.Image : MediaType.Video"/>
                                    <div @click="showMediaContent(n)" class="relative flex bg-violet-500 hover:bg-violet-300
                                    cursor-pointer w-full h-full bg-no-repeat bg-center bg-cover
                                    overflow-hidden backdrop-blur-0"
                                    :title="n.post.embed?.images ? n.post.embed?.images[0].alt : null"
                                    :style="'background-image: url('+(n.post.embed.images ? n.post.embed.images[0].thumb : n.post.embed?.thumbnail)+')'">
                                    </div>
                                    <!-- Started on using `ImageContainer` for the thumbnails displayed on the media tab
                                    but realized that it doesn't really make sense when you can just download the image after
                                    opening the `PostFocusModal`. Maybe I'll change things later. -->
                                    <!-- <ImageContainer @click="showMediaContent(n)" :images-to-display="n.post.embed.images ? n.post.embed.images.slice(0,1) : [{alt:'',fullsize:n.post.embed?.thumbnail,thumb:n.post.embed?.thumbnail}]" :author="n.post.author.handle"/> -->
                                </div>
                            </div>
                            <div v-if="!UserFocusModalState.currentUserPageDetails.FeedData.cursor"
                            class="flex justify-center rounded p-1 gap-1 mt-4 w-full items-center
                            border border-outlineLighter bg-disabled select-none">
                                <i-mdi:block/>
                                <div>End of posts</div>
                            </div>
                            <SquareButton v-else-if="UserFocusModalState.currentUserPageDetails.FeedData.cursor &&
                            !isAwaitingTabSwitchData" @click="loadOlderPosts"
                            focus-padding="[1px]"
                            class="rounded h-8 p-1 mt-4 mx-4 w-full items-center cursor-pointer
                            border border-outline bg-btn hover:bg-btnHover">
                                <div class="flex items-center gap-1">
                                    <i-mingcute:loading-fill v-if="isAwaitingLoadMorePosts" class="spinner"/>
                                    <i-mingcute:plus-fill v-else/>
                                    <div>Load more</div>
                                </div>
                            </SquareButton>
                        </div>
                    </div>
                </div>
                <ToContainerTop class="right-3 bottom-2"/>
            </div>
        </div>
    </div>
</template>

<script lang="ts">
//Option Menu icons
import MingcuteLinkLine from '~icons/mingcute/link-line';
import MingcuteVolumeMuteFill from '~icons/mingcute/volume-mute-fill';
import MingcuteVolumeFill from '~icons/mingcute/volume-fill';
import MdiPersonBlock from '~icons/mdi/person-block';
import MdiUserCheck from '~icons/mdi/user-check';

import { defineComponent } from 'vue'
import PillButton from '../Utilities/PillButton.vue';
import { postDetails, showFocusModal } from '../../state/PostDetails.vue';
import { AppState, toast } from '../../state/AppState.vue';
import { FeedViewPost, isPostView, isReasonRepost, PostView } from '@atproto/api/dist/client/types/app/bsky/feed/defs';
import { AppBskyActorGetProfile, AppBskyEmbedExternal, AppBskyEmbedImages, AppBskyEmbedRecord, AppBskyEmbedRecordWithMedia, AppBskyEmbedVideo, isDid } from '@atproto/api';
import { isImage } from '@atproto/api/dist/client/types/app/bsky/embed/images';
import { GenerateTagLinkText } from '../../helpers/parsers';
import Hashtag from '../Utilities/Hashtag.vue';
import RichPostText from '../Utilities/RichPostText.vue';
import { GetBrowsingAgent } from '../../lib/api.vue';
import ImageContainer from '../Utilities/ImageContainer.vue';
import AvatarRound from '../Utilities/AvatarRound.vue';
import { convertToLongTimestamp, convertToShortTimestamp } from '../../helpers/converters';
import EmbedExternal from '../Utilities/EmbedExternal.vue';
import VideoContainer from '../Utilities/VideoContainer.vue';
import FocusFeedPost from '../Feed/FocusFeedPost.vue';
import FollowUser from '../Utilities/FollowUser.vue';
import ToContainerTop from '../Utilities/ToContainerTop.vue';
import { IFeedReturnedPostResults } from '../../interfaces/FeedInterfaces';
import { GetFeedDataForFeedType } from '../../state/FeedList.vue';
import { FeedEnums } from '../../enums/FeedEnums';
import SpoilerOverlay from '../Utilities/SpoilerOverlay.vue';
import { UserFocusModalState } from '../../state/UserFocusModalState.vue';
import { MediaType } from '../../enums/PostEnums';
import RichPostTextBsky from '../Utilities/RichPostTextBsky.vue';
import VerifiedBadge from '../Utilities/VerifiedBadge.vue';
import { getAuthorBookmarks, getAuthorFeed, getAuthorLikes, getAuthorPostsOnly, getAuthorRepliesOnly } from '../../lib/api/Feed.vue';
import SquareButton from '../Utilities/SquareButton.vue';
import { OptionsMenuState } from '../../state/OptionsMenuState.vue';
import { IOptionMenuItem, ItemType } from '../Utilities/OptionsMenu.vue';
import { AppSettingsState } from '../../state/AppSettingsState.vue';
import { toggleBlock, toggleMute } from '../../lib/api/User.vue';
import AccountModerationLabel from '../Utilities/AccountModerationLabel.vue';
import { INavigationHistory } from '../../interfaces/UserInterfaces';

/**
 * Used to create a HTTP URL link To the currently view User's profile.
 * @param handle The handle of the User associated with the link.
 */
function CopyPostLink(handle:string){
    if(handle.trim()!='') navigator.clipboard.writeText(`https://bsky.app/profile/${handle}`);
    toast.add({summary:'Link to User Profile copied',severity:'success', group:'bc', life:1000});
}

export default defineComponent({
    props:{
        handle:{
            type:String,
        }
    },
    data(){
        return{
            AppState,
            AppSettingsState,
            UserFocusModalState,
            MediaType,
            isImage,
            isReasonRepost,
            isPostView,
            GenerateTagLinkText,
            convertToShortTimestamp,
            convertToLongTimestamp,
            AppBskyEmbedImages,
            AppBskyEmbedVideo,
            AppBskyEmbedRecord,
            AppBskyEmbedRecordWithMedia,
            AppBskyEmbedExternal,
            /**
             * The handle of the last User Profile to be displayed. Currently only used
             * to save the scroll position when navigating to a new User Profile.
             */
            lastHandle:'',
            /**Variable that indicates if the passed in handle is a valid handle (can be resolved thru Bluesky's API). */
            isHandleValid:true,
            isViewingFeed:true,
            isViewingPosts:false,
            isViewingReplies:false,
            isViewingMedia:false,
            isViewingLikes:false,
            isViewingBookmarks:false,
            awaitingProfileData:false,
            isAwaitingTabSwitchData:false,
            isAwaitingLoadMorePosts:false,
            /**
             * Indicates if we are currently switching between already viewed pages.
             * Used to update component content when using page history navigation.
             */
            isNavigatingHistory:false,
            /**Are we currently waiting for an action relating to muting or unmuting a User account to finish? */
            isAwaitingAccountMuteAction:false,
            /**Are we currently waiting for an action relating to blocking or unblockng a User account to finish? */
            isAwaitingAccountBlockAction:false,
            currentUserAccountTimelineData:{data:[],cursor:''} as IFeedReturnedPostResults,
            userSummaryBottomPos:0,
            /**Is the User's PFP being shown fullscreen? */
            isPFPFullscreen:false,
            /**Is the User's Profile Banner being shown fullscreen? */
            isBannerFullscreen:false,
        }
    },
    components:{
        PillButton,
        Hashtag,
        FocusFeedPost,
        RichPostText,
        RichPostTextBsky,
        ImageContainer,
        VideoContainer,
        SpoilerOverlay,
        AvatarRound,
        EmbedExternal,
        FollowUser,
        VerifiedBadge,
        ToContainerTop,
        SquareButton,
        AccountModerationLabel,
    },
    methods:{
        /**Prepares and displays data when the "Posts" tab is clicked. */
        async viewFeed(){
            if(!this.awaitingProfileData){
                this.repositionScrollOnTabSwitch();
                this.deselectAllTabs();
                this.isViewingFeed = true;
                let historyData = UserFocusModalState.currentUserPageDetails;
                UserFocusModalState.updateSelectedTabInNavHistory(this.handle,FeedEnums.UserFeedTabs.Feed);
                this.isAwaitingTabSwitchData = true;
                await getAuthorFeed(this.handle)
                .then(res => {
                    historyData.FeedData.data = res.data.feed;
                    historyData.FeedData.cursor = res.data.cursor;
                })
                .catch(err => {
                    toast.add({summary:"Error getting Posts", detail:`${err}`, severity:'error', group:'tr', life:3000});
                });
                this.isAwaitingTabSwitchData = false;
            }
        },
        /**Prepares and displays data when the "Posts" tab is clicked. */
        async viewPosts(){
            if(!this.awaitingProfileData){
                this.repositionScrollOnTabSwitch();
                this.deselectAllTabs();
                this.isViewingPosts = true;
                let historyData = UserFocusModalState.currentUserPageDetails;
                UserFocusModalState.updateSelectedTabInNavHistory(this.handle,FeedEnums.UserFeedTabs.Posts);
                this.isAwaitingTabSwitchData = true;
                await getAuthorPostsOnly(UserFocusModalState.currentUserPageDetails.ProfileData.did)
                .then(res => {
                    historyData.FeedData.data = res.data.feed;
                    historyData.FeedData.cursor = res.data.cursor;
                })
                .catch(err => toast.add({summary:`Error getting @${UserFocusModalState.currentUserPageDetails.ProfileData.handle}'s Posts`, detail:`${err}`, severity:'error', group:'tr', life:3000}));
                this.isAwaitingTabSwitchData = false;
            }
        },
        /**Prepares and displays data when the "Replies" tab is clicked. */
        async viewReplies(){
            if(!this.awaitingProfileData){
                this.repositionScrollOnTabSwitch();
                this.deselectAllTabs();
                this.isViewingReplies = true;
                let historyData = UserFocusModalState.currentUserPageDetails;
                UserFocusModalState.updateSelectedTabInNavHistory(this.handle,FeedEnums.UserFeedTabs.Replies);
                this.isAwaitingTabSwitchData = true;
                await getAuthorRepliesOnly(UserFocusModalState.currentUserPageDetails.ProfileData.did)
                .then(res => {
                    historyData.FeedData.data = res.data.feed;
                    historyData.FeedData.cursor = res.data.cursor;
                })
                .catch(err => toast.add({summary:`Error getting @${UserFocusModalState.currentUserPageDetails.ProfileData.handle}'s Replies`, detail:`${err}`, severity:'error', group:'tr', life:3000}));
                this.isAwaitingTabSwitchData = false;
            }
        },
        /**Prepares and displays data when the "Media" tab is clicked. */
        async viewMedia(){
            if(!this.awaitingProfileData){
                this.repositionScrollOnTabSwitch();
                this.deselectAllTabs();
                this.isViewingMedia = true;
                let historyData = UserFocusModalState.currentUserPageDetails;
                UserFocusModalState.updateSelectedTabInNavHistory(this.handle,FeedEnums.UserFeedTabs.Media);
                this.isAwaitingTabSwitchData = true;
                //Get media posts
                await GetBrowsingAgent().getAuthorFeed({
                    actor:UserFocusModalState.currentUserPageDetails.ProfileData.did,
                    filter:'posts_with_media',
                })
                .then(res => {
                    historyData.FeedData.data = res.data.feed;
                    historyData.FeedData.cursor = res.data.cursor;
                })
                .catch(err => toast.add({summary:`Error getting @${UserFocusModalState.currentUserPageDetails.ProfileData.handle}'s media`, detail:`${err}`, severity:'error', group:'tr', life:3000}));
                this.isAwaitingTabSwitchData = false;
            }
        },
        /**Prepares and displays data when the "Likes" tab is clicked. */
        async viewLikes(){
            if(!this.awaitingProfileData){
                this.repositionScrollOnTabSwitch();
                this.deselectAllTabs();
                this.isViewingLikes = true;
                let historyData = UserFocusModalState.currentUserPageDetails;
                UserFocusModalState.updateSelectedTabInNavHistory(this.handle,FeedEnums.UserFeedTabs.Likes);
                this.isAwaitingTabSwitchData = true;
                //Get liked posts
                await getAuthorLikes(UserFocusModalState.currentUserPageDetails.ProfileData.did)
                .then(res => {
                    historyData.FeedData.data = res.data.feed;
                    historyData.FeedData.cursor = res.data.cursor;
                })
                .catch(err => toast.add({summary:`Error getting @${UserFocusModalState.currentUserPageDetails.ProfileData.handle}'s Likes`, detail:`${err}`, severity:'error', group:'tr', life:3000}));
                this.isAwaitingTabSwitchData = false;
            }
        },
        /**Prepares and displays data when the "Saved" tab is clicked. */
        async viewBookmarks(){
            if(!this.awaitingProfileData){
                this.repositionScrollOnTabSwitch();
                this.deselectAllTabs();
                this.isViewingBookmarks = true;
                let historyData = UserFocusModalState.currentUserPageDetails;
                UserFocusModalState.updateSelectedTabInNavHistory(this.handle,FeedEnums.UserFeedTabs.Bookmarks);
                this.isAwaitingTabSwitchData = true;
                //Get liked posts
                await getAuthorBookmarks(undefined,10)
                .then(res => {
                    historyData.Bookmarks = res.data.bookmarks;
                    historyData.FeedData.cursor = res.data.cursor;
                })
                .catch(err => toast.add({summary:`Error getting your Bookmarks`, detail:`${err}`, severity:'error', group:'tr', life:3000}));
                this.isAwaitingTabSwitchData = false;
            }
        },
        async loadOlderPosts(){
            this.isAwaitingLoadMorePosts = true;
            if(this.isViewingFeed || this.isViewingMedia){
                await GetFeedDataForFeedType(FeedEnums.Types.User,UserFocusModalState.currentUserPageDetails.ProfileData.did,'', UserFocusModalState.currentUserPageDetails.FeedData.cursor)
                .then(res => {
                    res.data.forEach(post => {
                        UserFocusModalState.currentUserPageDetails.FeedData.data.push(post);
                    });
                    UserFocusModalState.currentUserPageDetails.FeedData.cursor = res.cursor;
                })
                .catch(err => toast.add({summary:`Error loading more posts`, detail:`${err}`, severity:'error', group:'tr', life:3000}));
            }
            else if(this.isViewingLikes){
                let agent = GetBrowsingAgent();
                await getAuthorLikes(agent.assertDid,UserFocusModalState.currentUserPageDetails.FeedData.cursor)
                .then(res => {
                    res.data.feed.forEach(post => {
                        UserFocusModalState.currentUserPageDetails.FeedData.data.push(post);
                    });
                    UserFocusModalState.currentUserPageDetails.FeedData.cursor = res.data.cursor;
                })
                .catch(err => toast.add({summary:`Error loading more posts`, detail:`${err}`, severity:'error', group:'tr', life:3000}));
            }
            else if(this.isViewingBookmarks){
                await getAuthorBookmarks(UserFocusModalState.currentUserPageDetails.FeedData.cursor)
                .then(res => {
                    let bList = UserFocusModalState.currentUserPageDetails.Bookmarks;
                    if(typeof bList != 'undefined' && res.data.bookmarks.length>0){
                        res.data.bookmarks.forEach(b => {
                            bList.push(b);
                        });
                        UserFocusModalState.currentUserPageDetails.FeedData.cursor = res.data.cursor;
                    }
                    else UserFocusModalState.currentUserPageDetails.FeedData.cursor = '';
                })
                .catch(err => toast.add({summary:`Error loading more Bookmarks`, detail:`${err}`, severity:'error', group:'tr', life:3000}));
            }
            else if(this.isViewingPosts){
                await getAuthorPostsOnly(UserFocusModalState.currentUserPageDetails.ProfileData.did, UserFocusModalState.currentUserPageDetails.FeedData.cursor)
                .then(res => {
                    res.data.feed.forEach(post => {
                        UserFocusModalState.currentUserPageDetails.FeedData.data.push(post);
                    });
                    UserFocusModalState.currentUserPageDetails.FeedData.cursor = res.data.cursor;
                })
                .catch(err => toast.add({summary:`Error loading more posts`, detail:`${err}`, severity:'error', group:'tr', life:3000}));
            }
            else if(this.isViewingReplies){
                await getAuthorRepliesOnly(UserFocusModalState.currentUserPageDetails.ProfileData.did, UserFocusModalState.currentUserPageDetails.FeedData.cursor)
                .then(res => {
                    res.data.feed.forEach(post => {
                        UserFocusModalState.currentUserPageDetails.FeedData.data.push(post);
                    });
                    UserFocusModalState.currentUserPageDetails.FeedData.cursor = res.data.cursor;
                })
                .catch(err => toast.add({summary:`Error loading more posts`, detail:`${err}`, severity:'error', group:'tr', life:3000}));
            }
            this.isAwaitingLoadMorePosts = false;
        },
        /**Deselects all the "Post type" tabs. */
        deselectAllTabs(){
            this.isViewingFeed = this.isViewingPosts = this.isViewingReplies = this.isViewingMedia = this.isViewingLikes = this.isViewingBookmarks = false;
        },
        closeModal(){
            this.$router.push('/');
        },
        showMediaContent(post:FeedViewPost){
            // postDetails.isFocusVisible = true;
            // showFocusModal(post.post.uri,0);
            let postDid:string|undefined = post.post.uri.split('/').pop();
            this.$router.push(`/profile/${post.post.author.handle}/post/${postDid}/0`);
        },
        /**
         * Method used to update the "User profile/post" data displayed in the modal.
         * The displayed data is determined by the `handle` prop. The retrieved data
         * is stored in {@link UserFocusModalState.navigationHistory} &
         * {@link UserFocusModalState.currentUserPageDetails}.
         */
        async updateDisplayedData(){
            this.awaitingProfileData = true;
            this.isHandleValid = true;
            await UserFocusModalState.updateCurrentUserPageDetails(this.handle)
            .then(res => {
                this.isHandleValid = res
                if(this.isHandleValid) document.title = `${UserFocusModalState.currentUserPageDetails.ProfileData.displayName?.trim()!='' ?
                    UserFocusModalState.currentUserPageDetails.ProfileData.displayName : UserFocusModalState.currentUserPageDetails.ProfileData.handle}'s Account | moongate`;
                else document.title = `Account Not Found | moongate`;
                this.restoreTabAfterNavHistoryChange(UserFocusModalState.currentUserPageDetails.currentTab);
            });
            if(this.isHandleValid){//If provided handle is valid
                //check to see if user-summary height has changed
                //small delay to allow DOM to update
                setTimeout(() => {
                    this.setUserSummaryBottomPos();
                }, 10);
            }
            this.awaitingProfileData = false;
        },
        /**
         * Method that determines if a particular Post's media contains
         * Sensitive Content.
         * */
        hasSensitiveContent(n:FeedViewPost){
            if(n.post.labels && n.post.labels.length>0) return true;
            return false;
        },
        /**
         * Method that sets the bottom position of the `user-summary` element.
         * Used to make sure the "post category tabs" element is properly
         * "stickied".
         */
        setUserSummaryBottomPos(){
            // console.log('Getting user-summary element:')
            // console.log((document.getElementById('user-summary') as HTMLElement).clientHeight);
            // let navbarHeight = (document.getElementById('user-modal-navbar') as HTMLElement).getBoundingClientRect().height;
            this.userSummaryBottomPos = (document.getElementById('user-summary') as HTMLElement).getBoundingClientRect().height;
        },
        /**
         * Method that returns the scroll-top position needed so the "post tabs" will be
         * exactly at the top of the modal. Used by `repositionScrollOnTabSwitch()`
         * when switching tabs.
         */
        getUserFocusTabsScrollTopPos(){
            let bio = document.getElementById('user-focus-bio');
            let summary = document.getElementById('user-summary');
            if(summary){
                // let navbarHeight = (document.getElementById('user-modal-navbar') as HTMLElement).getBoundingClientRect().height;
                let bioBottomPos = bio ? bio.offsetTop+bio.getBoundingClientRect().height : 0;
                return bioBottomPos-summary.getBoundingClientRect().height;
            }
            return 0;
        },
        /**
         * Method used to adjust `user-focus-container` scroll position when tab is switched.
         * Will only update scroll when user has scrolled "past" tabs (the Post content has scrolled
         * up past the tabs). Used when switching tabs.
         */
        repositionScrollOnTabSwitch(){
            let userFocusContainer = (document.getElementById('user-focus-container') as HTMLElement);
            let targetTabPos = this.getUserFocusTabsScrollTopPos();
            //only reposition if user has scrolled past tabs
            if(userFocusContainer && userFocusContainer.scrollTop >= targetTabPos){
                this.scrollToModalPos(targetTabPos);
            }
        },
        /**
         * Method used to scroll to position in `UserFocusModal`. Used
         * when loading/switching "main content" to improve the UX.
         * @param newPos The scroll position to move to.
         * @param behavior The scroll behavior to use. Defaults to instant.
         */
        scrollToModalPos(newPos:number, behavior:ScrollBehavior = 'instant'){
            let userFocusContainer = (document.getElementById('user-focus-container') as HTMLElement);
            // console.log(userFocusContainer.scrollTop);
            userFocusContainer.scrollTo({top:newPos,behavior:behavior});
            // console.log(userFocusContainer.scrollTop);
        },
        /**
         * Method that calls `PrevNavHistory` to display the previous
         * User Account in the modal's navigation history.
         */
        goToPreviousNavHistory(){
            this.updateCurrentNavHistoryScrollPos();
            this.isNavigatingHistory = true;
            UserFocusModalState.PrevNavHistory();
            setTimeout(() => {
                this.restoreTabAfterNavHistoryChange(UserFocusModalState.currentUserPageDetails.currentTab);
                this.restoreScrollPosAfterNavHistoryChange();
                this.isNavigatingHistory = false;
            }, 1);
        },
        /**
         * Method that calls `NextNavHistory` to display the next
         * User Account in the modal's navigation history.
         */
        goToNextNavHistory(updateScrollPos:boolean = true){
            if(updateScrollPos) this.updateCurrentNavHistoryScrollPos();
            this.isNavigatingHistory = true;
            UserFocusModalState.NextNavHistory();
            setTimeout(() => {
                this.restoreTabAfterNavHistoryChange(UserFocusModalState.currentUserPageDetails.currentTab);
                this.restoreScrollPosAfterNavHistoryChange();
                this.isNavigatingHistory = false;
            }, 1);
        },
        /**
         * Refreshes displayed Feed data by navigating to "Feed" tab and getting the latest data.
         */
        async refreshFeedData(){
            await this.viewFeed();
        },
        /**
         * Refreshes currently displayed account page.
         */
        async refreshPage(){
            this.awaitingProfileData = true;
            this.scrollToModalPos(0);
            await GetBrowsingAgent().getProfile({
                actor:UserFocusModalState.currentUserPageDetails.ProfileData.did
            })
            .then(res => {
                UserFocusModalState.currentUserPageDetails.ProfileData = res.data;
            });
            this.awaitingProfileData = false;
            await this.viewFeed();
        },
        /**
         * Method that updates the currently viewed "Navigation History" object's
         * `scrollPos`. Used to keep track of the scroll position the user was in
         * the feed before navigating forward or backwards.
         */
        updateCurrentNavHistoryScrollPos(){
            let userFocusContainer = (document.getElementById('user-focus-container') as HTMLElement);
            // UserFocusModalState.currentUserPageDetails.scrollPos = userFocusContainer.scrollTop;
            if(userFocusContainer != null)
                UserFocusModalState.updateScrollPosInNavHistory(this.lastHandle,userFocusContainer.scrollTop);
            this.lastHandle = this.handle; //update lastHandle to reflect move to Profile has completed
        },
        /**
         * Method that restores the last scroll position the `UserFocusModal` had when
         * viewing the "Navigation History" object that has just been displayed. Called
         * when navigating forwards and backwards through the history.
         */
        restoreScrollPosAfterNavHistoryChange(){
            setTimeout(() => {
                this.scrollToModalPos(UserFocusModalState.currentUserPageDetails.scrollPos);
            }, 100);
        },
        /**
         * Method that restores the last tab the "Navigation History" object was displaying.
         * Called when navigating forwards and backwards through the history.
         * @param lastTab
         */
        restoreTabAfterNavHistoryChange(lastTab:FeedEnums.UserFeedTabs){
            this.deselectAllTabs();
            switch (lastTab) {
                case FeedEnums.UserFeedTabs.Feed:
                    this.isViewingFeed = true;
                    break;
                case FeedEnums.UserFeedTabs.Posts:
                    this.isViewingPosts = true;
                    break;
                case FeedEnums.UserFeedTabs.Replies:
                    this.isViewingReplies = true;
                    break;
                case FeedEnums.UserFeedTabs.Media:
                    this.isViewingMedia = true;
                    break;
                case FeedEnums.UserFeedTabs.Likes:
                    this.isViewingLikes = true;
                    break;
                case FeedEnums.UserFeedTabs.Bookmarks:
                    this.isViewingBookmarks = true;
                    break;
                default:
                    this.isViewingFeed = true;
                    break;
            }
        },
        /**
         * Method used to navigate through the modal navigation history
         * if the shortcut Alt + Left Arrow or Alt + Right Arrow is pressed.
         * @param e Key down event.
         */
        onKeyboardShorcutEntered(e:KeyboardEvent){
            if(e.key == 'ArrowLeft' && e.altKey && !e.repeat){
                this.goToPreviousNavHistory();
            }
            else if(e.key == 'ArrowRight' && e.altKey && !e.repeat){
                this.goToNextNavHistory();
            }
            // else if(!e.repeat) console.log('Other key pressed: '+e.key);
        },
        /**
         * Method that adds support for navigating through the modal navigation history
         * using the Mouse "Browser Back" and "Browser Forwards" buttons.
         * @param e The MouseEvent fired.
         */
        onMouseShortcutEntered(e:MouseEvent){
            if(e.button == 3) this.goToPreviousNavHistory();
            else if (e.button == 4) this.goToNextNavHistory();
        },
        /**
         * Method used to update the displayed User Profile. Reduces the index value
         * used to choose which profile stored in the "User Profile cache".
         */
        onNavigateBack(e:PopStateEvent){
            console.log(e);
        },
        /**
         * Shows Options Menu allowing user to perform different actions
         * relating to the selected User Profile being viewed.
         */
        showUserOptionsMenu(e:MouseEvent, handle:string=""){
            e.preventDefault();
            OptionsMenuState.currentMenuItems = [
                {Icon:MingcuteLinkLine,Label:'Copy link to Profile Page',Action:function(){CopyPostLink(handle)},Type:ItemType.Option},
            ] as IOptionMenuItem[]
            if(AppState.isAuthBrowsing && GetBrowsingAgent().did != UserFocusModalState.currentUserPageDetails.ProfileData.did){
                    OptionsMenuState.currentMenuItems.push({Icon:MingcuteVolumeMuteFill,Label:'',Action:()=>{},Type:ItemType.Splitter});
                if(!this.isAccountMuted)
                    OptionsMenuState.currentMenuItems.push({Icon:MingcuteVolumeMuteFill,Label:'Mute Account',Action:this.requestToggleMute,Type:ItemType.Option});
                else
                    OptionsMenuState.currentMenuItems.push({Icon:MingcuteVolumeFill,Label:'Unmute Account',Action:this.requestToggleMute,Type:ItemType.Option});
                if(!this.isAccountBlocked)
                    OptionsMenuState.currentMenuItems.push({Icon:MdiPersonBlock,Label:'Block Account',Action:this.requestToggleBlock,Type:ItemType.Option});
                else
                    OptionsMenuState.currentMenuItems.push({Icon:MdiUserCheck,Label:'Unblock Account',Action:this.requestToggleBlock,Type:ItemType.Option});
            }
            OptionsMenuState.showOptionMenu(e);
        },
        /**
         * Method used to attempt to mute/unmute the account associated with the
         * Post that was interacted with.
         */
        async requestToggleMute(){
            if(this.isAwaitingAccountMuteAction) return;
            this.isAwaitingAccountMuteAction = true;
            await toggleMute(UserFocusModalState.currentUserPageDetails.ProfileData)
            .finally(() => {this.isAwaitingAccountMuteAction = false});
        },
        /**
         * Method used to attempt to block/unblock the account associated with the
         * Post that was interacted with.
         */
        async requestToggleBlock(){
            if(this.isAwaitingAccountBlockAction) return;
            this.isAwaitingAccountBlockAction = true;
            await toggleBlock(UserFocusModalState.currentUserPageDetails.ProfileData)
            .finally(() => {this.isAwaitingAccountBlockAction = false});
            if(!this.isAccountBlocked){
                let curState = UserFocusModalState.currentUserPageDetails;
                curState.FeedData.data = []; //clear content
                curState.FeedData.cursor = '';
                setTimeout(() => { //Allow for unblock to be processed before attempting refresh
                    this.refreshFeedData();
                }, 150);
            }
        },
        showPFPFullscreen(){
            this.isPFPFullscreen = true;
        },
        hidePFPFullscreen(){
            this.isPFPFullscreen = false;
        },
        showBannerFullscreen(){
            this.isBannerFullscreen = true;
        },
        hideBannerFullscreen(){
            this.isBannerFullscreen = false;
        },
    },
    computed:{
        /**
         * Method that checks to see if the User is following the currently displayed account.
         * In order for this value to be accurate, we must wait until the API call finishes, so
         * `awaitingProfileData` must be false. Currently handled via v-if on the `FollowUser`
         * component above.
         */
        isUserFollowed(){
            let viewer = UserFocusModalState.currentUserPageDetails.ProfileData.viewer;
            if(typeof viewer != 'undefined' && viewer.following){
                return true;
            }
            return false;
        },
        /**
         * Method used to see if the viewed User is verified.
         */
        isUserVerified(){
            let profile = UserFocusModalState.currentUserPageDetails.ProfileData;
            if(typeof profile != 'undefined' && typeof profile.verification != 'undefined' && profile.verification.verifiedStatus == 'valid')
                return true;
            return false;
        },
        isThisCurrentUserAccount(){
            if(AppState.isAuthBrowsing){
                if(GetBrowsingAgent().assertDid == UserFocusModalState.currentUserPageDetails.ProfileData.did) return true;
            }
            return false;
        },
        hasPrevNavRecords(){
            if(UserFocusModalState.currentNavIndex < 1) return false;
            return true;
        },
        hasNextNavRecords(){
            if(UserFocusModalState.currentNavIndex < UserFocusModalState.navigationHistory.length-1) return true;
            return false;
        },
        /**Does this User Profile have a Banner image? */
        hasProfileBanner(){
            return typeof UserFocusModalState.currentUserPageDetails != 'undefined' && typeof UserFocusModalState.currentUserPageDetails.ProfileData.banner != 'undefined';
        },
        /**Does this User Profile have am Avatar image? */
        hasProfileAvatar(){
            return typeof UserFocusModalState.currentUserPageDetails != 'undefined' && typeof UserFocusModalState.currentUserPageDetails.ProfileData != 'undefined' && typeof UserFocusModalState.currentUserPageDetails.ProfileData.avatar != 'undefined';
        },
        /**Is the currently displayed account muted by the logged in User? */
        isAccountMuted():boolean{
            let result = false;
            let data = UserFocusModalState.currentUserPageDetails; //handle `UserFocusModal` being mounted
            if(typeof data != 'undefined'){
                let profile = data.ProfileData;
                result = (typeof profile != 'undefined' && typeof profile.viewer != 'undefined' && typeof profile.viewer.muted != 'undefined' && profile.viewer.muted);
            }
            return result;
        },
        /**Is the currently displayed account blocked by the logged in User? */
        isAccountBlocked():boolean{
            let result = false;
            let data = UserFocusModalState.currentUserPageDetails; //handle `UserFocusModal` being mounted
            if(typeof data != 'undefined'){
                let profile = data.ProfileData;
                result = (typeof profile != 'undefined' && typeof profile.viewer != 'undefined' && typeof profile.viewer.blocking != 'undefined');
            }
            return result;
        },
        /**
         * Has end of Bookmarks "Feed" been reached. This is to be used for the Bookmarks content
         * only - currently when the end of the list is reached a cursor is still returned with an
         * empty `bookmarks` collection, so in `loadOlderPosts()` we set the cursor to '' if an empty
         * `bookmarks` collection is returned.
         */
        hasEndOfBookmarksBeenReached():boolean{
            let fd = UserFocusModalState.currentUserPageDetails.FeedData;
            return typeof fd.cursor == 'undefined' || fd.cursor.trim() == '';
        }
    },
    watch:{
        handle(newHandle:string, oldHandle:string){
            if(typeof newHandle != 'undefined' && newHandle.trim() != ''){
                this.updateCurrentNavHistoryScrollPos();
                this.updateDisplayedData();
                this.restoreScrollPosAfterNavHistoryChange();
            }
        }
    },
    async created() {
        this.lastHandle = this.handle;
        await this.updateDisplayedData();
        // this.setUserSummaryBottomPos();
        window.addEventListener('popstate', this.onNavigateBack);
    },
    mounted() {
        //Add keyboard shortcut listener
        let modal = document.getElementById('user-focus-container');
        // this.$el.addEventListener('keydown', this.onKeyboardShorcutEntered);
        // this.$el.addEventListener('mouseup', this.onMouseShortcutEntered);
        if(modal) modal.focus(); //focus modal
        document.title = `Loading Account data... | moongate`
    },
    beforeUnmount() {
        UserFocusModalState.currentNavIndex = 0;
        UserFocusModalState.navigationHistory = [];
        //Remove keyboard shortcut listener
        // this.$el.removeEventListener('keydown', this.onKeyboardShorcutEntered);
        // this.$el.removeEventListener('mouseup', this.onMouseShortcutEntered);
        window.removeEventListener('popstate', this.onNavigateBack);
    },
})

</script>

<style scoped>
.user-banner{
    container-type: inline-size;
}
@container (width > 0){
    .user-pfp{
        top: calc(100cqw/3 - 3rem);
    }
}

.v-enter-active,
.v-leave-active {
  transition: opacity 0.2s ease;
}

.v-enter-from,
.v-leave-to {
  opacity: 0;
}

.smooth-enter-active,
.smooth-leave-active {
  transition: opacity 0.3s ease, transform 0.4s ease;
}

.smooth-enter-from,
.smooth-leave-to {
  opacity: 0;
  transform: translateX(-10px);
}
</style>