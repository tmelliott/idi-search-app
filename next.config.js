// const { withPlausibleProxy } = require("next-plausible")

// module.exports = withPlausibleProxy({
//   customDomain: "https://plausible.terourou.org",
// })({
//   // ...your next js config, if any
// })

module.exports = {
  async rewrites() {
    return [
      {
        source: "/js/script.js",
        destination: "https://plausible.terourou.org/js/plausible.js",
      },
      {
        source: "/proxy/api/event",
        destination: "https://plausible.terourou.org/api/event",
      },
    ]
  },
}
