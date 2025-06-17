import "fake-indexeddb/auto";
import { mount } from "@vue/test-utils";
import { afterAll, describe, expect, it, test } from "vitest";
import Sidebar from '../../Sidebar.vue';
import FeedEditModal from "./FeedEditModal.vue";
import UserSearchBar from "../Utilities/UserSearchBar.vue"

describe('Feed Create/Edit modal show/hide', () => {
    describe('feed create/edit FeedButton pressed from main page', () => {
        const wrapper = mount(Sidebar);
        const addFeedButton = wrapper.get('[data-testid="add-feed-button"');

        test('login modal is shown if user is not logged in', async () => {
            await addFeedButton.trigger('click'); //click "add feed" button
            expect(wrapper.find('[data-testid="login-modal"').exists()).toBe(true);
            // expect(wrapper.find('[data-testid="feed-edit-modal').exists()).toBe(true);
        })
        test('create feed modal is shown after selecting to browse as guest', async () => {
            await addFeedButton.trigger('click'); //click "add feed" button
            expect(wrapper.find('[data-testid="login-modal"').exists()).toBe(true); //login modal shown
            const browseAsGuestButton = wrapper.get('[data-testid="browse-as-guest-button"');
            await browseAsGuestButton.trigger('click'); //select to browse as guest
            expect(wrapper.find('[data-testid="login-modal"').exists()).toBe(false);
            await addFeedButton.trigger('click'); //click "add feed" button
            expect(wrapper.find('[data-testid="feed-edit-modal"').exists()).toBe(true); //create feed modal shown
        })
        afterAll(() => {
            wrapper.unmount();
        })
    })
})
describe('Creating new Feed', () => {
    describe('User selects to create User Feed', () => {
        const wrapper = mount(FeedEditModal);
        const userFeedType = wrapper.get('[data-testid="feedEditModal-user-feed-button"]');
        it('navigates to user feed options page', async () => {
            await userFeedType.trigger('click'); //select "user feed"
            expect(wrapper.find('[data-testid="feedEditModal-user-search-bar"]').exists()).toBe(true);
        })
        it('prevents navigation to summary page until user is entered', () => {
            // const toCreatePageButton = wrapper.get('[data-testid="feededit-next-page-button"');
            expect(wrapper.find('[data-testid="feedEditModal-next-page-button"').exists()).toBe(false);
        })
        it('navigates back to Feed type selection page when back button clicked', async () => {
            // expect(wrapper.find('[data-testid="feed-edit-back-button"').exists()).toBe(true);
            await wrapper.find('[data-testid="feedEditModal-back-button"').trigger('click');//navigate back to start
            expect(wrapper.find('[data-testid="feedEditModal-user-feed-button"]').exists()).toBe(true);
        })
        it('navigates to summary/submit page when type and specifications have been selected', async () => {
            await userFeedType.trigger('click'); //select "user feed"
            let userSearchBar = wrapper.findComponent(UserSearchBar);
            expect(userSearchBar.exists()).toBe(true);

            //Make sure value entered into `UserSearchBar` is emitting (don't really need to test this)
            // let userSearchInput = wrapper.findComponent({name: 'InLaInput'});
            // expect(userSearchInput.exists()).toBe(true);
            // userSearchInput.setValue('bob');
            // userSearchInput.trigger('submit');
            // expect(userSearchInput.emitted()).toHaveProperty('update:modelValue', [['bob']]) //.toEqual('failed');
            // expect(userSearchInput.emitted()).toEqual('failed');

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
            //Check that we navigated to summary page
            expect(wrapper.find('[data-testid="feedEditModal-summary-page"').exists()).toBe(true);
            expect(wrapper.find('[data-testid="feedEditModal-create-button"').exists()).toBe(true);
        })
        afterAll(() => {
            wrapper.unmount();
        })
    })
    describe('User selects to create Tag Feed', () => {
        const wrapper = mount(FeedEditModal);
        const tagFeedButton = wrapper.find('[data-testid="feedEditModal-tag-feed-button"]');
        expect(tagFeedButton.exists()).toBe(true);
        it('navigates to tag feed options page', async () => {
            await tagFeedButton.trigger('click'); //select "user feed"
            expect(wrapper.find('[data-testid="feedEditModal-tag-input"]').exists()).toBe(true);
        })
        it('prevents navigation to summary page until tag is entered', () => {
            // const toCreatePageButton = wrapper.get('[data-testid="feededit-next-page-button"');
            expect(wrapper.find('[data-testid="feedEditModal-next-page-button"').exists()).toBe(false);
        })
        it('navigates back to Feed type selection page when back button clicked', async () => {
            // expect(wrapper.find('[data-testid="feed-edit-back-button"').exists()).toBe(true);
            await wrapper.find('[data-testid="feedEditModal-back-button"').trigger('click');//navigate back to start
            expect(wrapper.find('[data-testid="feedEditModal-tag-feed-button"]').exists()).toBe(true);
        })
        it('navigates to summary/submit page when type and specifications have been selected', async () => {
            await tagFeedButton.trigger('click'); //select "user feed"
            //Check that we're on the "tag entry" page
            let inlainputContainer = wrapper.find('[data-testid="feedEditModal-tag-input"]');
            expect(inlainputContainer.exists()).toBe(true);
            let tagInput = inlainputContainer.find('input');
            expect(tagInput.exists()).toBe(true);
            //Enter tag(s)
            await tagInput.setValue('#dev #test #check');
            // await wrapper.setData({
            //     feedFilters:{
            //         tag:'#dev #test #check'
            //     }
            // })
            //Check that tags have been discovered
            let validTagContainer = wrapper.find('[data-testid="feedEditModal-valid-tag-container"');
            expect(validTagContainer.exists()).toBe(true);
            expect(validTagContainer.findAll('div').length).toBe(3);
            //Navigate to summary page
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
    describe('User selects to create Trending Feed', () => {
        const wrapper = mount(FeedEditModal);
        const trendingFeedButton = wrapper.find('[data-testid="feedEditModal-trending-feed-button"]');
        expect(trendingFeedButton.exists()).toBe(true);
        it('navigates to trending feed options page', async () => {
            await trendingFeedButton.trigger('click'); //select "user feed"
            expect(wrapper.find('[data-testid="feedEditModal-options-page"').exists()).toBe(true);
        })
        it('navigates back to Feed type selection page when back button clicked', async () => {
            // expect(wrapper.find('[data-testid="feed-edit-back-button"').exists()).toBe(true);
            await wrapper.find('[data-testid="feedEditModal-back-button"').trigger('click');//navigate back to start
            expect(wrapper.find('[data-testid="feedEditModal-tag-feed-button"]').exists()).toBe(true);
        })
        it('navigates to summary/submit page when type and specifications have been selected', async () => {
            await trendingFeedButton.trigger('click'); //select "user feed"
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