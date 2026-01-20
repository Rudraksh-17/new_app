class HistoryManager {
  constructor() {
    this.rooms = {};
  }

  createRoom(roomId) {
    if (!this.rooms[roomId]) {
      this.rooms[roomId] = { strokes: [] };
    }
  }

  addStroke(roomId, stroke) {
    this.rooms[roomId].strokes.push(stroke);
  }

  appendPoints(roomId, strokeId, points) {
    const s = this.rooms[roomId].strokes.find(x => x.id === strokeId);
    if (s && !s.undone) s.points.push(...points);
  }

  undo(roomId) {
    if (!this.rooms[roomId]) return null;
    const list = this.rooms[roomId].strokes;
    for (let i = list.length - 1; i >= 0; i--) {
      if (!list[i].undone) {
        list[i].undone = true;
        console.log("Undo applied:", list[i].id);
        return list[i];
      }
    }
    return null;
  }

  redo(roomId) {
    if (!this.rooms[roomId]) return null;
    const list = this.rooms[roomId].strokes;
    for (let i = list.length - 1; i >= 0; i--) {
      if (list[i].undone) {
        list[i].undone = false;
        console.log("Redo applied:", list[i].id);
        return list[i];
      }
    }
    return null;
  }

  getVisible(roomId) {
    if (!this.rooms[roomId]) return [];
    const visible = this.rooms[roomId].strokes.filter(s => !s.undone);
    console.log(`getVisible for room ${roomId}: ${visible.length} visible strokes out of ${this.rooms[roomId].strokes.length} total`);
    return visible;
  }

  getAll(roomId) {
    return this.rooms[roomId].strokes;
  }

  clearRoom(roomId) {
    if (this.rooms[roomId]) {
      this.rooms[roomId].strokes = [];
    }
  }
}

module.exports = HistoryManager;
