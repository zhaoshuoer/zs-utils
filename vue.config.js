const { defineConfig } = require("@vue/cli-service");
module.exports = defineConfig({
	transpileDependencies: true,
	pluginOptions: {
		electronBuilder: {
			builderOptions: {
				productName: "zsUtils",
				appId: "shuoer",
				copyright: "Copyright © year shuoer",
				directories: {
					output: "dist"
				},
				// Mac 平台相对应的打包配置
				mac: {
					target: ["dmg"],
					icon: "public/icons/icon.icns", // 程序的图标
					category: "public.app-category.utilities"
				},
				// Mac 平台安装包的配置
				dmg: {
					icon: "public/icons/icon.icns", // 程序的图标
					iconSize: 100, // 图标大小
					//Mac 程序安装窗口的配置
					contents: [
						{ x: 380, y: 180, type: "link", path: "/Applications" },
						{ x: 130, y: 180, type: "file" }
					],
					// Mac 程序安装时的窗口大小
					window: {
						width: 540,
						height: 380
					},
					// Mac 程序安装窗口的背景色
					backgroundColor: "#fff"
				},
				// Windows 平台相对应的打包配置
				win: {
					target: ["nsis", "portable"], // 打包的类型
					verifyUpdateCodeSignature: false, // 禁掉程序的签名验证
					icon: "public/icons/icon.ico" // 程序的图标
				},
				nsis: {
					oneClick: false, //是否一键安装，默认为true
					language: "2052", //安装语言，2052对应中文
					perMachine: true, //为当前系统的所有用户安装该应用程序
					allowToChangeInstallationDirectory: true, //允许用户选择安装目录
					deleteAppDataOnUninstall: true // 当程序卸载时同时删除程序的数据
				}
			}
		}
	}
});
