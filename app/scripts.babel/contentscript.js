(() => {
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
          hrfes: bulkan.scrape(document)
        }
      });
    default:
      callback(null);
    }
  });
  
  //
  // Keybind
  //
  (() => {
    key('shift+o', (ev) => {
      chrome.runtime.sendMessage({
        action: 'open',
        data: {
          hrefs: bulkan.scrape(document) 
        }
      }, (res) => {
        // do nothing
      });
    });
  })();
})();
