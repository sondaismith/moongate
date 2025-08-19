import { mount } from "@vue/test-utils";
import RichPostTextBsky from './RichPostTextBsky.vue';
import { afterAll, describe, expect } from "vitest";


describe('Test getFullURLFromFacet() returns the "short URL"', () => {
    const wrapper = mount(RichPostTextBsky, {
        props:{
            postText: 'Hello world!\nVisit https://www.firefox.com\n#hashtag'
        }
    });
    it('Should return passed in partialUrl value from', () => {
        // console.log(wrapper.html());
        const shortURLHyperlink = wrapper.find('[href="https://www.firefox.com"]');
        expect(shortURLHyperlink.exists()).toBe(true);
    })
    afterAll(() => {
        wrapper.unmount();
    })
})
describe('Test getFullURLFromFacet() returns the "full URL"', () => {
    const wrapper = mount(RichPostTextBsky, {
        props:{
            postText: 'Hello world!\nVisit https://www.firefox.com\n#hashtag',
            postFacets: [
                    {
                        "$type": "app.bsky.richtext.facet",
                        "features": [
                            {
                                "$type": "app.bsky.richtext.facet#link",
                                "uri": "https://www.firefox.com/test-location"
                            }
                        ],
                        "index": {
                            "byteEnd": 41,
                            "byteStart": 18
                        }
                    },
                    {
                        "$type": "app.bsky.richtext.facet",
                        "features": [
                            {
                                "$type": "app.bsky.richtext.facet#tag",
                                "tag": "hashtag"
                            }
                        ],
                        "index": {
                            "byteEnd": 50,
                            "byteStart": 42
                        }
                    }
                ],
                "text": "Hello world! Visit https://www.firefox.com #hashtag"
        }
    });
    it('Should return "full URL" from link value found in `facets` object', () => {
        // console.log(wrapper.html());
        const fullURLHyperlink = wrapper.find('[href="https://www.firefox.com/test-location"]');
        expect(fullURLHyperlink.exists()).toBe(true);
    })
    afterAll(() => {
        wrapper.unmount();
    })
})
describe('Test getFullURLFromFacet() returns the "short URL" because the "full URL" in the facets object is not a match', () => {
    const wrapper = mount(RichPostTextBsky, {
        props:{
            postText: 'Hello world!\nVisit https://www.firefox.com\n#hashtag',
            postFacets: [
                    {
                        "$type": "app.bsky.richtext.facet",
                        "features": [
                            {
                                "$type": "app.bsky.richtext.facet#link",
                                "uri": "https://www.google.com/test-location"
                            }
                        ],
                        "index": {
                            "byteEnd": 41,
                            "byteStart": 18
                        }
                    },
                    {
                        "$type": "app.bsky.richtext.facet",
                        "features": [
                            {
                                "$type": "app.bsky.richtext.facet#tag",
                                "tag": "hashtag"
                            }
                        ],
                        "index": {
                            "byteEnd": 50,
                            "byteStart": 42
                        }
                    }
                ],
                "text": "Hello world! Visit https://www.firefox.com #hashtag"
        }
    });
    it('Should return "short URL" because no match was found in `facets` object', () => {
        // console.log(wrapper.html());
        const fullURLHyperlink = wrapper.find('[href="https://www.firefox.com"]');
        expect(fullURLHyperlink.exists()).toBe(true);
    })
    afterAll(() => {
        wrapper.unmount();
    })
})