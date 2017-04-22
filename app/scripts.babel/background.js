'use strict';

(() => {
  //
  // Installation
  //
  chrome.runtime.onInstalled.addListener(details => {
    console.log('previousVersion', details.previousVersion);
  });

  //
  // Context Menu
  //
  chrome.contextMenus.create({
    type: 'normal',
    title: 'Open Results',
    contexts: ['page'],
    documentUrlPatterns: [
      'https://www.google.co.jp/*',
      'https://www.google.com/*',
    ],
    onclick: (info, tab) => {
      chrome.tabs.sendMessage(tab.id, { action: 'scrape' }, (result) => {
        if (!result.success) {
          return console.info('failed to perform scrape', result);
        }
        if (!Array.isArray(result.data.hrefs)) {
          return console.info('result.hrefs is not an array', result);
        }

        result.data.hrefs.forEach((url) => {
          chrome.tabs.create({ url: url, active: false });
        });
      });
    }
  });

  //
  // Events
  //
  chrome.runtime.onMessage.addListener((request, sender, reply) => {
    switch (request.action) {
    case 'open':
      if (!Array.isArray(request.data.hrefs)) {
        return console.info('request.data.hrefs is not an array', request);
      }

      request.data.hrefs.forEach((url) => {
        chrome.tabs.create({ url: url, active: false });
      });

    default:
      break;
    }
  });
})();
