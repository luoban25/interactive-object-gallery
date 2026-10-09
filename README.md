# 交互物件宫格 · 完整源码

当前 v59 版，12 个作品：复古电脑、机械臂、服务器机架、充电桩、数字闹钟、控制盒、交流电源、便携电视、迷你街机、设备连接场景、参考版服务器机架、发光台灯。

## 运行

安装 Python 3 后，在 Windows 双击 `start.bat`。浏览器会自动打开宫格；关闭终端窗口可停止服务。

也可在解压目录运行 `python serve.py`，或者用任意静态 HTTP 服务打开 `rack.html`。由于使用模块和 iframe，请通过 HTTP 运行。

默认只监听本机 127.0.0.1，从 8780 开始寻找空闲端口。手动指定端口：`python serve.py --port 9000`。

## 操作

- 卡片内直接操作按钮、旋钮、键盘、台灯开关。
- 01 的「演示」自动打字，再点击可停止。
- 点击右上角 ↗ 放大查看，Esc 或 × 返回宫格。
- 放大闹钟内的设置弹窗打开时，第一次 Esc 关闭设置，第二次 Esc 返回宫格。
- 电视保留凸面屏幕、404 和暗红色透明按钮。
- 街机：Enter 投币，左右键或拖动摇杆移动，空格或实体按钮发射，P 暂停。

宫格按需加载，并暂停屏幕外动画；预览采用轻量渲染，操作时提高更新频率，放大后保留完整画质。参考机架和台灯的 SVG 顶面显示问题已修复。

## 源码

`index.html` 自动进入宫格，`rack.html` 是宫格入口；`network.html` 是设备连接场景；`gallery.js` 控制排序、加载和放大；`object.html` 与 `object-loader.js` 加载三维作品；`collection` 是 SVG 作品及本地资源；`vendor` 包含 Three.js 与许可证。HTML、CSS、JavaScript、字体资源均在包内，运行无需在线 CDN。

原始项目日志、历史备份、删除或不在当前宫格的作品未收录。

## 来源

参考版服务器机架与发光台灯来自 April Zhu 的 Iso Figures，保留源码内的来源说明及 `collection/references/iso-figures-original-source/THIRD_PARTY_NOTICES.md`。第三方来源与字体许可证随附。本包不是对全部作品的原创声明。
