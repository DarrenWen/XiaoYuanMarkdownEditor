

// add 新增ipcMain,shell引用
const { info } = require("console");
const { app, BrowserWindow, ipcMain, shell, Menu, dialog, Tray,Notification  } = require("electron");
const file = require('./js/file');

const path = require("path");
const { title } = require("process");
var mainWindow = null;
let appIcon = null
const NOTIFICATION_TITLE = '小猿MarkDown编辑器'
const NOTIFICATION_BODY = '欢迎使用小猿MarkDown编辑器'
const CLICK_MESSAGE = 'Notification clicked'
function showNotification () {
 var notify = new Notification({ title: NOTIFICATION_TITLE, body: NOTIFICATION_BODY });
 
 notify.onclick = () => console.log(CLICK_MESSAGE)
 notify.show();
}

const createWindow = () => {
  mainWindow = new BrowserWindow({
    width: 1024,
    height: 768,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    },
    frame: false
  });
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();


  // mainWindow.loadURL('https://github.com');
  appIcon = new Tray(path.join(__dirname, 'static/ico/logo.ico'))
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '最小化', click: () => {
        mainWindow.minimize();
      }
    },
    {
      label: '关闭', click: async () => {
        app.quit();
      }
    }
  ])


  // Make a change to the context menu
  contextMenu.items[1].checked = false
  appIcon.setToolTip('小猿MarkDown编辑器.')
  // Call this again for Linux because we modified the context menu
  appIcon.setContextMenu(contextMenu)

  showNotification();
}
//监听 electron ready 事件创建窗口
app.on('ready', createWindow);
//监听窗口关闭的事件，关闭的时候退出应用，macOs 需要排除
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
//Macos 中点击 dock 中的应用图标的时候重新创建窗口
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// add 演示主进程和渲染通信代码
ipcMain.on('opengithub', (event, arg) => {
  console.log(arg) // prints "ping"
  event.reply('githubopened', '打开github成功!')
  shell.openExternal(arg);
});

// 添加菜单相关逻辑
const isMac = process.platform === 'darwin' //判断操作系统版本是不是mac
let filePath = '';//需要保存的文件路径
const template = [
  // { role: 'appMenu' }
  ...(isMac ? [{
    label: app.name,
    submenu: [
      { role: 'about' },
      { type: 'separator' },
      { role: 'services' },
      { type: 'separator' },
      { role: 'hide' },
      { role: 'hideothers' },
      { role: 'unhide' },
      { type: 'separator' },
      { role: 'quit' }
    ]
  }] : []),
  // { role: 'fileMenu' }
  {
    label: '文件',
    submenu: [
      {
        label: '新建', click: async () => {
          CreateFile();
        }
      },
      {
        label: '打开', click: async () => {
          OpenFile();
        }
      },
      {
        label: '保存', click: async () => {
          SaveFile();
        }
      },
      isMac ? { role: 'close' } : { role: 'quit', label: "退出" }
    ]
  },
  // { role: 'editMenu' }
  {
    label: '编辑',
    submenu: [
      { role: 'undo', label: "撤销" },
      { role: 'redo', label: '恢复' },
      { type: 'separator' },
      { role: 'cut', label: '剪切' },
      { role: 'copy', label: '复制' },
      { role: 'paste', label: '粘贴' },
      ...(isMac ? [
        { role: 'pasteAndMatchStyle' },
        { role: 'delete' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Speech',
          submenu: [
            { role: 'startSpeaking' },
            { role: 'stopSpeaking' }
          ]
        }
      ] : [
        { role: 'delete', label: '删除' },
        { type: 'separator' },
        { role: 'selectAll', label: '全选' }
      ])
    ]
  },
  // { role: 'viewMenu' }
  {
    label: '视图',
    submenu: [
      { role: 'reload', label: '重新加载' },
      { role: 'forceReload', label: '强制重新加载' },
      { role: 'toggleDevTools', label: '打开调试工具' },
      { type: 'separator' },
      { role: 'resetZoom', label: '重置缩放' },
      { role: 'zoomIn', label: '放大' },
      { role: 'zoomOut', label: '缩小' },
      { type: 'separator' },
      { role: 'togglefullscreen', label: '全屏' }
    ]
  },
  // { role: 'windowMenu' }
  {
    label: '窗口',
    submenu: [
      { role: 'minimize', label: '最小化' },
      { role: 'zoom' },
      ...(isMac ? [
        { type: 'separator' },
        { role: 'front' },
        { type: 'separator' },
        { role: 'window' }
      ] : [
        { role: 'close', label: '关闭' }
      ])
    ]
  },
  {
    role: 'help',
    label: '帮助',
    submenu: [
      {
        label: '学习更多',
        click: async () => {
          const { shell } = require('electron')
          await shell.openExternal('https://electronjs.org')
        }
      }
    ]
  }
];

const menu = Menu.buildFromTemplate(template)
Menu.setApplicationMenu(menu)

// main
ipcMain.on('show-context-menu', (event) => {
  const template = [
    {
      label: '菜单1',
      click: () => { event.sender.send('context-menu-command1', 'menu-item-1') }
    },
    { type: 'separator' },
    { label: '菜单2', type: 'checkbox', checked: true }
  ]
  const menu = Menu.buildFromTemplate(template)
  menu.popup(BrowserWindow.fromWebContents(event.sender))
})

ipcMain.on('saveFile', (event, args) => {
  file.saveFile(filePath, args);
  mainWindow.webContents.send('readFile', { title: filePath, content: args });
  dialog.showMessageBox({ title: '系统提示', message: '保存成功！' });

});

ipcMain.on('filecontrol', (event, args) => {
  switch (args) {
    case 'create':
      CreateFile();
      break;
    case 'open':
      OpenFile();
      break;
    case 'save':
      SaveFile();
      break;
    case 'tool':
      mainWindow.webContents.openDevTools();
      break;
    case 'help':
      var fpath = path.join(__dirname, "readme.md");
      var data = file.openFile(fpath);
      mainWindow.webContents.send('readFile', { title: fpath, content: data });

      break;
  }
});

function CreateFile() {
  filePath = '';
  mainWindow.webContents.send('createNew');
}
function SaveFile() {
  if (filePath == '') {
    dialog.showMessageBox({ title: '提示', message: '确认要保存吗？', type: "question", buttons: ['确认', '取消'], noLink: true }).then((res) => {
      if (res.response == 0) {
        dialog.showSaveDialog({ title: '保存文件', filters: [{ name: '文本文件', extensions: ['md'] }] }).then((res) => {
          console.log(res);
          if (!res.canceled) {
            filePath = res.filePath;
            mainWindow.webContents.send('writeFile');
          }

        }).catch((err) => {
          console.log(err);
        });
      }
      else {
        dialog.showMessageBox({ title: '系统提示', message: '用户取消了操作！', type: 'warning' })
      }
    });
  } else {
    mainWindow.webContents.send('writeFile');
  }
}
function OpenFile() {
  dialog.showOpenDialog({ title: '打开文件', properties: ['openfile'], filters: [{ name: '文本文件', extensions: ['md'] }] }).then((res) => {
    if (!res.canceled) {
      console.log(res.filePaths.toString());
      filePath = res.filePaths[0];
      var data = file.openFile(res.filePaths[0]);
      mainWindow.webContents.send('readFile', { title: res.filePaths[0], content: data });
    }
    // console.log(res.filePaths.toString());
    // dialog.showMessageBox({title:'打开文件提醒',message:res.filePaths.toString(),type:'info'});
  }).catch((err) => {
    console.log(err);
  });
}