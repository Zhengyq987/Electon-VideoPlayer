const { app, BrowserWindow, ipcMain } = require('electron');
const myMenu = require('./menu');


let mainWindow;

app.on('ready', () => {
    console.log("Application is ready");

    //open up our renderer and turn IPC on
    mainWindow = new BrowserWindow({
        width: 1000, 
        height: 605,
        webPreferences: {
            nodeIntegration: true, //default is false
            contextIsolation: false //default is true
        }
    });

    mainWindow.loadFile('index.html')
    myMenu.setMainWindow(mainWindow);
});

ipcMain.on('load-video', (event, videoFilePath) => {
    // Send the selected video file path to the renderer process
    mainWindow.webContents.send('video-selected', videoFilePath);

});

