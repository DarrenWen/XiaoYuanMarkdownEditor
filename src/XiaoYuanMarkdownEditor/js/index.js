//add
const electron = require("electron");
const ipcRenderer = electron.ipcRenderer;
const remote = electron.remote;
var showdown  = require('showdown');
function load(){
   // 第一次调用该函数
  watchWindowSize();
  SelectedDefaultMenu();
  mdSwitch();
}

 function SelectedDefaultMenu () {
  console.clear();
  document.getElementsByClassName('sidebar__menu--item')[0].classList.add('is-active');
  const menuItems = Array.from(document.querySelectorAll('.sidebar__menu--item'));
menuItems.forEach(item => {
  item.addEventListener('click', e => {
    menuItems.forEach(item => {
      item.classList.remove('is-active');
    });
    var data = e.currentTarget.getAttribute('data');
    e.currentTarget.classList.add('is-active');
    fileControl(data);
  });
});
};



function mdSwitch() {
    var mdValue = document.getElementById("md-area").value;
    var converter = new showdown.Converter();
    var html = converter.makeHtml(mdValue);
    document.getElementById("show-area").innerHTML = html;
}

// add 从主进程打开github成功后的监听事件
ipcRenderer.on("readFile",(event,arg)=>{
    document.title = arg.title;
    console.log(arg);
    document.getElementById("md-area").value = arg.content;
    mdSwitch();
})

ipcRenderer.on('writeFile',(event,arg)=>{
    var data = document.getElementById("md-area").value;
    ipcRenderer.send('saveFile',data);
});

ipcRenderer.on('createNew',(event,arg)=>{
    document.title='新建文件';
    document.getElementById("md-area").value ='';
    mdSwitch();
})

// renderer
window.addEventListener('contextmenu', (e) => {
    //e.preventDefault()
    //ipcRenderer.send('show-context-menu')
  });

  // 定义事件侦听器函数
function watchWindowSize() {
    // 获取窗口的宽度和高度，不包括滚动条
    var w = document.documentElement.clientWidth;
    var h = document.documentElement.clientHeight;
    // 打印结果
    console.log( "宽: " + w + ", " + "高: " + h);
    var tbArea =  document.getElementById("tbArea");
    tbArea.style.height = (h-48)+"px";
    var showarea = document.getElementById("show-area");
    showarea.style.height = (h-48)+"px";
    document.getElementById("md-area").focus();
  }
  // 将事件侦听器函数附加到窗口的resize事件
  window.addEventListener("resize", watchWindowSize);
  
  
ipcRenderer.on('context-menu-command1', (e, command) => {
// ...
   alert(command);
})

///控制窗体变化
function winControl(action) {
  const browserWindow = remote.getCurrentWindow()
  switch (action) {
      case 'minimize':
          browserWindow.minimize()
          break;
      case 'maximize':
          // if (this.isMaximized) {
          if (browserWindow.isMaximized()) {
              browserWindow.unmaximize()
          } else {
              if (this.isMaximized) {
                  browserWindow.unmaximize()
              } else {
                  browserWindow.maximize()
              }
          }
          // this.isMaximized = browserWindow.isMaximized()
          this.isMaximized = !this.isMaximized

          break;
      case 'close':
          browserWindow.close()
          break;
      default:
          break;
  }
}

function fileControl(action){
  ipcRenderer.send('filecontrol',action);
 
}