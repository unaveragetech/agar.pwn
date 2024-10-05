document.addEventListener("DOMContentLoaded", function () {
  const settingsForm = document.getElementById("settingsForm");
  const useTabsCheckbox = document.getElementById("useTabs");
  const gameContainer = document.getElementById("gameContainer");
  const iframesContainer = document.getElementById("iframes");
  const instanceList = document.getElementById("instanceList");

  let numInstances = 3;
  let instances = [];  // Array to hold instance names and other settings
  let currentInstanceIndex = 0;
  let syncInput = true;
  let tabs = []; // Store the window references for tabs
  let iframeMode = false; // Use iframe by default
  
  settingsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    numInstances = parseInt(document.getElementById("instances").value, 10);
    iframeMode = !useTabsCheckbox.checked; // Decide on iframe vs tabs
    setupGameInstances(numInstances, syncInput, iframeMode);
  });

  // Setup game instances in tabs or iframes
  function setupGameInstances(instancesCount, syncInput, useTabs) {
    instances = [];
    instanceList.innerHTML = ''; // Reset instance list

    iframesContainer.innerHTML = ''; // Clear existing iframes
    gameContainer.style.display = "flex"; // Show the game container

    // Create each instance
    for (let i = 0; i < instancesCount; i++) {
      const instanceName = prompt(`Enter name for Instance ${i + 1}`, `Instance ${i + 1}`);
      instances.push({ name: instanceName, iframe: null, window: null });

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

    // Create iframes or tabs
    if (useTabs) {
      // Open tabs for each instance
      for (let i = 0; i < instancesCount; i++) {
        const newTab = window.open("https://agar.io/#ffa", `Agar.io Instance ${i + 1}`);
        tabs.push(newTab); // Store the reference to the tab
        instances[i].window = newTab;
      }
    } else {
      // Create iframes
      for (let i = 0; i < instancesCount; i++) {
        const iframe = document.createElement("iframe");
        iframe.src = "https://agar.io/#ffa";
        iframe.id = `agar-instance-${i}`;
        iframesContainer.appendChild(iframe);
        instances[i].iframe = iframe;
      }
    }

    // Start syncing inputs if enabled
    if (syncInput) {
      startRecordingInput();
    }
  }

  // Record mouse and keyboard inputs
  function startRecordingInput() {
    let mouseX, mouseY, mouseDown = false;

    document.addEventListener("mousemove", (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      recordMouseInput();
    });

    document.addEventListener("mousedown", () => {
      mouseDown = true;
      recordMouseInput();
    });

    document.addEventListener("mouseup", () => {
      mouseDown = false;
      recordMouseInput();
    });

    document.addEventListener("keydown", (event) => {
      recordKeyboardInput("keydown", event);
    });

    document.addEventListener("keyup", (event) => {
      recordKeyboardInput("keyup", event);
    });

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
  }

  // Replay the recorded input to other tabs and iframes
  function replayInput(event) {
    // Replay mouse/keyboard input to all open instances
    instances.forEach(instance => {
      if (instance.iframe) {
        const iframeDoc = instance.iframe.contentWindow.document;
        dispatchEventToIframe(iframeDoc, event);
      } else if (instance.window) {
        const tabDoc = instance.window.document;
        dispatchEventToIframe(tabDoc, event);
      }
    });
  }

  // Dispatch the event to a specific iframe or tab
  function dispatchEventToIframe(iframeDoc, event) {
    if (event.type === "mousemove") {
      const mouseEvent = new MouseEvent("mousemove", {
        clientX: event.x,
        clientY: event.y,
        button: event.button
      });
      iframeDoc.dispatchEvent(mouseEvent);
    } else if (event.type === "keydown" || event.type === "keyup") {
      const keyboardEvent = new KeyboardEvent(event.type, {
        key: event.key
      });
      iframeDoc.dispatchEvent(keyboardEvent);
    }
  }

  // Switch the active instance and bring it to the front
  function switchInstance(index) {
    currentInstanceIndex = index;
    const activeInstance = instances[index];
    
    // Bring the main tab to focus
    if (activeInstance.window) {
      activeInstance.window.focus();
    }
    if (activeInstance.iframe) {
      activeInstance.iframe.focus();
    }
  }
});
