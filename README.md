# Stroker - Collaborative Drawing App

A real-time collaborative drawing application built with React, Node.js, and Socket.io. Multiple users can draw together in the same room with full undo/redo support, color controls, and stroke width adjustment.

**Live Demo:** https://new-app-tbct.onrender.com

## Features

- 🎨 **Real-time Collaborative Drawing** - Draw simultaneously with multiple users in the same room
- 🎯 **Color Palette** - Choose from any color with the built-in color picker
- 📏 **Stroke Width Control** - Adjust brush size from 1-30 pixels
- 🔄 **Undo/Redo** - Full undo/redo functionality with state synchronization across users
- 🗑️ **Clear All** - Clear the entire canvas instantly for all connected users
- 👥 **User Presence** - See who's in the room and their assigned colors
- ✏️ **Pen & Eraser** - Toggle between drawing and erasing
- 📱 **Responsive Design** - Works on desktop and touch devices

## Tech Stack

**Frontend:**
- React 18 with Vite
- Socket.io-client for real-time communication
- HTML5 Canvas API for drawing
- CSS3 for styling

**Backend:**
- Node.js with Express
- Socket.io v4.8.3 for WebSocket communication
- CORS enabled for cross-origin requests

## Project Structure

```
flam_app/
├── Client/                    # React frontend
│   ├── src/
│   │   ├── App.jsx           # Main React component
│   │   ├── socket/
│   │   │   └── socket.js     # Socket.io initialization and events
│   │   ├── canvas/
│   │   │   ├── CanvasEngine.js      # Canvas setup and management
│   │   │   ├── InputController.js   # Mouse/touch event handling
│   │   │   ├── StrokeRenderer.js    # Stroke rendering
│   │   │   └── HistoryReplayer.js   # Replay stroke history
│   │   └── style.css         # Application styles
│   ├── package.json
│   └── vite.config.js
├── server/
│   ├── index.js              # Express server and Socket.io setup
│   └── history.js            # Stroke history and undo/redo management
├── package.json              # Root package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Local Development

**Quick Start (One Command):**
```bash
npm install && npm start
```

This command will:
1. Install all root dependencies
2. Install Client dependencies
3. Build the React frontend
4. Start the Express server on `http://localhost:3002`

**Manual Setup:**

1. **Install dependencies:**
   ```bash
   npm install
   cd Client && npm install && cd ..
   ```

2. **Start the server:**
   ```bash
   npm start
   # Server runs on http://localhost:3002
   # Frontend is served from Client/dist
   ```

3. **Or for development with hot reload:**
   ```bash
   # Terminal 1 - Start server
   npm start
   
   # Terminal 2 - Start Vite dev server
   cd Client
   npm run dev
   # Frontend runs on http://localhost:5173
   ```

4. **Open in browser:**
   - Visit `http://localhost:3002` (production mode) or `http://localhost:5173` (dev mode)
   - Username auto-generated on first load (stored in localStorage)
   - Start drawing!

### Testing Multi-User Drawing Locally

**Setup:**
```bash
npm install && npm start
# Open http://localhost:3002 in your browser
```

**Test Procedure:**

