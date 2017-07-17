(() => {
  const managers = new Map();
  let viewRoot = null;

  function onLoad() {
    window.removeEventListener("load", onLoad);

    viewRoot = document.querySelector("#gamepads");
    if (!viewRoot) {
      return;
    }

    const gamepads = navigator.getGamepads();
    for (const gamepad of gamepads) {
      if (!gamepad) {
        continue;
      }
      const manager = new GamepadManager(gamepad);
      managers.set(gamepad.index, manager);
    }

    window.addEventListener("gamepadconnected", event => {
      const gamepad = event.gamepad;
      if (!managers.has(gamepad.index)) {
        const manager = new GamepadManager(gamepad);
        managers.set(gamepad.index, manager);
      }
    });

    window.addEventListener("gamepaddisconnected", event => {
      const gamepad = event.gamepad;
      const manager = managers.get(gamepad.index);
      if (manager) {
        manager.destroy();
        managers.delete(gamepad.index);
      }
    });

    window.requestAnimationFrame(loop);
  }

  window.addEventListener("load", onLoad);

  class GamepadManager {
    constructor(gamepad) {
      this.gamepad = gamepad;

      this.view        = document.createElement("tr");
      this.indexView   = document.createElement("td");
      this.idView      = document.createElement("td");
      this.buttonsView = document.createElement("td");
      this.axesView    = document.createElement("td");
      this.view.appendChild(this.indexView);
      this.view.appendChild(this.idView);
      this.view.appendChild(this.buttonsView);
      this.view.appendChild(this.axesView);
      viewRoot.appendChild(this.view);

      this.updateView();
    }

    updateView() {
      this.indexView.textContent = this.gamepad.index.toString();
      this.idView.textContent    = this.gamepad.id;

      const presseds = this.gamepad.buttons
          .map(button => button.pressed ? "1" : "0")
          .join("");
      const values = this.gamepad.buttons
          .map(button => button.value.toFixed(2))
          .join(", ");
      this.buttonsView.textContent = presseds + "; " + values;

      this.axesView.textContent = this.gamepad.axes
        .map(axis => axis.toFixed(2))
        .join(", ");
    }

    destroy() {
      this.view.remove();
    }
  }

  function loop() {
    navigator.getGamepads(); // update gamepads info
    for (const manager of managers.values()) {
      manager.updateView();
    }
    window.requestAnimationFrame(loop);
  }
})();
