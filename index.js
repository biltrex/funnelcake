'use strict';
const electron = require('electron');
const app = electron.app;

// twitter support
const Twitter = require('twitter');


// report crashes to the Electron project
require('crash-reporter').start();

// adds debug features like hotkeys for triggering dev tools and reload
require('electron-debug')();


// prevent window being garbage collected
let mainWindow;

function onClosed() {
    // dereference the window
    // for multiple windows store them in an array
    mainWindow = null;
}

function createMainWindow() {

    const win = new electron.BrowserWindow({
        width: 1200,
        height: 800
    });

    win.loadURL(`file://${__dirname}/index.html`);
    win.on('closed', onClosed);

    return win;
}

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (!mainWindow) {
        mainWindow = createMainWindow();
    }
});

app.on('ready', () => {

    mainWindow = createMainWindow();


    var ipcMain = require('electron').ipcMain;
    console.log("IPC main is");
    ipcMain.on('changeTerm', function (event, arg) {
        console.log("Got change term from renderer", arg);
        openTwitterStream(arg);
    });

    var openTwitterStream = function (theterm) {
        var twitterStream = new Twitter({
            consumer_key: 'jMfUHwaQXJlEUO9yr5iL2ULpL',
            consumer_secret: 'k0mb3pNQhv1EF1abVrELlEknO1mkveKMkbhTVQi49PeeYxZ1zm',
            access_token_key: '16248228-lX75POEti2UBms5ULjlJHIlE67CAio58bts4THxdd',
            access_token_secret: '2QEWSyLzHQlE4WwdqR3pTMqergViJVJYKTAzDAB4k3fF2'
        });

        twitterStream.stream('statuses/filter', {
            track: theterm
        }, function (stream) {
            stream.on('data', function (tweet) {
                try {
                    //console.log(tweet.text);
                    // this is the tweet text, send it back to the listener in fc-twitter

                    mainWindow.webContents.send('changeTerm', {
                        "user": tweet.user,
                        "shout": tweet.text
                    });
                } catch (err) {
                    console.log("Some kind of twitter error", err);
                }
            });
        });
    };

    var changeTerm = function (event, arg) {
        //console.log("Changing term", event, arg);
        searchTerm = this.$.fcTrack.value;
        twitterStream = null;
        openTwitterStream(searchTerm);
    };


});
