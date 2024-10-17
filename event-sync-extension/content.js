// Track mouse and keyboard events
document.addEventListener('mousedown', broadcastEvent);
document.addEventListener('mousemove', broadcastEvent);
document.addEventListener('mouseup', broadcastEvent);
document.addEventListener('keydown', broadcastEvent);
document.addEventListener('keyup', broadcastEvent);

function broadcastEvent(event) {
    const eventData = {
        type: event.type,
        x: event.screenX,
        y: event.screenY,
        key: event.key || null,
        button: event.button || null,
        originTab: window.location.href
    };

    // Broadcast the event to all tabs
    chrome.runtime.sendMessage({
        message: 'broadcastEvent',
        event: eventData
    });
}

// Listen for messages to replay events
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.message === 'replayEvent') {
        replayEvent(request.event);
    }
});

// Function to replay received events
function replayEvent(event) {
    let syntheticEvent;
    if (event.type.includes('mouse')) {
        syntheticEvent = new MouseEvent(event.type, {
            screenX: event.x,
            screenY: event.y,
            button: event.button
        });
    } else if (event.type.includes('key')) {
        syntheticEvent = new KeyboardEvent(event.type, {
            key: event.key
        });
    }

    if (syntheticEvent) {
        document.dispatchEvent(syntheticEvent);
    }
}
