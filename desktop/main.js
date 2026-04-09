const { app, BrowserWindow, globalShortcut } = require('electron');

// Force SwiftShader for ALL rendering (including WebGL) — bypasses the GPU entirely
app.disableHardwareAcceleration();
app.commandLine.appendSwitch('use-gl', 'swiftshader');
app.commandLine.appendSwitch('no-sandbox');
app.commandLine.appendSwitch('disable-gpu');

const GAME_URL = 'https://claw.bitvox.me/strawberrycow/';

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    frame: true, // debug build — windowed with title bar so devtools is reachable
    fullscreen: false,
    backgroundColor: '#1a0a2e',
    autoHideMenuBar: false,
    title: 'Cow Gun 3D (debug)',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true,
    },
  });

  // Clear any cached content so we always get the latest build
  mainWindow.webContents.session.clearCache().then(() => {
    mainWindow.webContents.session.clearStorageData({
      storages: ['serviceworkers', 'cachestorage', 'shadercache'],
    }).then(() => {
      mainWindow.loadURL(GAME_URL);
    });
  });

  // Auto-open devtools on startup so we can see any loading errors
  mainWindow.webContents.openDevTools({ mode: 'detach' });

  // Log any page load failures
  mainWindow.webContents.on('did-fail-load', (_e, code, desc, url) => {
    console.error('LOAD FAILED:', code, desc, url);
  });
  mainWindow.webContents.on('did-finish-load', () => {
    console.log('loaded ok:', mainWindow.webContents.getURL());
  });
  // Catch renderer crashes
  mainWindow.webContents.on('render-process-gone', (_e, details) => {
    console.error('RENDERER GONE:', details);
  });
  mainWindow.webContents.on('unresponsive', () => {
    console.error('RENDERER UNRESPONSIVE');
  });

  // Auto-grant all permissions
  mainWindow.webContents.session.setPermissionRequestHandler((webContents, permission, callback) => {
    const url = webContents.getURL();
    if (url.startsWith('https://claw.bitvox.me/')) return callback(true);
    callback(false);
  });

  mainWindow.on('closed', () => { mainWindow = null; });
}

app.whenReady().then(() => {
  createWindow();

  // F11 toggles fullscreen
  globalShortcut.register('F11', () => {
    if (!mainWindow) return;
    mainWindow.setFullScreen(!mainWindow.isFullScreen());
  });

  // F12 opens dev tools for debugging
  globalShortcut.register('F12', () => {
    if (!mainWindow) return;
    mainWindow.webContents.toggleDevTools();
  });

  // Alt+F4 is handled by the OS for quit. Ctrl+Q also quits.
  globalShortcut.register('CommandOrControl+Q', () => { app.quit(); });
});

app.on('window-all-closed', () => { app.quit(); });
app.on('will-quit', () => { globalShortcut.unregisterAll(); });
