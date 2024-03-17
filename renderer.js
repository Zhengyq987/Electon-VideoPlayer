const { ipcRenderer } = require('electron');

document.addEventListener('DOMContentLoaded', () => {
    ipcRenderer.on('video-selected', (event, videoFilePath) => {
        console.log(`Selected video path in renderer process: ${videoFilePath}`);

        // Set the new video source directly
        const videoElement = document.querySelector('.js-player');
        videoElement.src = videoFilePath;

})
})