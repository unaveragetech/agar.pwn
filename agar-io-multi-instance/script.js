document.addEventListener("DOMContentLoaded", function () {
  const settingsForm = document.getElementById("settingsForm");
  const gameContainer = document.getElementById("gameContainer");
  const iframesContainer = document.getElementById("iframes");
  let syncInput = true;
  let numInstances = 3;
  
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
      syncInputAcrossInstances();
    }
  }

  function syncInputAcrossInstances() {
    let mouseX, mouseY, mouseDown = false;

    // Listen for mouse and keyboard inputs
    document.addEventListener("mousemove", (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      propagateMouseEvent();
    });

    document.addEventListener("mousedown", () => {
      mouseDown = true;
      propagateMouseEvent();
    });

    document.addEventListener("mouseup", () => {
      mouseDown = false;
      propagateMouseEvent();
    });

    document.addEventListener("keydown", (event) => {
      // Pass keydown events to all instances
      propagateKeyboardEvent("keydown", event);
    });

    document.addEventListener("keyup", (event) => {
      // Pass keyup events to all instances
      propagateKeyboardEvent("keyup", event);
    });

    function propagateMouseEvent() {
      const iframes = document.querySelectorAll("iframe");
      iframes.forEach((iframe) => {
        const iframeDoc = iframe.contentWindow.document;
        const mouseEvent = new MouseEvent("mousemove", {
          clientX: mouseX,
          clientY: mouseY,
          button: mouseDown ? 0 : 1,
        });
        iframeDoc.dispatchEvent(mouseEvent);
      });
    }

    function propagateKeyboardEvent(type, event) {
      const iframes = document.querySelectorAll("iframe");
      iframes.forEach((iframe) => {
        const iframeDoc = iframe.contentWindow.document;
        const keyboardEvent = new KeyboardEvent(type, {
          key: event.key,
        });
        iframeDoc.dispatchEvent(keyboardEvent);
      });
    }
  }
});
