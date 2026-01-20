
# Architecture

## Overview
Stroker! Collaborative Canvas.

This project is a real-time collaborative whiteboard built using a client–server model. Multiple users can draw on the same canvas simultaneously, and all drawing actions are synchronized using WebSockets (Socket.io). The server acts as the single source of truth for canvas state, while each client renders the strokes locally for smooth interaction.In future while settling a SignUp/Login authentication for users with JWT. The system and users will get introduced to managing notes in their private history and owning a private room with premium package. 

At a high level:

* Each user runs a React app in the browser.
* The browser connects to a Node.js + Socket.io server.
* All users join the same “room”.
* Every stroke is sent to the server.
* The server stores strokes and broadcasts them to all connected users.
* Clients render strokes in real time and replay history when needed (undo/redo, reconnect, etc.).

```
Browser (React + Canvas)
        |
        |  WebSocket (Socket.io)
        |
Node.js Server (Room + History Manager)
```

---

## Frontend Architecture

### 1. App.jsx (Root Component)

This is the main controller of the client application designed on react.js framework. We can shift it to vanila.js/Angular.js( if limited to single page & canvas oriented).
the main reason behind choosing React.js was Javascript + react compiler, which is fast, Reliable, Scalable, High performance, etc.

Responsibilities:

* Establish the WebSocket connection.
* Join a room with a username(customizable in future).
* Maintain UI state (tool, color, brush size, users list).
* Initialize canvas engines and input handlers.
* Route socket events to the renderer and history replayer.

Key state:

* `users` → List of connected users with name & color.
* `color` → Current brush color.
* `tool` → Pen or eraser.
* `strokeWidth` → Brush size.
* `socketRef` → Persistent socket connection.

---

### 2. Canvas System (Two-Layer Design | future scope)

We use two canvases stacked on top of each other:

1. **History Canvas (bottom layer)**

   * Contains all completed strokes.
   * Redrawn only on sync / undo / redo.

2. **Overlay Canvas (top layer)**

   * Shows the stroke currently being drawn.
   * Cleared after stroke is completed.

This avoids re-rendering the entire canvas on every mouse move and keeps drawing smooth.

---

### 3. InputController

This module handles:

* Mouse / pointer events.
* Converting screen coordinates to canvas coordinates.
* Batching points (sent roughly once per frame ~16ms).
* Triggering three lifecycle events:

  * Stroke start
  * Stroke update
  * Stroke end

---

### 4. StrokeRenderer

Responsible for drawing strokes using the raw Canvas API.

Features:

* Draws smooth paths.
* Supports variable width and color.
* Supports eraser using:

  ```
  ctx.globalCompositeOperation = "destination-out"
  ```
* Can render:

  * Full stroke replay (history sync)
  * Incremental point updates (real-time streaming)

Each stroke contains:

```
{
  id,
  points[],
  color,
  width,
  tool,        // pen / eraser
  composite,   // source-over / destination-out
  undone
}
```

---

### 5. HistoryReplayer

Used when:

* A new user joins.
* Undo / redo is triggered.
* Canvas is resynchronized.

Process:

1. Clear history canvas.
2. Iterate through all strokes where `undone === false`.
3. Replay each stroke using StrokeRenderer.

---

## Backend Architecture

### 1. Socket Server (Node.js + Socket.io)

The server manages:

* Room membership.
* Stroke history per room.
* Broadcasting drawing events.
* Undo / redo operations.
* User presence (join / leave).

Each room contains:

```
roomId → {
  strokes: [...],
  users: { userId → { name, color } }
}
```

---

### 2. History Manager

This is the core state engine.

It stores strokes and supports:

* `addStroke(roomId, stroke)`
* `appendPoints(roomId, strokeId, points)`
* `undo(roomId)` → marks last visible stroke as undone
* `redo(roomId)` → restores last undone stroke
* `getVisible(roomId)` → returns strokes where undone = false
* `clearRoom(roomId)`

Undo/Redo is implemented using a simple and robust flag-based model:

* No stacks.
* No destructive deletes.
* Only toggle `undone` and replay.

---

## Real-Time Flow

### Drawing

1. User draws.
2. Points are batched and sent via WebSocket.
3. Server stores stroke and broadcasts it.
4. Other clients render it instantly.
5. On stroke end, it moves from overlay to history layer.

### Undo / Redo

1. Client sends UNDO / REDO.
2. Server toggles stroke state.
3. Server broadcasts full visible history.
4. All clients clear and replay.

### Eraser

Eraser is not a special delete tool.
It is simply a stroke rendered using `destination-out`.
This makes erasing fully undoable and replayable.

---

## User Presence

On joining:

* Client sends username.
* Server assigns a color(upcoming feature).
* Server broadcasts USER_JOIN to room.
* Clients update their users panel.

On disconnect:

* Server broadcasts USER_LEAVE(upcoming feature).
* Clients remove user from list.

---

## Deployment Model

* Frontend: Vite + React (served from Render static).
* Backend: Express + Socket.io (Render).
* WebSocket used for all real-time sync.
* Server is authoritative for history and state.

---

## Why This Architecture Works

* Low latency (WebSocket streaming).
* Deterministic state (server history replay).
* Undo/Redo works across users.
* Eraser is fully reversible.
* No heavy CRDT complexity.
* Scales naturally using rooms.

