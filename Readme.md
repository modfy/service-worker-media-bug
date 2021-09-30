# Service Worker Media Storage Bug


We have a bug with caching and retrieving media from a service worker

The goal is to be able to intercept a request made from the `video` tag and serve it from a cache.

We are having problems with this for larger files of about 100mb+ 

We have looked at https://github.com/GoogleChrome/workbox/issues/1663#issuecomment-448755945 and https://github.com/GoogleChrome/workbox/issues/2382


But are experiencing a bug where the media is buffering for a long time with the service worker, especially during scrubbing and wanted to combat this.

You can experience this yourself at https://service-worker-testing.vercel.app/

This also seems like a bug specifically only on Chrome and not in firefox, it works as expected in firefox

## Screenshots

These requests are taking forever to load when scrubbing, especially while moving back and fourth

![image](https://user-images.githubusercontent.com/10355479/135380410-508ae3e0-e7e0-488a-b807-5d37116d5658.png)
![image](https://user-images.githubusercontent.com/10355479/135380413-4b6b84fb-c858-4782-a2de-71f2c4f279ef.png)


## Code

The code for our service worker is in `service-worker.setup.js`

```js
/* eslint-disable no-restricted-globals */
const { RangeRequestsPlugin } = require('workbox-range-requests')
const { registerRoute } = require('workbox-routing')
const { clientsClaim, skipWaiting } = require('workbox-core')
const { CacheFirst } = require('workbox-strategies/CacheFirst')
const {
  CacheableResponsePlugin
} = require('workbox-cacheable-response/CacheableResponsePlugin')

const { precacheAndRoute } = require('workbox-precaching/precacheAndRoute')

skipWaiting()
clientsClaim()

registerRoute(
  // Match /api/asset/<anything except getSignedUploadURL>
  ({ url }) => url.toString().match(/\/api\/asset\/(?!getSignedUploadURL).*/),
  new CacheFirst({
    cacheName: 'modfy-assets',
    matchOptions: {
      // TODO: I don't know what this does, research it
      ignoreVary: true,
      ignoreSearch: true
    },
    plugins: [
      // Only cache responses with status code 200 that have data from the signed
      // URL fetched
      new CacheableResponsePlugin({
        statuses: [200]
      }),
      new RangeRequestsPlugin()
    ]
  })
)

// eslint-disable-next-line no-restricted-globals
precacheAndRoute(self.__WB_MANIFEST || [])

self.onmessage = (event) => {
  if (event.data === 'claimMe') {
    self.clients.claim()
  } else if (event.data === 'isMultiplayer=true') {
    self.isMultiplayer = true
  } else if (event.data === 'isMultiplayer=false') {
    self.isMultiplayer = false
  }
}
```

