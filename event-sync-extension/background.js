chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'broadcastEvent') {
        // Get all open tabs with the same origin and broadcast event
        chrome.tabs.query({url: "*://yourwebsite.com/*"}, function(tabs) {
            tabs.forEach(tab => {
                if (tab.id !== sender.tab.id) {
                    chrome.tabs.sendMessage(tab.id, {
                        message: 'replayEvent',
                        event: request.event
                    });
                }
            });
        });
    }
});
