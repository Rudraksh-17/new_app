export class InputController {
  constructor(canvas, onStart, onMove, onEnd) {
    this.canvas = canvas;
    this.onStart = onStart;
    this.onMove = onMove;
    this.onEnd = onEnd;

    this.isDrawing = false;
    this.buffer = [];
    this.lastFlush = performance.now();

    canvas.addEventListener("pointerdown", e => this.start(e));
    canvas.addEventListener("pointermove", e => this.move(e));
    canvas.addEventListener("pointerup", e => this.end(e));
    canvas.addEventListener("pointerleave", e => this.end(e));
  }

  getPoint(e) {
    return { x: e.clientX, y: e.clientY, t: Date.now() };
  }

  start(e) {
    this.isDrawing = true;
    const p = this.getPoint(e);
    this.buffer = [p];
    this.onStart(p);
  }

  move(e) {
    if (!this.isDrawing) return;

    const p = this.getPoint(e);
    this.buffer.push(p);

    const now = performance.now();

    // Batch by size or by frame time (~60fps)
    if (this.buffer.length >= 8 || now - this.lastFlush >= 16) {
      this.onMove(this.buffer);
      this.buffer = [p];
      this.lastFlush = now;
    }
  }

  end(e) {
    if (!this.isDrawing) return;

    this.isDrawing = false;
    this.onEnd(this.buffer);
    this.buffer = [];
  }
}
