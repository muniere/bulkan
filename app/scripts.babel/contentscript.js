(() => {
  'use strict';

  //
  // Helper
  //
  const bulkan = {
    scrape: (doc) => {
      const anchors = doc.querySelectorAll('div[role="main"] div.rc > div.r > a:not(.fl)');
      return Array.prototype.map.call(anchors, (e) => { return e['href']; });
    }
  };

  //
  // Events
  //
  chrome.runtime.onMessage.addListener((request, sender, callback) => {
    switch (request.action) {
    case 'scrape': 
      callback({
        success: true,
        data: {
          hrefs: bulkan.scrape(document)
        }
      });
    default:
      callback(null);
    }
  });
})();