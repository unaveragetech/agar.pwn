let isSyncEnabled = false;

// Listen for messages from the popup or content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.toggleSync !== undefined) {
        isSyncEnabled = message.toggleSync;

        // Broadcast the sync status to all open tabs
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
                chrome.tabs.sendMessage(tab.id, { toggleSync: isSyncEnabled });
            });
        });

        sendResponse({status: isSyncEnabled ? "on" : "off"});
    }
});
