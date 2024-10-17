let isSyncEnabled = false;

// Function to start syncing events
function startSyncingEvents() {
    document.addEventListener("mousemove", broadcastMouseEvent);
    document.addEventListener("mousedown", broadcastMouseEvent);
    document.addEventListener("mouseup", broadcastMouseEvent);
    document.addEventListener("keydown", broadcastKeyboardEvent);
    document.addEventListener("keyup", broadcastKeyboardEvent);

    displaySyncStatus("Event Sync: ON");
}

// Function to stop syncing events
function stopSyncingEvents() {
    document.removeEventListener("mousemove", broadcastMouseEvent);
    document.removeEventListener("mousedown", broadcastMouseEvent);
    document.removeEventListener("mouseup", broadcastMouseEvent);
    document.removeEventListener("keydown", broadcastKeyboardEvent);
    document.removeEventListener("keyup", broadcastKeyboardEvent);

    displaySyncStatus("Event Sync: OFF");
}

// Broadcast mouse events
function broadcastMouseEvent(event) {
    if (isSyncEnabled) {
        const mouseEvent = {
            type: event.type,
            clientX: event.clientX,
            clientY: event.clientY,
            button: event.button,
            timestamp: Date.now()
        };
        localStorage.setItem("mouseEvent", JSON.stringify(mouseEvent));
    }
}

// Broadcast keyboard events
function broadcastKeyboardEvent(event) {
    if (isSyncEnabled) {
        const keyboardEvent = {
            type: event.type,
            key: event.key,
            timestamp: Date.now()
        };
        localStorage.setItem("keyboardEvent", JSON.stringify(keyboardEvent));
    }
}

// Listen for localStorage changes and replay the events
window.addEventListener("storage", function(event) {
    if (event.key === "mouseEvent") {
        const mouseEvent = JSON.parse(event.newValue);
        replayMouseEvent(mouseEvent);
    } else if (event.key === "keyboardEvent") {
        const keyboardEvent = JSON.parse(event.newValue);
        replayKeyboardEvent(keyboardEvent);
    }
});

// Replay mouse events on this tab
function replayMouseEvent(event) {
    const mouseEvent = new MouseEvent(event.type, {
        clientX: event.clientX,
        clientY: event.clientY,
        button: event.button
    });
    document.dispatchEvent(mouseEvent);
}

// Replay keyboard events on this tab
function replayKeyboardEvent(event) {
    const keyboardEvent = new KeyboardEvent(event.type, {
        key: event.key
    });
    document.dispatchEvent(keyboardEvent);
}

// Display the sync status on the page
function displaySyncStatus(status) {
    let overlay = document.getElementById("syncStatusOverlay");
    if (!overlay) {
        overlay = document.createElement("div");
        overlay.id = "syncStatusOverlay";
        overlay.style.position = "fixed";
        overlay.style.top = "10px";
        overlay.style.right = "10px";
        overlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
        overlay.style.color = "white";
        overlay.style.padding = "10px";
        overlay.style.borderRadius = "5px";
        overlay.style.zIndex = "1000";
        document.body.appendChild(overlay);
    }
    overlay.innerText = status;
}

// Listen for messages from the background script or popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.toggleSync !== undefined) {
        isSyncEnabled = message.toggleSync;
        if (isSyncEnabled) {
            startSyncingEvents();
        } else {
            stopSyncingEvents();
        }
        sendResponse({status: isSyncEnabled ? "on" : "off"});
    }
});
