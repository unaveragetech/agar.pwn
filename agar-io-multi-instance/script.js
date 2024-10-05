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

  settingsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    numInstances = parseInt(document.getElementById("instances").value, 10);
    syncInput = true; // We can always sync input across all instances
    setupGameInstances(numInstances, syncInput, useTabsCheckbox.checked);
  });

  function setupGameInstances(instancesCount, syncInput, useTabs) {
    // Reset instance data
    instances = [];
    instanceList.innerHTML = '';

    // Clear existing iframes or tabs
    iframesContainer.innerHTML = '';
    gameContainer.style.display = "flex"; // Show the game container

    // Create inputs for each instance
    for (let i = 0; i < instancesCount; i++) {
      const instanceName = prompt(`Enter name for Instance ${i + 1}`, `Instance ${i + 1}`);
      instances.push({ name: instanceName, iframe: null, window: null });

      // Create buttons and a selection dropdown
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

    // If we use tabs, open new tabs, otherwise create iframes
    if (useTabs) {
      for (let i = 0; i < instancesCount; i++) {
        // Open a new tab for each instance
        const newTab = window.open("https://agar.io/#ffa", `Agar.io Instance ${i + 1}`);
        instances[i].window = newTab;
      }
    } else {
      // Create iframes for each instance
      for (let i = 0; i < instancesCount; i++) {
        const iframe = document.createElement("iframe");
        iframe.src = "https://agar.io/#ffa";
        iframe.id = `agar-instance-${i}`;
        iframesContainer.appendChild(iframe);
        instances[i].iframe = iframe;
      }
    }

    // Sync input across all instances
    if (syncInput) {
      startRecordingInput();
    }
  }

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

  function replayInput(event) {
    // Replay the recorded events to the current instance
    const currentInstance = instances[currentInstanceIndex];
    if (currentInstance.iframe) {
      const iframeDoc = currentInstance.iframe.contentWindow.document;
      dispatchEventToIframe(iframeDoc, event);
    } else if (currentInstance.window) {
      const tabDoc = currentInstance.window.document;
      dispatchEventToIframe(tabDoc, event);
    }
  }

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

  function switchInstance(index) {
    currentInstanceIndex = index;
    console.log(`Switched to Instance ${index + 1}`);
  }
});
