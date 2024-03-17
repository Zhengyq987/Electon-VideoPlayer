const { Menu, dialog} = require('electron');
const ffmpeg = require('fluent-ffmpeg');
const ffmpeg_static = require('ffmpeg-static');
const ffprobe_static = require('ffprobe-static');
const ProgressBar = require('electron-progressbar');

ffmpeg.setFfmpegPath(ffmpeg_static);
ffmpeg.setFfprobePath(ffprobe_static.path);

const isMac = process.platform === 'darwin';

let mainWindow;
let videoFilePath;

const menuTemplate = [
    {
        label: "File",
        submenu: [
            {
                label: "Video",
                submenu: [
                    {
                        label: "Load...",
                        click(event, parentWindow) {
                            //show open file dialog with no options for now
                            let dialogOptions = {
                                title: "Open Video Dialog",
                                defualtPath: __dirname,
                                filters: [
                                    { name: 'Videos', extensions: ['mp4', 'webm', 'avi', 'mkv', 'mov'] }
                                ]
                            }
                            dialog.showOpenDialog(parentWindow, dialogOptions).then((fileInfo) => {
                                console.log(fileInfo);
                                videoFilePath = fileInfo.filePaths[0];

                                if (fileInfo.canceled) {
                                    console.log('User Cancelled file open dialog')
                                } else {
                                    console.log(`User selected: ${videoFilePath}`);
                                    mainWindow.webContents.send('video-selected', videoFilePath);
                                    enableFileConversionItems();
                                }

                            });

                        }
                    },
                    { type: 'separator' },
                    {
                        label: "Convert to AVI...",
                        enabled: false,
                        click() {
                            convertFile('avi')
                        }
                    },
                    {
                        label: "Convert to MP4...",
                        enabled: false,
                        click() {
                            convertFile('mp4')
                        }
                    },
                    {
                        label: "Convert to WEBM...",
                        enabled: false,
                        click() {
                            convertFile('webm')
                        }
                    }
                ]
            },
            { type: 'separator' },
            isMac ? { role: 'close' } : { role: 'quit' }
        ]
    },
    {
        label: "Developer",
        submenu: [
            { role: 'toggleDevTools' }
        ]
    }
];

//move menu if on Mac
if (isMac) {
    menuTemplate.unshift(
        {
            label: 'placeholder'
        }
    );
}

function enableFileConversionItems() {
    const fileMenu = menuTemplate.find(item => item.label === 'File');
    const videoSubMenu = fileMenu.submenu.find(item => item.label === 'Video');
    const conversionItems = videoSubMenu.submenu.slice(2);
    for (const item of conversionItems) {
        item.enabled = true;
    }
    Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
}

function convertFile(format) {
    const saveDialogOptions = {
        title: `Save ${format.toUpperCase()} File`,
        defaultPath: __dirname,
    };
    dialog.showSaveDialog(mainWindow, saveDialogOptions).then((fileInfo) => {
        if (fileInfo.canceled) {
            console.log('User canceled file save dialog');
            return;
        }
        const outputFilePath = fileInfo.filePath;
        console.log(fileInfo)

        const progressBar = new ProgressBar({
            indeterminate: false,
            text: 'Video conversion in progress...',
            detail: `Please wait...`,
            browserWindow: {
                parent: mainWindow, // Set the parent window
            }
        });



        ffmpeg(videoFilePath)
            .toFormat(format)
            .on('end', () => { console.log("File conversion finished");
            progressBar.close()}
                )
        .on('progress', (someProgressObject) => {
            console.log(someProgressObject);
            progressBar.value = someProgressObject.percent;
            progressBar.detail = `${someProgressObject.percent} % complete`;
        })
        .saveToFile(outputFilePath + '.' + format)
})


}
module.exports = {
    setMainWindow: (window) => {
        mainWindow = window;
        Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
    },
};