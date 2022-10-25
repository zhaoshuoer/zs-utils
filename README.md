# Electron + Vue3 开发跨平台桌面应用

> 将Vue引入Electron项目常用的两种方案分别是Vue CLI Plugin Electron Builder和electron-vue。从周下载量来看，Vue CLI Plugin Electron Builder的下载量是electron-vue三倍左右，使用更加广泛。下面我们将基于Vue CLI Plugin Electron Builder来介绍如何把Vue引入Electron工程中。
>
> 引用文章地址：https://juejin.cn/post/6983843979133468708

### 项目搭建

Vue CLI Plugin Electron Builder 是基于Vue Cli的，因此项目的搭建非常方便。

### 基础环境

推荐的 NodeJs 版本为 v14.15.0

node的版本管理工具推荐nvm 

npm 版本为 v6.14.8

```shell
# 清除一下安装缓存
$ npm cache clean --force
# 安装 NodeJs 
$ nvm install v14.15.0
# 降低 npm 版本
$ npm install npm@6.14.8 -g
```

### 创建vue项目

首先，安装：`npm i @vue/cli -g`

接着，创建项目：`vue create electron-vue`

### 安装Vue CLI Plugin Electron Builder

```shell
$ cd electron-vue
$ vue add electron-builder
```

### 启动项目

```shell
$ yarn electron:serve
```

运行效果如下：

![](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/542aa77818a54c0d94b3aa2b418e2aa7~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)

#### 初始的项目目录

如果你有过vue开发经验，会发现整个项目目录还是熟悉的配方，业务代码放在了`src`文件夹下。

渲染进程的页面交给了vue进行渲染，开发过程和我们平时使用vue开发web页面相差无几。而electron主进程的代码是放在`background.js`中。

![](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0b6319a79b6643e5a2c4ba4cd71682cd~tplv-k3u1fbpfcp-zoom-in-crop-mark:4536:0:0:0.awebp)

### 打包和自动更新

> 引用地址：https://juejin.cn/post/6980105328801087518

打包之前需要先生成 各平台的 ``Icon`` 图标，此时需要借助 ``electron-icon-builder`` 工具：

需要准备一张 1024 * 1024 大小的图片，将图片放到 项目的 public 文件夹内

```shell
$ yarn add electron-icon-builder -D
```

安装好工具之后需要在 ``package.json`` 中添加对应的命令

```jaon
"build-icon": "electron-icon-builder --input=./public/icon.png --output=dist --flatten"
```

然后在 命令行 shell 窗口中执行 ```yarn  build-icon``` 后，会在项目根目录下 ``dist/icons`` 产出所有平台下使用的图标文件了

```shell
# 根据 Vue CLI Plugin Electron Builder 的配置打包，打包的配置放在 vue.config.js 中
$ yarn electron:build 
```

此时如果不更改任何配置，``electron`` 将会根据你当前的操作系统，打出适合的包，如果想要修改打包配置或者打出不同平台的包，修改配置文件如下：

```javascript
pluginOptions: {
    electronBuilder: {
        builderOptions: {
            productName: "测试程序",
            appId: "shuoer",
            copyright: "Copyright © year shuoer",
            directories: {
                output: "dist",
            },
            // Mac 平台相对应的打包配置
            mac: {
                target: ["dmg", "zip"],
                icon: "public/icons/icon.icns",// 程序的图标
                category: "public.app-category.utilities",
            },
            // Mac 平台安装包的配置
            dmg: {
                icon: "public/icons/icon.icns",// 程序的图标
                iconSize: 100,// 图标大小
                //Mac 程序安装窗口的配置
                contents: [
                    { x: 380, y: 180, type: "link", path: "/Applications"},
                    { x: 130, y: 180, type: "file"},
                ],
                // Mac 程序安装时的窗口大小
                window: {
                    width: 540,
                    height: 380,
                },
                // Mac 程序安装窗口的背景色
                backgroundColor: "#fff",
            },
            // Windows 平台相对应的打包配置
            win: {
                target: ["nsis"],// 打包的类型
                verifyUpdateCodeSignature: false,// 禁掉程序的签名验证
                icon: "public/icons/icon.ico",// 程序的图标
            },
            nsis: {
                oneClick: false, //是否一键安装，默认为true
                language: "2052", //安装语言，2052对应中文
                perMachine: true, //为当前系统的所有用户安装该应用程序
                allowToChangeInstallationDirectory: true, //允许用户选择安装目录
                deleteAppDataOnUninstall: true,// 当程序卸载时同时删除程序的数据
            },
        },
    },
},
```

配置文件改好之后，只需要在 ``package.json`` 中添加相对应的脚本就可以了。

```json
"package-mac": "vue-cli-service electron:build --mac",
"package-win": "vue-cli-service electron:build --win --x64",
```

 

OK，一个简单的 ``Electron + Vue`` 的基本工程就搭建好了！
