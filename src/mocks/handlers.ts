import { http, HttpResponse } from 'msw'

export const handlers = [
  http.get('/profile/:handle/post/:postId', () => {
    console.log('navigated to PostFocusModal route')
    return HttpResponse.json({
      id: 'abc-123',
      firstName: 'John',
      lastName: 'Maverick',
    })
  }),
  // http.get('**/app.bsky.feed.getPostThread?uri*', () => {
  http.get('*/app.bsky.feed.getPostThread', () => {
    console.log('trying to get post thread data from Bluesky API');
    return HttpResponse.json({
      "thread": {
        "$type": "app.bsky.feed.defs#threadViewPost",
        "post": {
          "uri": "at://did:plc:qlekkifqfvr7wyisf22h55tz/app.bsky.feed.post/3mbgzoqre6n2z",
          "cid": "bafyreig22ntzeyprzedglgu3tuhf7kdbric63fzq73k55voop5cvitwhum",
          "author": {
            "did": "did:plc:qlekkifqfvr7wyisf22h55tz",
            "handle": "bernews.bsky.social",
            "displayName": "Bernews",
            "avatar": "https://cdn.bsky.app/img/avatar/plain/did:plc:qlekkifqfvr7wyisf22h55tz/bafkreigcsvp3j3dohveo7dnpo2q5zoyamaqqonopefgygzcarx25k4xani@jpeg",
            "associated": {
              "activitySubscription": {
                "allowSubscriptions": "followers"
              }
            },
            "labels": [],
            "createdAt": "2023-11-20T12:47:58.907Z"
          },
          "record": {
            "$type": "app.bsky.feed.post",
            "createdAt": "2026-01-02T13:44:43.532Z",
            "embed": {
              "$type": "app.bsky.embed.external",
              "external": {
                "description": "A car crash resulted in a car overturning in Sandys and the driver being arrested on suspicion of impaired driving. A police spokesperson said, “Around 8:45 p.m. on Thursday, January 1, 2026, police and other first responders were dispatched to a rep",
                "thumb": {
                  "$type": "blob",
                  "ref": {
                    "$link": "bafkreifnlhvueuek46nidfm6lrtwjzvhi7d2bpculyk4d657t6bccjl7sq"
                  },
                  "mimeType": "image/jpeg",
                  "size": 280694
                },
                "title": "Driver Arrested After Car Overturns In Sandys - Bernews",
                "uri": "https://bernews.com/2026/01/driver-arrested-after-car-overturns-in-sandys/"
              }
            },
            "facets": [],
            "text": "BPS: 'It is believed a female motorist mounted the curb in the eastbound lane before the car overturned. The woman is not believed to have suffered any serious injuries and has been arrested on suspicion of impaired driving'"
          },
          "embed": {
            "$type": "app.bsky.embed.external#view",
            "external": {
              "uri": "https://bernews.com/2026/01/driver-arrested-after-car-overturns-in-sandys/",
              "title": "Driver Arrested After Car Overturns In Sandys - Bernews",
              "description": "A car crash resulted in a car overturning in Sandys and the driver being arrested on suspicion of impaired driving. A police spokesperson said, “Around 8:45 p.m. on Thursday, January 1, 2026, police and other first responders were dispatched to a rep",
              "thumb": "https://cdn.bsky.app/img/feed_thumbnail/plain/did:plc:qlekkifqfvr7wyisf22h55tz/bafkreifnlhvueuek46nidfm6lrtwjzvhi7d2bpculyk4d657t6bccjl7sq@jpeg"
            }
          },
          "bookmarkCount": 0,
          "replyCount": 0,
          "repostCount": 0,
          "likeCount": 0,
          "quoteCount": 0,
          "indexedAt": "2026-01-02T13:44:44.633Z",
          "labels": []
        },
        "replies": [],
        "threadContext": {}
      }
    })
  })
]