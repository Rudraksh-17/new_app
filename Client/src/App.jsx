import { useEffect, useRef, useState } from "react";
import { CanvasEngine } from "./canvas/CanvasEngine";
import { StrokeRenderer } from "./canvas/StrokeRenderer";
import { HistoryReplayer } from "./canvas/HistoryReplayer";
import { InputController } from "./canvas/InputController";
import { initSocket } from "./socket/socket";
import "./style.css";

function App() {
  const mainRef = useRef(null);
  const overlayRef = useRef(null);
  const socketRef = useRef(null);
  const userNameRef = useRef("");


  const [users, setUsers] = useState([]);
  const [color, setColor] = useState("#ff0000");
  const [tool, setTool] = useState("pen");
  const [strokeWidth, setStrokeWidth] = useState(2);
  const [showUsers, setShowUsers] = useState(false);
  
  const engineRef = useRef(null);
  const historyRendererRef = useRef(null);
  const overlayRendererRef = useRef(null);
  const replayerRef = useRef(null);
  const currentStrokeRef = useRef(null);
  const inputControllerRef = useRef(null);

  // Initialize on mount only
  useEffect(() => {
    const userName = localStorage.getItem("username") || `User${Math.floor(Math.random() * 10000)}`;
    userNameRef.current = userName;
    localStorage.setItem("username", userName);

    const engine = new CanvasEngine(mainRef.current, overlayRef.current);
    const historyRenderer = new StrokeRenderer(engine.mainCtx);
    const overlayRenderer = new StrokeRenderer(engine.overlayCtx);
    const replayer = new HistoryReplayer(historyRenderer, engine.mainCtx);

    engineRef.current = engine;
    historyRendererRef.current = historyRenderer;
    overlayRendererRef.current = overlayRenderer;
    replayerRef.current = replayer;

    const socket = initSocket({
      roomId: "room1",
      userName: userNameRef.current,

      onRemoteStrokeStart: stroke => historyRenderer.drawStrokeStart(stroke),
      onRemoteStrokeUpdate: ({ strokeId, points }) =>
        historyRenderer.appendPoints(strokeId, points),
      onRemoteStrokeEnd: ({ strokeId }) =>
        historyRenderer.drawStrokeEnd(strokeId),

      onUndoApplied: () => {},
      onRedoApplied: () => {},
      onSyncState: strokes => {
        console.log("onSyncState called with strokes:", strokes);
        engine.clearMain();
        console.log("Canvas cleared");
        replayer.replay(strokes);
        console.log("Replay complete");
      },

      onUserJoin: user => {
        console.log("USER_JOIN received:", user);
        setUsers(prev => {
          const exists = prev.some(u => u.id === user.id);
          if (!exists) {
            return [...prev, user];
          }
          return prev;
        });
      },
      onUserLeave: user => {
        console.log("USER_LEAVE received:", user);
        setUsers(prev => prev.filter(u => u.id !== user.id));
      },
      onClearAll: () => {
        engine.clearMain();
        engine.clearOverlay();
      }
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  
  useEffect(() => {
    if (!socketRef.current || !overlayRendererRef.current || !historyRendererRef.current || !engineRef.current) return;

    const overlayRenderer = overlayRendererRef.current;
    const historyRenderer = historyRendererRef.current;
    const engine = engineRef.current;

    const inputController = new InputController(
      overlayRef.current,

      p => {
        if (!socketRef.current) return;
        currentStrokeRef.current = {
  id: crypto.randomUUID(),
  userId: socketRef.current.id,
  color: tool === "eraser" ? "#000000" : color,
  width: tool === "eraser" ? 20 : strokeWidth,
  composite: tool === "eraser" ? "destination-out" : "source-over",
  points: [p],
  undone: false
};

        overlayRenderer.drawStrokeStart(currentStrokeRef.current);
        socketRef.current.emitStrokeStart({ stroke: currentStrokeRef.current });
      },

      points => {
        if (!currentStrokeRef.current || !socketRef.current) return;
        currentStrokeRef.current.points.push(...points);
        overlayRenderer.appendPoints(currentStrokeRef.current.id, points);
        socketRef.current.emitStrokeUpdate({ strokeId: currentStrokeRef.current.id, points });
      },

      () => {
        if (!currentStrokeRef.current || !socketRef.current) return;
        engine.clearOverlay();
        historyRenderer.drawStroke(currentStrokeRef.current);
        socketRef.current.emitStrokeEnd({ strokeId: currentStrokeRef.current.id });
        currentStrokeRef.current = null;
      }
    );

    inputControllerRef.current = inputController;

    return () => {
      
    };
  }, [color, tool, strokeWidth]);

  return (
    <>

      <div className="toolbar">
      <marquee direction="left">Welcome to the Stroker!</marquee>
      <fieldset style={{ display: 'inline-block', marginRight: '10px' }}>
      <button onClick={() => {
        if (engineRef.current) {
          engineRef.current.clearMain();
          engineRef.current.clearOverlay();
          socketRef.current?.emitClearAll?.();
        }
      }}>Erase All</button>
      <button onClick={() => setTool("pen")}>Pen</button>
      
        <button onClick={() => {
          console.log("Redo clicked");
          socketRef.current?.emitRedo();
        }}>Redo</button>
        <button onClick={() => {
          console.log("Undo clicked");
          socketRef.current?.emitUndo();
        }}>undo</button>
      </fieldset>

      <label>
        Color:
        <input
          type="color"
          value={color}
          onChange={e => setColor(e.target.value)}
          disabled={tool === "eraser"}
          style={{ cursor: tool === "eraser" ? "not-allowed" : "pointer" }}
        />
      </label>

      <label>
        Stroke Width: <span>{strokeWidth}px</span>
        <input
          type="range"
          min="1"
          max="30"
          value={strokeWidth}
          onChange={e => setStrokeWidth(Number(e.target.value))}
          disabled={tool === "eraser"}
          style={{ cursor: tool === "eraser" ? "not-allowed" : "pointer" }}
        />
      </label>

        <span>Room: room1</span>

        <button onClick={() => setShowUsers(!showUsers)} className="users-toggle-btn">
          {showUsers ? 'Hide Users' : `Show Users (${users.length})`}
        </button>
      </div>

      {showUsers && (
        <div className="users-panel">
          <h3>Users in Room</h3>
          {users.length === 0 ? (
            <p>No other users</p>
          ) : (
            <ul>
              {users.map(u => (
                <li key={u.id} style={{ color: u.color, marginBottom: '8px' }}>
                  <span style={{ fontSize: '14px', fontWeight: 'bold' }}>●</span> {u.name}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}


      <canvas ref={mainRef} className="history-layer" />
      <canvas ref={overlayRef} className="overlay-layer" />
    </>
  );
}

export default App;
