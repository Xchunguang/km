const { app, BrowserWindow,Menu } = require('electron')
const path = require('path');
const http = require('http');
const join = require('path').join;
const fs = require('fs');
const debug = /--debug/.test(process.argv[2])
const dbUtil = require('./src/components/DbUtils');
const mesUtils = require('./src/components/MessageUtils');
const status = require('./src/components/Status');

const root = __dirname;
const port = 15426;

//加载基础资源
dbUtil.init();
status.init(dbUtil);
mesUtils.init(status);

const server = http.createServer(function(req, res){
  let folderPath = '';
  if(req.url.indexOf('/km') >= 0 || req.url.indexOf('.js') >= 0){
    folderPath = root;
  } else {
    let workPath = status.workspace.path;
    folderPath = path.dirname(fs.realpathSync(workPath));
  }
  let realPath = join(folderPath, req.url)
  if(fs.existsSync(realPath)){
   let stream = fs.createReadStream(realPath)
   stream.pipe(res)
  } else {
   res.statusCode = 404
   res.end('no file')
  }
});

server.listen(port);

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
    win.loadURL('http://localhost:'+port+'/km/dist/index.html')
  }

  win.on('close', (e) => {
    status.saveWorkspace();
    server.close();
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

