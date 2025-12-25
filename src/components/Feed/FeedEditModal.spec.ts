import "fake-indexeddb/auto";
import { flushPromises, mount } from "@vue/test-utils";
import { afterAll, describe, expect, it, test } from "vitest";
import App from '../../App.vue';
import FeedEditModal from "./FeedEditModal.vue";
import UserSearchBar from "../Utilities/UserSearchBar.vue"
import { createRouter, createWebHistory } from "vue-router";
import { routes } from "../../lib/router";

//Following guide given here: https://test-utils.vuejs.org/guide/advanced/vue-router#Using-a-Real-Router
const router = createRouter({
  history: createWebHistory(),
  routes: routes,
})

describe('Feed Create/Edit modal show/hide', () => {
    describe('feed create/edit FeedButton pressed from main page', async () => {
        router.push('/')
        // After this line, router is ready
        await router.isReady()
        const wrapper = mount(App, {
            global:{
                plugins: [router]
            }
        });
        const addFeedButton = wrapper.get('[data-testid="add-feed-button"');

        test('login modal is shown if user is not logged in', async () => {
            await addFeedButton.trigger('click'); //click "add feed" button
            await flushPromises();
            expect(wrapper.find('[data-testid="login-modal"').exists()).toBe(true);
            // expect(wrapper.find('[data-testid="feed-edit-modal').exists()).toBe(true);
        })
        // test('create feed modal is shown after selecting to browse as guest', async () => {
        //     await addFeedButton.trigger('click'); //click "add feed" button
        //     expect(wrapper.find('[data-testid="login-modal"').exists()).toBe(true); //login modal shown
        //     const browseAsGuestButton = wrapper.get('[data-testid="browse-as-guest-button"');
        //     await browseAsGuestButton.trigger('click'); //select to browse as guest
        //     expect(wrapper.find('[data-testid="login-modal"').exists()).toBe(false);
        //     await addFeedButton.trigger('click'); //click "add feed" button
        //     expect(wrapper.find('[data-testid="feed-edit-modal"').exists()).toBe(true); //create feed modal shown
        // })
        afterAll(() => {
            wrapper.unmount();
        })
    })
})
describe('Creating new Feed', () => {
    describe('User selects to create User Feed', async () => {
        router.push('/')
        // After this line, router is ready
        await router.isReady()
        const wrapper = mount(App, {
            global:{
                plugins: [router]
            }
        });

        const addFeedButton = wrapper.get('[data-testid="add-feed-button"');
        it('navigates to user feed options page', async () => {
            await addFeedButton.trigger('click'); //click "add feed" button
            await flushPromises();
            expect(wrapper.find('[data-testid="login-modal"').exists()).toBe(true);//not logged in - login modal shown
            wrapper.find('[data-testid="browse-as-guest-button"').trigger('click');
            await flushPromises();
            await addFeedButton.trigger('click'); //click "add feed" button
            await flushPromises();
            await wrapper.find('[data-testid="feedEditModal-user-feed-button"]').trigger('click'); //select "user feed"
            await flushPromises();
            //Confirm "user feed" selection
            expect(wrapper.find('[data-testid="feedEditModal-next-page-button"').exists()).toBe(true);
            await wrapper.find('[data-testid="feedEditModal-next-page-button"').trigger('click');//search for user page
            await flushPromises();
            expect(wrapper.find('[data-testid="feedEditModal-user-search-bar"]').exists()).toBe(true);
        })
        it('prevents navigation to summary page until user is entered', () => {
            expect(wrapper.find('[data-testid="feedEditModal-next-page-button"').exists()).toBe(false);
        })
        it('navigates back to Feed type selection page when back button clicked', async () => {
            await wrapper.find('[data-testid="feedEditModal-back-button"').trigger('click');//navigate back to start
            await flushPromises();
            expect(wrapper.find('[data-testid="feedEditModal-user-feed-button"]').exists()).toBe(true);
        })
        it('navigates to summary/submit page when type and specifications have been selected', async () => {
            await wrapper.find('[data-testid="feedEditModal-user-feed-button"]').trigger('click'); //select "user feed"
            await flushPromises();
            //Confirm "user feed" selection
            expect(wrapper.find('[data-testid="feedEditModal-next-page-button"').exists()).toBe(true);
            await wrapper.find('[data-testid="feedEditModal-next-page-button"').trigger('click');
            await flushPromises();
            let userSearchBar = wrapper.findComponent(UserSearchBar);
            expect(userSearchBar.exists()).toBe(true);

            //Mock that API data has been returned to `UserSearchBar`
            await userSearchBar.setData({
                apiData: [{did:'did:1234_5678', handle:'fake_account', displayName:'a test bot'}],
                searchTerm: 'bob',
                debouncedSearchTerm: 'bob'
            })

            //Check if API data is retrieved
            expect(userSearchBar.find('[data-testid="userSearchBar-returned-users-container"').exists()).toBe(true);
            //Select "returned" user result
            await userSearchBar.find('[data-testid="userSearchBar-returned-users-container"').find('div').trigger('click');
            await flushPromises();
            //Note that the above click should navigate to summary page AND request ProfileViewDetail data from API
            //Would be great if the API call could actually have a mock call instead of failing and having the data set below
            //checkout https://vitest.dev/guide/mocking.html#requests
            //Check that we navigated to summary page
            expect(wrapper.find('[data-testid="feedEditModal-summary-page"').exists()).toBe(true);
            //Mock that ProfileViewDetailed was returned for summary page
            await wrapper.getComponent(FeedEditModal).setData({
                feedFilters:{
                    user:{
                        did:'did:test-did-valie',
                        handle:'test.bsky.social',
                        displayName:'Test Profle'
                    }
                }
            })
            expect(wrapper.find('[data-testid="feedEditModal-create-button"').exists()).toBe(true);
        })
        afterAll(() => {
            wrapper.unmount();
        })
    })
    describe('User selects to create Tag Feed', async () => {
        router.push('/')
        // After this line, router is ready
        await router.isReady()
        const wrapper = mount(App, {
            global:{
                plugins: [router]
            }
        });
        const addFeedButton = wrapper.get('[data-testid="add-feed-button"');
        it('navigates to tag feed options page', async () => {
            //Deal with login modal
            await addFeedButton.trigger('click'); //click "add feed" button
            await flushPromises();
            expect(wrapper.find('[data-testid="login-modal"').exists()).toBe(true);//not logged in - login modal shown
            wrapper.find('[data-testid="browse-as-guest-button"').trigger('click');
            await flushPromises();
            await addFeedButton.trigger('click'); //click "add feed" button
            await flushPromises();
            //interact with tag feed button
            const tagFeedButton = wrapper.find('[data-testid="feedEditModal-tag-feed-button"]');
            expect(tagFeedButton.exists()).toBe(true);
            await tagFeedButton.trigger('click'); //select "tag feed"
            //Confirm "tag feed" selection
            expect(wrapper.find('[data-testid="feedEditModal-next-page-button"').exists()).toBe(true);
            await wrapper.find('[data-testid="feedEditModal-next-page-button"').trigger('click');
            await flushPromises();
            expect(wrapper.find('[data-testid="feedEditModal-tag-input"]').exists()).toBe(true);
        })
        it('prevents navigation to summary page until tag is entered', () => {
            // const toCreatePageButton = wrapper.get('[data-testid="feededit-next-page-button"');
            expect(wrapper.find('[data-testid="feedEditModal-next-page-button"').exists()).toBe(false);
        })
        it('navigates back to Feed type selection page when back button clicked', async () => {
            await wrapper.find('[data-testid="feedEditModal-back-button"').trigger('click');//navigate back to start
            await flushPromises();
            expect(wrapper.find('[data-testid="feedEditModal-tag-feed-button"]').exists()).toBe(true);
        })
        it('navigates to summary/submit page when type and specifications have been selected', async () => {
            await wrapper.find('[data-testid="feedEditModal-tag-feed-button"]').trigger('click'); //select "tag feed"
            await flushPromises();
            //Confirm "tag feed" selection
            expect(wrapper.find('[data-testid="feedEditModal-next-page-button"').exists()).toBe(true);
            await wrapper.find('[data-testid="feedEditModal-next-page-button"').trigger('click');
            await flushPromises();
            //Check that we're on the "tag entry" page
            let inlainputContainer = wrapper.find('[data-testid="feedEditModal-tag-input"]');
            expect(inlainputContainer.exists()).toBe(true);
            let tagInput = inlainputContainer.find('input');
            expect(tagInput.exists()).toBe(true);
            //Enter tag(s)
            await tagInput.setValue('#dev #test #check');
            //Check that tags have been discovered
            let validTagContainer = wrapper.find('[data-testid="feedEditModal-valid-tag-container"');
            expect(validTagContainer.exists()).toBe(true);
            expect(validTagContainer.findAll('div').length).toBe(3);
            //Navigate to summary page
            expect(wrapper.find('[data-testid="feedEditModal-next-page-button"').exists()).toBe(true);
            await wrapper.find('[data-testid="feedEditModal-next-page-button"').trigger('click');
            await flushPromises();
            //Ensure we're on summary page
            expect(wrapper.find('[data-testid="feedEditModal-summary-page"').exists()).toBe(true);
            expect(wrapper.find('[data-testid="feedEditModal-create-button"').exists()).toBe(true);
        })
        afterAll(() => {
            wrapper.unmount();
        })
    })
    describe.skip('User selects to create Trending Feed', () => {
        const wrapper = mount(FeedEditModal);
        const trendingFeedButton = wrapper.find('[data-testid="feedEditModal-trending-feed-button"]');
        expect(trendingFeedButton.exists()).toBe(true);
        it('navigates to trending feed options page', async () => {
            await trendingFeedButton.trigger('click'); //select "trending feed"
            //Confirm "trending feed" selection
            expect(wrapper.find('[data-testid="feedEditModal-next-page-button"').exists()).toBe(true);
            await wrapper.find('[data-testid="feedEditModal-next-page-button"').trigger('click');
            expect(wrapper.find('[data-testid="feedEditModal-options-page"').exists()).toBe(true);
        })
        it('navigates back to Feed type selection page when back button clicked', async () => {
            // expect(wrapper.find('[data-testid="feed-edit-back-button"').exists()).toBe(true);
            await wrapper.find('[data-testid="feedEditModal-back-button"').trigger('click');//navigate back to start
            expect(wrapper.find('[data-testid="feedEditModal-tag-feed-button"]').exists()).toBe(true);
        })
        it('navigates to summary/submit page when type and specifications have been selected', async () => {
            await trendingFeedButton.trigger('click'); //select "trending feed"
            //Confirm "trending feed" selection
            expect(wrapper.find('[data-testid="feedEditModal-next-page-button"').exists()).toBe(true);
            await wrapper.find('[data-testid="feedEditModal-next-page-button"').trigger('click');
            //No option currently, so we can got straight to summary
            expect(wrapper.find('[data-testid="feedEditModal-next-page-button"').exists()).toBe(true);
            await wrapper.find('[data-testid="feedEditModal-next-page-button"').trigger('click');
            //Ensure we're on summary page
            expect(wrapper.find('[data-testid="feedEditModal-summary-page"').exists()).toBe(true);
            expect(wrapper.find('[data-testid="feedEditModal-create-button"').exists()).toBe(true);
        })
        afterAll(() => {
            wrapper.unmount();
        })
    })
})