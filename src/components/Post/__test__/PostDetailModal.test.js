import { mount } from "@vue/test-utils";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import Sidebar from '../../../Sidebar.vue';

describe('Post Detail modal show/hide', () => {
    describe('timestamp button on Post pressed', () => {
        const wrapper = mount(Sidebar);
        const postTimestamp = wrapper.get('[data-test="post-timestamp"');
        const postDetailModal = wrapper.get('[data-test="post-detail-modal-div"');
        const postDetailModalCloseDiv = wrapper.get('[data-test="hide-modal-button"');

        test('modal is shown', async () => {
            await postTimestamp.trigger('click'); //click timestamp
            expect(postDetailModal.attributes('class').includes('show')).toBe(true);
        })
        test('modal is hidden', async () => {
            await postDetailModalCloseDiv.trigger('click'); //click background of modal
            expect(postDetailModal.attributes('class').includes('show')).toBe(false);
        })
        afterAll(async () => {
            await wrapper.unmount();
        })
    })
})