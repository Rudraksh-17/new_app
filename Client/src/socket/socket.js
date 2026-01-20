import { io } from "socket.io-client";

export function initSocket({
  roomId,
  userName,
  onRemoteStrokeStart,
  onRemoteStrokeUpdate,
  onRemoteStrokeEnd,
  onUndoApplied,
  onRedoApplied,
  onSyncState,
  onUserJoin,
  onUserLeave,
  onClearAll
}) {
  const socketURL = process.env.REACT_APP_SOCKET_URL || "https://new-app-tbct.onrender.com";
  const socket = io(socketURL);

  socket.on("connect", () => {
    console.log("Connected to server:", socket.id);

    socket.emit("JOIN_ROOM", {
      roomId,
      userName
    });
  });

  // ---- Drawing events ----
  socket.on("REMOTE_STROKE_START", stroke => onRemoteStrokeStart(stroke));
  socket.on("REMOTE_STROKE_UPDATE", data => onRemoteStrokeUpdate(data));
  socket.on("REMOTE_STROKE_END", data => onRemoteStrokeEnd(data));

  // ---- Undo / Redo ----
  socket.on("UNDO_APPLIED", data => onUndoApplied(data));
  socket.on("REDO_APPLIED", data => onRedoApplied(data));

  // ---- Full state sync ----
  socket.on("SYNC_STATE", strokes => onSyncState(strokes));

  // ---- Presence ----
  socket.on("USER_JOIN", onUserJoin);
  socket.on("USER_LEAVE", onUserLeave);

  // ---- Clear canvas ----
  socket.on("CLEAR_ALL", onClearAll);


  return {
    id: socket.id,
    emitStrokeStart: payload => {
      socket.emit("STROKE_START", { roomId, ...payload });
    },

    emitStrokeUpdate: payload => {
      socket.emit("STROKE_UPDATE", { roomId, ...payload });
    },

    emitStrokeEnd: payload => {
      socket.emit("STROKE_END", { roomId, ...payload });
    },

    emitUndo: () => {
      console.log("emitUndo called, roomId:", roomId);
      socket.emit("UNDO", { roomId });
    },

    emitRedo: () => {
      console.log("emitRedo called, roomId:", roomId);
      socket.emit("REDO", { roomId });
    },

    emitClearAll: () => {
      socket.emit("CLEAR_ALL", { roomId });
    },

    disconnect: () => socket.disconnect()
  };
}
