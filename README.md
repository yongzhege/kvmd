# KVMD
[![CI](https://github.com/pikvm/kvmd/workflows/CI/badge.svg)](https://github.com/pikvm/kvmd/actions?query=workflow%3ACI)
[![Discord](https://img.shields.io/discord/580094191938437144?logo=discord)](https://discord.gg/bpmXfz5)

This repository contains the configuration and code of KVMD, the main PiKVM daemon.
If your request does not relate directly to this codebase, please send it to issues of the [PiKVM](https://github.com/pikvm/pikvm/issues) repository.

## 本地开发

要在本地开发和调试网页界面，请按照以下步骤操作：

### 安装依赖

```bash
npm install
```

### 启动开发服务器

```bash
npm run dev
```

或者使用监视模式（自动重启服务器）：

```bash
npm run dev:watch
```

### 访问开发服务器

开发服务器运行后，访问：

- 首页: http://localhost:3000/index.html
- 调试页面: http://localhost:3000/debug.html （用于测试国际化功能）

开发服务器提供了以下功能：
- 静态文件服务
- 模拟API端点
- 跨域支持
- 热重载（使用dev:watch模式）

### 调试国际化功能

我们提供了一个专门的调试页面用于测试国际化功能。在这个页面上，您可以：

1. 切换语言并立即查看翻译效果
2. 查看当前加载的翻译内容
3. 显示详细的调试信息，包括当前语言、翻译数据等
4. 清除本地存储中的语言设置
5. 重新加载翻译资源

这个调试页面对于排查翻译问题非常有用。
