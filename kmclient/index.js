const { app, BrowserWindow,Menu } = require('electron')

const debug = /--debug/.test(process.argv[2])
const dbUtil = require('./src/components/DbUtils');
const mesUtils = require('./src/components/MessageUtils');
const status = require('./src/components/Status');

//加载基础资源
dbUtil.init();
status.init(dbUtil);
mesUtils.init(status);

function createWindow () {   
  Menu.setApplicationMenu(null);
  const win = new BrowserWindow({
    icon: 'back64.ico',
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })

  if(debug){
    win.webContents.openDevTools();
    win.loadURL('http://localhost:3000/index.html');
  }else{
    win.webContents.openDevTools();
    win.loadFile('./km/dist/index.html')
  }

  win.on('close', (e) => {
    status.saveWorkspace();
  });
  
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
app.whenReady().then(createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

