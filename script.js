document.addEventListener("DOMContentLoaded", function () {
  const settingsForm = document.getElementById("settingsForm");
  const useTabsCheckbox = document.getElementById("useTabs");
  const gameContainer = document.getElementById("gameContainer");
  const instanceList = document.getElementById("instanceList");
  const tabPreviews = document.getElementById("tabPreviews");

  const mousePositionElement = document.getElementById("mousePosition");
  const mouseClickElement = document.getElementById("mouseClick");
  const keyPressElement = document.getElementById("keyPress");
  const mirroringInstanceElement = document.getElementById("mirroringInstance");

  let numInstances = 3;
  let instances = [];  // Array to hold instance names and other settings
  let currentInstanceIndex = 0;
  let tabs = []; // Store the window references for tabs
  let iframeMode = false; // Use iframe by default
  let mouseX = 0, mouseY = 0;
  let mouseDown = false;

  settingsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    numInstances = parseInt(document.getElementById("instances").value, 10);
    iframeMode = !useTabsCheckbox.checked; // Decide on iframe vs tabs
    setupGameInstances(numInstances, iframeMode);
  });

  // Setup game instances in tabs or iframes
  function setupGameInstances(instancesCount, useTabs) {
    instances = [];
    instanceList.innerHTML = ''; // Reset instance list
    tabPreviews.innerHTML = ''; // Reset tab previews

    gameContainer.style.display = "flex"; // Show the game container

    // Create each instance
    for (let i = 0; i < instancesCount; i++) {
      const instanceName = prompt(`Enter name for Instance ${i + 1}`, `Instance ${i + 1}`);
      instances.push({ name: instanceName, window: null });

      const instanceDiv = document.createElement("div");
      instanceDiv.classList.add("instance");

      const instanceTitle = document.createElement("span");
      instanceTitle.innerHTML = `${instanceName}: `;

      const switchButton = document.createElement("button");
      switchButton.innerHTML = "Switch to this Instance";
      switchButton.onclick = () => switchInstance(i);

      instanceDiv.appendChild(instanceTitle);
      instanceDiv.appendChild(switchButton);
      instanceList.appendChild(instanceDiv);
    }

    // Create tabs or sub-windows
    if (useTabs) {
      // Open tabs for each instance
      for (let i = 0; i < instancesCount; i++) {
        const newTab = window.open("https://agar.io/#ffa", `Agar.io Instance ${i + 1}`);
        tabs.push(newTab); // Store the reference to the tab
        instances[i].window = newTab;

        // Simulate tab preview using div
        const tabPreview = document.createElement("div");
        tabPreview.id = `tab-preview-${i}`;
        tabPreview.classList.add("tabPreview");
        tabPreview.style.width = "200px";
        tabPreview.style.height = "200px";
        tabPreview.innerHTML = `Tab ${i + 1} Preview`;
        tabPreviews.appendChild(tabPreview);
      }
    } else {
      // Use iframes if needed (not used in this case)
    }

    // Start syncing inputs if enabled
    startRecordingInput();
  }

  // Record mouse and keyboard inputs
  function startRecordingInput() {
    document.addEventListener("mousemove", (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      mousePositionElement.innerText = `X: ${mouseX}, Y: ${mouseY}`;
      recordMouseInput();
    });

    document.addEventListener("mousedown", () => {
      mouseDown = true;
      mouseClickElement.innerText = "Mouse Down";
      recordMouseInput();
    });

    document.addEventListener("mouseup", () => {
      mouseDown = false;
      mouseClickElement.innerText = "Mouse Up";
      recordMouseInput();
    });

    document.addEventListener("keydown", (event) => {
      keyPressElement.innerText = `Key Pressed: ${event.key}`;
      recordKeyboardInput("keydown", event);
    });

    document.addEventListener("keyup", (event) => {
      keyPressElement.innerText = `Key Pressed: ${event.key}`;
      recordKeyboardInput("keyup", event);
    });
  }

  // Record mouse and keyboard input and replay it
  function recordMouseInput() {
    const event = {
      type: "mousemove",
      x: mouseX,
      y: mouseY,
      button: mouseDown ? 0 : 1,
      timestamp: Date.now()
    };
    replayInput(event);
  }

  function recordKeyboardInput(type, event) {
    const keyEvent = {
      type: type,
      key: event.key,
      timestamp: Date.now()
    };
    replayInput(keyEvent);
  }

  // Replay the recorded input to other tabs and windows using postMessage
  function replayInput(event) {
    instances.forEach((instance) => {
      if (instance.window) {
        instance.window.postMessage(event, "*"); // Broadcast event to all tabs
      }
    });
  }

  // Listen for events in other tabs and replay them
  window.addEventListener("message", (event) => {
    if (event.origin !== window.origin) return; // Ensure the same origin
    const receivedEvent = event.data;

    let dispatchEvent;
    if (receivedEvent.type === "mousemove") {
      dispatchEvent = new MouseEvent("mousemove", {
        clientX: receivedEvent.x,
        clientY: receivedEvent.y,
        button: receivedEvent.button
      });
    } else if (receivedEvent.type === "keydown" || receivedEvent.type === "keyup") {
      dispatchEvent = new KeyboardEvent(receivedEvent.type, {
        key: receivedEvent.key
      });
    }

    // Dispatch the event within this tab
    document.dispatchEvent(dispatchEvent);
  });

  // Switch the active instance and bring it to the front
  function switchInstance(index) {
    currentInstanceIndex = index;
    const activeInstance = instances[index];
    
    // Focus the active window/tab
    if (activeInstance.window) {
      activeInstance.window.focus();
    }
  }
});
