const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// 启用跨域请求
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  next();
});

// 静态文件目录
app.use(express.static(path.join(__dirname, 'web')));

// 模拟API端点 - 可以在这里添加更多的模拟API
app.get('/api/info', (req, res) => {
  res.json({
    "ok": true,
    "result": {
      "auth": {
        "enabled": true
      },
      "extras": {
        "ipmi": {
          "daemon": "kvmd-ipmi",
          "description": "Show IPMI information",
          "enabled": false,
          "icon": "share/svg/ipmi.svg",
          "name": "IPMI",
          "path": "ipmi",
          "place": 21,
          "port": 623,
          "started": false
        },
        "janus": {
          "daemon": "kvmd-janus",
          "description": "Janus WebRTC Gateway",
          "enabled": true,
          "name": "Janus",
          "path": "janus",
          "place": -1,
          "started": true
        },
        "janus_static": {
          "daemon": "kvmd-janus-static",
          "description": "Janus WebRTC Gateway (Static Config)",
          "enabled": false,
          "name": "Janus Static",
          "path": "janus",
          "place": -1,
          "started": false
        },
        "media": {
          "daemon": "kvmd-media",
          "description": "KVMD Media Proxy",
          "enabled": true,
          "name": "Media",
          "path": "media",
          "place": -1,
          "started": true
        },
        "vnc": {
          "daemon": "kvmd-vnc",
          "description": "Show VNC information",
          "enabled": false,
          "icon": "share/svg/vnc.svg",
          "name": "VNC",
          "path": "vnc",
          "place": 20,
          "port": 5900,
          "started": false
        },
        "webterm": {
          "daemon": "kvmd-webterm",
          "description": "Open terminal in a web browser",
          "enabled": true,
          "icon": "extras/webterm/terminal.svg",
          "name": "Terminal",
          "path": "extras/webterm/ttyd",
          "place": 10,
          "started": true
        }
      },
      "meta": {
        "kvm": {},
        "server": {
          "host": "Local Dev Server"
        }
      }
    }
  });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`开发服务器运行在 http://localhost:${PORT}`);
  console.log(`访问首页: http://localhost:${PORT}/index.html`);
  console.log(`访问调试页面: http://localhost:${PORT}/debug.html`);
});

// 监听未捕获的异常
process.on('uncaughtException', (err) => {
  console.error('未捕获的异常:', err);
}); 