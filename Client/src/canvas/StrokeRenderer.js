export class StrokeRenderer {
  constructor(ctx) {
    this.ctx = ctx;
    this.activeStrokes = new Map();
  }

  drawStroke(stroke) {
    const pts = stroke.points;
    if (!pts || pts.length < 2) return;

    this.ctx.save();
    
    this.ctx.globalCompositeOperation = stroke.composite || "source-over";
    this.ctx.strokeStyle = stroke.color;
    this.ctx.lineWidth = stroke.width;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";

    this.ctx.beginPath();
    this.ctx.moveTo(pts[0].x, pts[0].y);

    for (let i = 1; i < pts.length; i++) {
      this.ctx.lineTo(pts[i].x, pts[i].y);
    }

    this.ctx.stroke();
    this.ctx.restore();
  }

  drawStrokeStart(stroke) {
    if (!stroke.points.length) return;
    this.activeStrokes.set(stroke.id, stroke.points[0]);
  }

  appendPoints(strokeId, points) {
    const last = this.activeStrokes.get(strokeId);
    if (!last || !points.length) return;

    this.ctx.save();
    this.ctx.globalCompositeOperation = "source-over";
    this.ctx.strokeStyle = "#000";
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = "round";
    this.ctx.lineJoin = "round";
    this.ctx.beginPath();
    this.ctx.moveTo(last.x, last.y);

    for (const p of points) {
      this.ctx.lineTo(p.x, p.y);
    }

    this.ctx.stroke();
    this.ctx.restore();

    this.activeStrokes.set(strokeId, points[points.length - 1]);
  }

  drawStrokeEnd(strokeId) {
    this.activeStrokes.delete(strokeId);
  }
}
