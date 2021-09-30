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
