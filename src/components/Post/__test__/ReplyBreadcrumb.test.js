import { describe, expect, it } from "vitest";
import postDetails from "../../../state/PostDetails.vue"
import PostFocusModal from "../PostFocusModal.vue"
import { mount, shallowMount } from "@vue/test-utils";


describe('default breadcrumb access', () =>{
    it('userName should return "Origin"', () =>{
        const wrapper = shallowMount(PostFocusModal);
        expect(wrapper.vm.postDetails.currentBreadcrumb[0].userName).toBe('Origin');
    })
    it('postCID should return "this_cid_is_unset"', () =>{
        const wrapper = shallowMount(PostFocusModal);
        expect(wrapper.vm.postDetails.currentBreadcrumb[0].postCID).toBe('this_cid_is_unset');
    })
})
// describe('breadcrumb creation based on ThreadView tree position', () => {
//     it('e')
// })