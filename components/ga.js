// log the pageview with their URL
export const pageview = (url) => {
  console.log("logging " + url)
  window.gtag("config", process.env.GOOGLE_ANALYTICS, {
    page_path: url,
  })
}

// log specific events happening.
export const event = ({ action, params }) => {
  window.gtag("event", action, params)
}
