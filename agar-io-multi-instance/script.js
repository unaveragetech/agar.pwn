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

    // Create a new tab for each instance
    for (let i = 0; i < instances; i++) {
      const gameWindow = window.open("https://agar.io/#ffa", `Agar.io Instance ${i + 1}`);
      gameWindow.document.title = `Agar.io Instance ${i + 1}`;

      // Sync the input if required
      if (syncInput) {
        syncInputAcrossInstances(gameWindow);
      }
    }
  }

  function syncInputAcrossInstances(gameWindow) {
    let mouseX, mouseY, mouseDown = false;

    // Listen for mouse and keyboard inputs
    document.addEventListener("mousemove", (event) => {
      mouseX = event.clientX;
      mouseY = event.clientY;
      propagateMouseEvent(gameWindow);
    });

    document.addEventListener("mousedown", () => {
      mouseDown = true;
      propagateMouseEvent(gameWindow);
    });

    document.addEventListener("mouseup", () => {
      mouseDown = false;
      propagateMouseEvent(gameWindow);
    });

    document.addEventListener("keydown", (event) => {
      // Pass keydown events to the opened game windows
      propagateKeyboardEvent(gameWindow, "keydown", event);
    });

    document.addEventListener("keyup", (event) => {
      // Pass keyup events to the opened game windows
      propagateKeyboardEvent(gameWindow, "keyup", event);
    });

    function propagateMouseEvent(gameWindow) {
      gameWindow.postMessage({
        type: "mousemove",
        x: mouseX,
        y: mouseY,
        button: mouseDown ? 0 : 1
      }, "*");
    }

    function propagateKeyboardEvent(gameWindow, type, event) {
      gameWindow.postMessage({
        type: type,
        key: event.key
      }, "*");
    }
  }
});
