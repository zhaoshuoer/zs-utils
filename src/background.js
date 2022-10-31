import { app, protocol, BrowserWindow, Menu, shell, dialog } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
const isDevelopment = process.env.NODE_ENV !== 'production'

let template = [{
	label: '编辑',
	submenu: [{
		label: '撤销',
		accelerator: 'CmdOrCtrl+Z',
		role: 'undo'
	}, {
		label: '重做',
		accelerator: 'Shift+CmdOrCtrl+Z',
		role: 'redo'
	}, {
		type: 'separator'
	}, {
		label: '剪切',
		accelerator: 'CmdOrCtrl+X',
		role: 'cut'
	}, {
		label: '复制',
		accelerator: 'CmdOrCtrl+C',
		role: 'copy'
	}, {
		label: '粘贴',
		accelerator: 'CmdOrCtrl+V',
		role: 'paste'
	}, {
		label: '全选',
		accelerator: 'CmdOrCtrl+A',
		role: 'selectall'
	}]
}, {
	label: '查看',
	submenu: [{
		label: '重载',
		accelerator: 'CmdOrCtrl+R',
		click: (item, focusedWindow) => {
			if (focusedWindow) {
				// 重载之后, 刷新并关闭所有之前打开的次要窗体
				if (focusedWindow.id === 1) {
					BrowserWindow.getAllWindows().forEach(win => {
						if (win.id > 1) win.close()
					})
				}
				focusedWindow.reload()
			}
		}
	}, {
		label: '切换全屏',
		accelerator: (() => {
			if (process.platform === 'darwin') {
				return 'Ctrl+Command+F'
			} else {
				return 'F11'
			}
		})(),
		click: (item, focusedWindow) => {
			if (focusedWindow) {
				focusedWindow.setFullScreen(!focusedWindow.isFullScreen())
			}
		}
	}, {
		label: '切换开发者工具',
		accelerator: (() => {
			if (process.platform === 'darwin') {
				return 'Alt+Command+I'
			} else {
				return 'Ctrl+Shift+I'
			}
		})(),
		click: (item, focusedWindow) => {
			if (focusedWindow) {
				focusedWindow.toggleDevTools()
			}
		}
	}, {
		type: 'separator'
	}]
}, {
	label: '窗口',
	role: 'window',
	submenu: [{
		label: '最小化',
		accelerator: 'CmdOrCtrl+M',
		role: 'minimize'
	}, {
		label: '关闭',
		accelerator: 'CmdOrCtrl+W',
		role: 'close'
	}]
}]

// 方案必须在应用程序就绪之前注册
protocol.registerSchemesAsPrivileged([
	{ scheme: 'app', privileges: { secure: true, standard: true } }
])
app.commandLine.appendSwitch('lang', 'zh-CN')

async function createWindow() {
	// 创建浏览器窗口
	const win = new BrowserWindow({
		width: 800,
		height: 600,
		webPreferences: {
			// 使用插件选项。nodeIntegration，别管这个
			// 参见nklayman.github.io/vue-cli-plugin-electron-builder/guide/security。html#节点集成了解更多信息
			nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
			contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
		}
	})
	if (process.env.WEBPACK_DEV_SERVER_URL) {// 如果处于开发模式，则加载开发服务器的url
		await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
		if (!process.env.IS_TEST) win.webContents.openDevTools()
	} else {
		createProtocol('app')
		win.loadURL('app://./index.html')// 未开发时加载index.html
	}
}

// 关闭所有窗口后退出
app.on('window-all-closed', () => {
	// 在macOS上，应用程序及其菜单栏很常见
	// 保持活动状态，直到用户使用Cmd+Q明确退出
	if (process.platform !== 'darwin') {
		app.quit()
	}
	let reopenMenuItem = findReopenMenuItem()
	if (reopenMenuItem) reopenMenuItem.enabled = true
})

app.on('browser-window-created', () => {
	let reopenMenuItem = findReopenMenuItem()
	if (reopenMenuItem) reopenMenuItem.enabled = false
})

// 当Electron完成初始化并准备创建浏览器窗口时，将调用此方法。某些API只能在此事件发生后使用。
app.on('ready', async () => {
	if (isDevelopment && !process.env.IS_TEST) {
		// 安装视图开发工具
		try {
			await installExtension(VUEJS3_DEVTOOLS)
		} catch (e) {
			console.error('Vue Devtools failed to install:', e.toString())
		}
	}
	const menu = Menu.buildFromTemplate(template)
	Menu.setApplicationMenu(menu)
	console.log(Menu.getApplicationMenu())
	createWindow()
})

// 在开发模式下，根据父进程的请求干净地退出。
if (isDevelopment) {
	if (process.platform === 'win32') {
		process.on('message', (data) => {
			if (data === 'graceful-exit') {
				app.quit()
			}
		})
	} else {
		process.on('SIGTERM', () => {
			app.quit()
		})
	}
}
function addUpdateMenuItems(items, position) {
	if (process.mas) return

	const version = app.getVersion()
	let updateItems = [{
		label: `版本 ${version}`,
		enabled: false
	}, {
		label: '正在检查更新',
		enabled: false,
		key: 'checkingForUpdate'
	}, {
		label: '检查更新',
		visible: false,
		key: 'checkForUpdate',
		click: () => {
			require('electron').autoUpdater.checkForUpdates()
		}
	}, {
		label: '重启并安装更新',
		enabled: true,
		visible: false,
		key: 'restartToUpdate',
		click: () => {
			require('electron').autoUpdater.quitAndInstall()
		}
	}]

	items.splice.apply(items, [position, 0].concat(updateItems))
}

function findReopenMenuItem() {
	const menu = Menu.getApplicationMenu()
	if (!menu) return

	let reopenMenuItem
	menu.items.forEach(item => {
		if (item.submenu) {
			item.submenu.items.forEach(item => {
				if (item.key === 'reopenMenuItem') {
					reopenMenuItem = item
				}
			})
		}
	})
	return reopenMenuItem
}

if (process.platform === 'darwin') {
	const name = app.getName()
	template.unshift({
		label: name,
		submenu: [{
			label: `关于 ${name}`,
			role: 'about'
		}, {
			type: 'separator'
		}, {
			label: '服务',
			role: 'services',
			submenu: []
		}, {
			type: 'separator'
		}, {
			label: `隐藏 ${name}`,
			accelerator: 'Command+H',
			role: 'hide'
		}, {
			label: '隐藏其它',
			accelerator: 'Command+Alt+H',
			role: 'hideothers'
		}, {
			label: '显示全部',
			role: 'unhide'
		}, {
			type: 'separator'
		}, {
			label: '退出',
			accelerator: 'Command+Q',
			click: () => {
				app.quit()
			}
		}]
	})

	// 窗口菜单.
	template[3].submenu.push({
		type: 'separator'
	}, {
		label: '前置所有',
		role: 'front'
	})

	addUpdateMenuItems(template[0].submenu, 1)
}

if (process.platform === 'win32') {
	const helpMenu = template[template.length - 1].submenu
	addUpdateMenuItems(helpMenu, 0)
}


