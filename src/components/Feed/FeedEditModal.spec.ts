import { mount } from "@vue/test-utils";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import Sidebar from '../../Sidebar.vue';
import FeedEditModal from "./FeedEditModal.vue";

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
    describe('user feed is selected to be created from FeedEditModal', () => {
        const wrapper = mount(FeedEditModal);
        // const userFeedType = wrapper.get('[data-testid="user-feed-type-button"');
        // test('user feed type selected', async () => {
        //     await userFeedType.trigger('click'); //select "user feed"

        //     expect(wrapper.find('[data-testid="create-feed-user-search"]').exists()).toBe(true);
        // })
        afterAll(() => {
            wrapper.unmount();
        })
    })
})