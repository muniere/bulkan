//
// Helper
//
const bulkan = {
  scrape: (doc) => {
    const anchors = doc.querySelectorAll('div[role="main"] div.rc > div.r > a:not(.fl)');
    return Array.prototype.map.call(anchors, (e) => e['href']);
  }
};

//
// Events
//
chrome.runtime.onMessage.addListener((request, _sender, callback) => {
  switch (request.action) {
    case 'scrape':
      callback({
        success: true,
        data: {
          hrefs: bulkan.scrape(document)
        }
      });
      break;

    default:
      callback(null);
      break;
  }
});