**Test 1: Basic Multi-User Drawing**
1. Open `http://localhost:3002` in **Browser Window A** (you'll get random username)
2. Open `http://localhost:3002` in **Browser Window B** - Incognito/Private mode (different user)
3. In Window A, draw something (circle, line, etc.)
4. **Expected:** Drawing appears in real-time in Window B ✓

**Test 2: User Presence Tracking**
1. Both windows open as above
2. Click "Show Users (2)" button in Window A
3. **Expected:** See both users listed with assigned colors ✓
4. Close Window B
5. **Expected:** "Show Users (1)" button updates, user disappears from list ✓

**Test 3: Colors and Stroke Width**
1. Both windows open
2. In Window A: Select red color, set width to 20px, draw
3. In Window B: Select blue color, set width to 5px, draw
4. **Expected:** Each user's strokes appear in their own color and width ✓

**Test 4: Undo/Redo**
1. Both windows open
2. In Window A: Draw 3 strokes
3. Click "Undo" in Window A (once)
4. **Expected:** Last stroke disappears in BOTH windows ✓
5. Click "Redo" in Window A
6. **Expected:** Stroke reappears in both windows ✓

**Test 5: Eraser**
1. Both windows open
2. In Window A: Draw something, then select Eraser tool
3. Erase part of the stroke
4. **Expected:** Erased area appears transparent in both windows ✓

**Test 6: Clear All**
1. Both windows open with some strokes drawn
2. Click "Erase All" in Window A
3. **Expected:** Canvas cleared in both windows instantly ✓

**Test 7: Multiple Simultaneous Users**
1. Open 3+ browser windows (mix of normal and incognito)
2. Have different users draw at the same time
3. **Expected:** All strokes sync correctly, no conflicts ✓

## Usage

### Drawing Controls
- **Pen Mode:** Click "Pen" button to draw
- **Eraser Mode:** Click "Eraser" button to erase strokes
- **Color:** Use color picker to change pen color
- **Stroke Width:** Adjust the slider (1-30px) to change brush size
- **Undo:** Click "Undo" or press Ctrl+Z to undo last stroke
- **Redo:** Click "Redo" to redo an undone stroke
- **Clear All:** Click "Erase All" to clear the entire canvas

### User Presence
- Click "Show Users" button to toggle the user list
- See all users currently in the room with their assigned colors
- User count is displayed on the button

## Deployment

### Deploy to Render.com

1. **Fork/clone the repository:**
   ```bash
   git clone https://github.com/Rudraksh-17/new_app.git
   cd new_app/flam_app
   ```

2. **Push to GitHub:**
   ```bash
   git push origin main
   ```

3. **Create a Render account** at https://render.com

4. **Create a new Web Service:**
   - Connect your GitHub repository
   - Set Build Command: `cd Client && npm install && npm run build`
   - Set Start Command: `node server/index.js`
   - Set PORT environment variable (Render does this automatically)

5. **Deploy:**
   - Render will automatically deploy on every push to main
   - Or manually trigger a deploy from the dashboard

### Environment Variables

The following environment variables are automatically configured by Render:
- `PORT` - The port the server runs on (assigned by Render)

Optional configuration:
- `REACT_APP_SOCKET_URL` - Socket server URL (defaults to deployment URL)

## API Documentation

### Socket.io Events

**Client → Server:**
- `JOIN_ROOM` - User joins a room and requests color assignment
- `STROKE_START` - Stroke begins at a point
- `STROKE_UPDATE` - Stroke points updated (line segment)
- `STROKE_END` - Stroke completed
- `UNDO` - Request undo operation
- `REDO` - Request redo operation
- `CLEAR_ALL` - Clear all strokes in room

**Server → Client:**
- `REMOTE_STROKE_START` - Another user started drawing
- `REMOTE_STROKE_UPDATE` - Another user drew a line segment
- `REMOTE_STROKE_END` - Another user finished stroke
- `UNDO_APPLIED` - Undo operation was applied
- `REDO_APPLIED` - Redo operation was applied
- `SYNC_STATE` - Full state sync (all current strokes)
- `USER_JOIN` - Another user joined the room
- `USER_LEAVE` - Another user left the room
- `CLEAR_ALL` - Canvas was cleared

## Architecture Details

See [architecture.md](./architecture.md) for detailed technical architecture, data flow, and component interactions.

## Known Limitations & Bugs

### Current Limitations

1. **Single Room Only**
   - All users are locked to "room1"
   - No room selection or creation UI
   - **Workaround:** Multiple instances of the app can run on different ports

2. **No Persistence**
   - Drawing is lost when server restarts
   - No save/export functionality
   - No drawing history or undo after page reload
   - **Workaround:** Screenshot canvas or implement database backend

3. **No Authentication**
   - Anyone can join with any username
   - No user accounts or login
   - **Workaround:** Run behind authentication proxy

4. **Limited Drawing Tools**
   - Only pen and eraser modes
   - No brushes, shapes, or text tools
   - No layers support
   - **Workaround:** Could be added via UI extensions

5. **No Mobile Touch Optimization**
   - Touch input supported but UI not fully responsive
   - No pinch-to-zoom or gesture controls
   - **Status:** Basic touch works, but UX could be better

### Known Bugs

1. **Browser Storage Issues**
   - If localStorage is disabled, username regenerates on page reload
   - **Impact:** Minor - just get a new username, no data loss
   - **Status:** Low priority, non-blocking

2. **Canvas Flicker on SYNC_STATE**
   - Full canvas redraw can cause brief visual flicker
   - **Impact:** Only visible on slower connections during undo/redo
   - **Workaround:** Use canvas double-buffering (future optimization)

3. **Simultaneous Tool Changes**
   - If two users change tools simultaneously, brief desync possible
   - **Impact:** Very rare, self-corrects on next stroke
   - **Status:** Acceptable trade-off for low latency

4. **Large Canvas Performance**
   - Canvas rendering slows with thousands of strokes
   - **Impact:** App designed for short-lived drawings
   - **Status:** Would need WebGL/offscreen canvas optimization

### Tested Scenarios ✓

- ✅ Multi-user real-time drawing
- ✅ Undo/redo with state synchronization
- ✅ User join/leave events
- ✅ Simultaneous drawing from multiple clients
- ✅ Color and stroke width changes
- ✅ Eraser functionality
- ✅ Clear all button
- ✅ Deployment to Render.com
- ✅ Mobile touch input (basic)

## Project Timeline

**Total Development Time: ~40 hours**

### Phase Breakdown:
- **Initial Setup & Architecture:** 5 hours
  - Project structure, React + Node setup, Socket.io configuration
- **Core Drawing Engine:** 10 hours
  - Canvas setup, input handling, stroke rendering, history management
- **Feature Implementation:** 15 hours
  - Color picker (3h), stroke width (2h), undo/redo (5h), clear all (2h), user presence (3h)
- **Bug Fixes & Debugging:** 8 hours
  - Socket connectivity issues, state synchronization bugs, UI refinements
- **Deployment:** 2 hours
  - Docker/container setup, Render.com configuration, environment variables

### Feature Completion Timeline:
1. **Day 1:** Basic drawing canvas and real-time sync
2. **Day 2:** Undo/redo implementation and user tracking
3. **Day 3:** Color and width controls, UI polish
4. **Day 4:** Deployment, documentation, testing

### Key Challenges Solved:
1. **Socket.io State Synchronization** - Took ~4 hours to get undo/redo working correctly across clients
2. **Canvas Rendering Efficiency** - Initially had performance issues, optimized with requestAnimationFrame and layer separation
3. **User Presence Tracking** - Required careful state management on both client and server
4. **Deployment Configuration** - Express routing issues took ~2 hours to resolve (wildcard route syntax)

### Lessons Learned:
- WebSocket state synchronization requires careful server-side state management
- Canvas rendering needs layer separation for performance
- Testing multi-client scenarios is critical early in development
- Socket.io namespacing and rooms are powerful but can be tricky
- Deployment environment variables need careful configuration
Both client and server include detailed console logs for debugging:
- Client: Check browser console (F12)
- Server: Check terminal output

### Common Issues

**Socket Connection Refused:**
- Ensure server is running on correct port
- Check REACT_APP_SOCKET_URL environment variable

**Strokes Not Syncing:**
- Check browser console for socket errors
- Verify users are in the same room ("room1" is hardcoded)
- Check server console for socket event logs

**Undo/Redo Not Working:**
- Verify socket connection is established
- Check that strokes exist in history before undo

## Performance Tips

- Canvas rendering uses requestAnimationFrame for smooth performance
- History is maintained per room to manage memory
- Socket events are batched where possible

## Future Enhancements

- [ ] Multiple rooms with room selection UI
- [ ] User authentication
- [ ] Save/export canvas as image or vector
- [ ] Drawing brush styles (texture, opacity)
- [ ] Canvas background colors/images
- [ ] Touch gesture support (pinch zoom)
- [ ] Mobile app version

## License

MIT

## Contributing

Feel free to fork and submit pull requests for any improvements!

## Support

For issues or questions, please open an issue on [GitHub](https://github.com/Rudraksh-17/new_app).
