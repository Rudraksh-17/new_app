export class HistoryReplayer {
  constructor(renderer, ctx) {
    this.renderer = renderer;
    this.ctx = ctx;
  }

  replay(strokes) {
    if (!this.ctx || !this.ctx.canvas) {
      console.error("HistoryReplayer: context or canvas is null");
      return;
    }
    
    for (const s of strokes) {
      console.log("Replaying stroke:", s.id);
      this.renderer.drawStroke(s); // pen or eraser
    }
  }
}