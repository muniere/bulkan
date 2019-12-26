//
// Helper
//
class Bulkan {

  public static scrape(doc: Document): string[] {
    const selector = 'div[role="main"] div.rc > div.r > a:not(.fl)'
    const elements = doc.querySelectorAll(selector)
    return Array.from(elements).map((e) => e.getAttribute('href') as string)
  }
}

//
// Events
//
chrome.runtime.onMessage.addListener((request, _sender, callback) => {
  switch (request.action) {
    case 'scrape':
      callback({
        success: true,
        data: { hrefs: Bulkan.scrape(document) }
      })
      break

    default:
      callback(null)
      break
  }
})
