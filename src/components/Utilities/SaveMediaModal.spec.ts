import "fake-indexeddb/auto";
import App from '../../App.vue';
import PostFocusModal from '../Post/PostFocusModal.vue';
import {render, fireEvent, screen, prettyDOM, waitFor} from '@testing-library/vue'
import { flushPromises, mount } from '@vue/test-utils';
import { beforeAll, afterEach, afterAll, expect, beforeEach } from 'vitest'
import { server } from '../../mocks/node'
import { createRouter, createWebHistory, Router } from 'vue-router';
import { routes } from '../../lib/router';

// import "fake-indexeddb/auto";
// import { flushPromises, mount } from "@vue/test-utils";
// import { afterAll, describe, expect, it, test } from "vitest";
// import App from '../../App.vue';
// import FeedEditModal from "./FeedEditModal.vue";
// import UserSearchBar from "../Utilities/UserSearchBar.vue"
// import { createRouter, createWebHistory, Router } from "vue-router";
// import { routes } from "../../lib/router";

let router:Router;
// router = createRouter({
//         history: createWebHistory(),
//         routes: routes,
//     })

beforeAll(() => {
    server.listen({onUnhandledRequest: 'error'})
    console.log('MSW server listening')
})
beforeEach(() => {
    router = createRouter({
        history: createWebHistory(),
        routes: routes,
    })
})
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

test('TEST USED TO DEBUG IMPLEMENTING msw - responds with the user', async () => {
//   const response = await fetch('/profile/testman.debug/post/readablePostId')
  const response = await fetch('https://api.bsky.app/xrpc/app.bsky.feed.getPostThread?uri=at://asasksjaks')

  await expect(response.json()).resolves.toEqual({
    id: 'abc-123',
    firstName: 'John',
    lastName: 'Maverick',
  })
})

test('INCOMPLETE TEST - post content is as expected', async () => {
    router.push('/')
    // router.push('/profile/testman.debug/post/readablePostId');
    // After this line, router is ready
    await router.isReady()
    const wrapper = mount(App, {
        global:{
            plugins: [router]
        }
    });
    // router.push('/profile/testman.debug');
    router.push('/profile/testman.debug/post/readablePostId');
    await flushPromises();
    await flushPromises();
    // console.log(wrapper.html())
    // expect(wrapper.find('[data-testid="user-focus-modal"').exists()).toBe(true);
    expect(wrapper.find('[data-testid="post-focus-modal"').exists()).toBe(true);
    // expect(wrapper.find('[data-testid="userFocusModal-user-focus-container"').exists()).toBe(true);
    // expect(wrapper.find('[data-testid="userFocusModal-invalid-handle"').exists()).toBe(true);
    expect(router.currentRoute.value.path).toBe('/profile/testman.debug/post/readablePostId');
    // router.push('/profile/testman.debug/post/readablePostId');
    expect(wrapper.find('[data-testid="postFocusModal-focus-post-loading"').exists()).toBe(false);
    // expect(wrapper.find('[data-testid="postFocusModal-text"').exists()).toBe(true);
})

test('testing-library 1st test', async () => {
    render(App,{
        global:{
            plugins: [router],
        },
    });
    // router.push('/profile/testman.debug/post/readablePostId');
    router.push('/profile/bernews.bsky.social/post/3mbgzoqre6n2z');
    await router.isReady();
    // screen.debug();
    // console.log(prettyDOM(screen.getByTestId('post-focus-modal')))
    await waitFor(() => {
        expect(screen.getByTestId('postFocusModal-focus-post-loaded')).toBeDefined()
    })
    console.log(screen.getByTestId('PostFocusModal-handle').innerHTML);
    console.log(screen.getByText('invalid').innerHTML)
    // console.log(screen.getByTestId('PostFocusModal-handle').innerHTML)
})