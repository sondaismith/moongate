import { mount } from "@vue/test-utils";
import { afterAll, afterEach, describe, expect, it, test } from "vitest";
import AccountSettingsPanel from './AccountSettingsPanel.vue';

describe("AccountSettingsPanel tests", () => {
    const wrapper = mount(AccountSettingsPanel);
    test("navigate to View muted accounts", async () => {
        // await wrapper.setData({postDetails:{
        //     // isAwaitingFocusData: true,
        //     postThread: testPostThreadView[0],
        //     threadNavHistory: testPostThreadView,
        //     currentThreadView: testPostThreadView[0],
        // }});
        // console.log(wrapper.html());
        let menuLabel = wrapper.find('[data-testid="accountSettingsPanel-current-menu-label"]');
        //Look for "Moderation" button
        // expect(wrapper.find('[data-testid="accountSettingsPanel-current-menu-label"]').text()).toBe("Account Settings");
        expect(menuLabel.text()).toBe("Account Settings");
        expect(wrapper.find('[data-testid="accountSettingsPanel-menu-back-button"]').exists()).toBe(false);
        await wrapper.find('[data-testid="accountSettingsPanel-moderation"]').trigger('click');
        expect(menuLabel.text()).toBe("Moderation");
        expect(wrapper.find('[data-testid="accountSettingsPanel-menu-back-button"]').exists()).toBe(true);
        await wrapper.find('[data-testid="accountSettingsPanel-view-muted-accounts"]').trigger('click');
        expect(menuLabel.text()).toBe("View Muted Accounts");
    })

    // test.skip("clicking reply timestamp updates PostThreadView via API request", async () => {
    //     // const wrapper = mount(PostFocusModal);
    //     const wrapper = mount(PostFocusModal, {
    //         data() {
    //             return{
    //                 postDetails:{
    //                     postThread: testPostThreadView[0],
    //                     threadNavHistory: testPostThreadView,
    //                     currentThreadView: testPostThreadView[0],
    //                     whoCanReply: () => {return 'Everybody can Reply'},
    //                 }
    //             }
    //         },
    //     });
    // })
    afterEach(() => {
        wrapper.unmount();
    })
})