document.addEventListener("DOMContentLoaded", function () {
  const settingsForm = document.getElementById("settingsForm");
  const gameContainer = document.getElementById("gameContainer");
  const iframesContainer = document.getElementById("iframes");
  let syncInput = true;
  let numInstances = 3;
  
  // Queue to store the mouse and keyboard events
  let inputQueue = [];

  settingsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    numInstances = parseInt(document.getElementById("instances").value, 10);
    syncInput = document.getElementById("syncInput").checked;
    setupGameInstances(numInstances, syncInput);
  });

  function setupGameInstances(instances, syncInput) {
    // Clear existing iframes
    iframesContainer.innerHTML = "";
    gameContainer.style.display = "flex"; // Show the game container

    // Create the specified number of iframes
    for (let i = 0; i < instances; i++) {
      const iframe = document.createElement("iframe");
      iframe.src = "https://agar.io/#ffa";
      iframe.id = `agar-instance-${i}`;
      iframesContainer.appendChild(iframe);
    }

    // Sync input across all instances if required
    if (syncInput) {
      startRecordingInput();
    }
  }

  function startRecordingInput() {
    let mouseX, mouseY, mouseDown = false;

    // Listen for mouse and keyboard inputs
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
      // Record keydown event
      recordKeyboardInput("keydown", event);
    });

    document.addEventListener("keyup", (event) => {
      // Record keyup event
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
      inputQueue.push(event);
      replayInput();
    }

    function recordKeyboardInput(type, event) {
      const keyEvent = {
        type: type,
        key: event.key,
        timestamp: Date.now()
      };
      inputQueue.push(keyEvent);
      replayInput();
    }
  }

  function replayInput() {
    const iframes = document.querySelectorAll("iframe");
    iframes.forEach((iframe) => {
      const iframeDoc = iframe.contentWindow.document;

      inputQueue.forEach((event) => {
        if (event.type === "mousemove") {
          const mouseEvent = new MouseEvent("mousemove", {
            clientX: event.x,
            clientY: event.y,
            button: event.button
          });
          iframeDoc.dispatchEvent(mouseEvent);
        } else if (event.type === "keydown") {
          const keyboardEvent = new KeyboardEvent("keydown", {
            key: event.key
          });
          iframeDoc.dispatchEvent(keyboardEvent);
        } else if (event.type === "keyup") {
          const keyboardEvent = new KeyboardEvent("keyup", {
            key: event.key
          });
          iframeDoc.dispatchEvent(keyboardEvent);
        }
      });
    });
  }
});
