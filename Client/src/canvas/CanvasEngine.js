export class CanvasEngine {
  constructor(mainCanvas, overlayCanvas) {
    this.mainCanvas = mainCanvas;
    this.overlayCanvas = overlayCanvas;

    this.mainCtx = this.mainCanvas.getContext("2d");
    this.overlayCtx = this.overlayCanvas.getContext("2d");

    this.resize();
    window.addEventListener("resize", () => this.resize());
  }

  resize() {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.mainCanvas.width = width;
    this.mainCanvas.height = height;

    this.overlayCanvas.width = width;
    this.overlayCanvas.height = height;
  }

  clearMain() {
    this.mainCtx.clearRect(0, 0, this.mainCanvas.width, this.mainCanvas.height);
  }

  clearOverlay() {
    this.overlayCtx.clearRect(0, 0, this.overlayCanvas.width, this.overlayCanvas.height);
  }
}
