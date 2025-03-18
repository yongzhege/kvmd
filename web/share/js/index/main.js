/*****************************************************************************
#                                                                            #
#    KVMD - The main PiKVM daemon.                                           #
#                                                                            #
#    Copyright (C) 2018-2024  Maxim Devaev <mdevaev@gmail.com>               #
#                                                                            #
#    This program is free software: you can redistribute it and/or modify    #
#    it under the terms of the GNU General Public License as published by    #
#    the Free Software Foundation, either version 3 of the License, or       #
#    (at your option) any later version.                                     #
#                                                                            #
#    This program is distributed in the hope that it will be useful,         #
#    but WITHOUT ANY WARRANTY; without even the implied warranty of          #
#    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the           #
#    GNU General Public License for more details.                            #
#                                                                            #
#    You should have received a copy of the GNU General Public License       #
#    along with this program.  If not, see <https://www.gnu.org/licenses/>.  #
#                                                                            #
*****************************************************************************/


"use strict";


import {ROOT_PREFIX} from "../vars.js";
import {tools, $} from "../tools.js";
import {checkBrowser} from "../bb.js";
import {wm, initWindowManager} from "../wm.js";


export function main() {
	initWindowManager();

	if (checkBrowser(null, null)) {
		__setAppText();
		
		// 先加载API信息
		__loadKvmdInfo();
		
		// 设置i18next初始化完成事件监听
		document.addEventListener('i18nextInitialized', function() {
			console.log('检测到i18next初始化完成，刷新应用按钮');
			__refreshAppButtons();
			__setupI18nListeners();
		});
		
		// 如果i18next已经初始化完成，设置语言变化监听
		if (window.i18next && window.i18next.isInitialized) {
			__setupI18nListeners();
		}
	}
}

function __setAppText() {
	let e_href = tools.escape(window.location.href);
	$("app-text").innerHTML = `
		<span class="code-comment"># On Linux using Chromium/Chrome via any terminal:<br>
		$</span> \`which chromium 2>/dev/null || which chrome 2>/dev/null || which google-chrome\` --app="${e_href}"<br>
		<br>
		<span class="code-comment"># On MacOS using Terminal application:<br>
		$</span> /Applications/Google&bsol; Chrome.app/Contents/MacOS/Google&bsol; Chrome --app="${e_href}"<br>
		<br>
		<span class="code-comment"># On Windows via cmd.exe:<br>
		C:&bsol;&gt;</span> start chrome --app="${e_href}"
	`;
}

function __loadKvmdInfo() {
	tools.httpGet("api/info", {"fields": "auth,meta,extras"}, function(http) {
		switch (http.status) {
			case 200:
				__showKvmdInfo(JSON.parse(http.responseText).result);
				break;

			case 401:
			case 403:
				tools.currentOpen("login");
				break;

			default:
				setTimeout(__loadKvmdInfo, 1000);
				break;
		}
	});
}

function __showKvmdInfo(info) {
	let apps = [];
	if (info.extras === null) {
		wm.error("Not all applications in the menu can be displayed due an error.<br>See KVMD logs for details.");
	} else {
		apps = Object.values(info.extras).sort(function(a, b) {
			if (a.place < b.place) {
				return -1;
			} else if (a.place > b.place) {
				return 1;
			} else {
				return 0;
			}
		});
	}

	// 保存应用信息到全局变量，以便语言切换时可以刷新
	window.__kvmdApps = apps;
	window.__kvmdInfo = info;
	
	__renderApps(info, apps);
}

// 渲染应用按钮
function __renderApps(info, apps) {
	let html = "";

	// Don't use this option, it may be removed in any time
	let hide_kvm_button = (
		(info.meta !== null && info.meta.web && info.meta.web.hide_kvm_button)
		|| tools.config.getBool("index--hide-kvm-button", false)
	);
	if (!hide_kvm_button) {
		html += __makeApp(null, "kvm", "share/svg/kvm.svg", "KVM");
	}

	for (let app of apps) {
		if (app.place >= 0 && (app.enabled || app.started)) {
			html += __makeApp(null, app.path, app.icon, app.name);
		}
	}

	if (info.auth.enabled) {
		html += __makeApp("logout-button", "#", "share/svg/logout.svg", window.i18next ? window.i18next.t("common.logout") : "Logout");
	}

	$("apps-box").innerHTML = `<ul id="apps">${html}</ul>`;

	if (info.auth.enabled) {
		tools.el.setOnClick($("logout-button"), __logout);
	}

	if (info.meta !== null && info.meta.server && info.meta.server.host) {
		$("kvmd-meta-server-host").innerHTML = info.meta.server.host;
		document.title = `PiKVM Index: ${info.meta.server.host}`;
	} else {
		$("kvmd-meta-server-host").innerHTML = "";
		document.title = "PiKVM Index";
	}
}

// 刷新应用按钮（用于语言变化时）
function __refreshAppButtons() {
	if (window.__kvmdInfo && window.__kvmdApps) {
		__renderApps(window.__kvmdInfo, window.__kvmdApps);
	}
}

function __makeApp(id, path, icon, name) {
	// Tailing slash in href is added to avoid Nginx 301 redirect
	// when the location doesn't have tailing slash: "foo -> foo/".
	// Reverse proxy over PiKVM can be misconfigured to handle this.
	let e_add_id = (id ? `id="${tools.escape(id)}"` : "");
	
	// 获取应用程序标识符（路径的最后一部分）
	let appId = "";
	
	// 特殊情况处理
	if (path === "#") {
		// 登出按钮
		appId = "logout";
		if (window.i18next && window.i18next.isInitialized) {
			return `<li>
				<div ${e_add_id} class="app">
					<a href="${tools.escape(ROOT_PREFIX + path)}/">
						<div>
							<img class="svg-gray" src="${tools.escape(ROOT_PREFIX + icon)}">
							${tools.escape(window.i18next.t("common.logout"))}
						</div>
					</a>
				</div>
			</li>`;
		}
	} else if (path.includes('extras/webterm')) {
		// webterm特殊处理
		appId = "webterm";
	} else {
		// 常规应用，提取路径最后一部分
		appId = path;
		if (appId.includes('/')) {
			appId = appId.split('/').pop();
		}
	}
	
	// 尝试使用i18next翻译
	let displayName = name;
	if (window.i18next && window.i18next.isInitialized && appId) {
		// 尝试从apps命名空间获取翻译
		const translated = window.i18next.t(`apps.${appId}`, { defaultValue: name });
		if (translated !== `apps.${appId}`) {
			displayName = translated;
		}
	}
	
	return `<li>
		<div ${e_add_id} class="app">
			<a href="${tools.escape(ROOT_PREFIX + path)}/">
				<div>
					<img class="svg-gray" src="${tools.escape(ROOT_PREFIX + icon)}">
					${tools.escape(displayName)}
				</div>
			</a>
		</div>
	</li>`;
}

function __logout() {
	tools.httpPost("api/auth/logout", null, function(http) {
		switch (http.status) {
			case 200:
			case 401:
			case 403:
				tools.currentOpen("login");
				break;

			default:
				wm.error("Logout error", http.responseText);
				break;
		}
	});
}

// 设置i18next监听器
function __setupI18nListeners() {
	// 监听语言变化事件
	window.i18next.on('languageChanged', function() {
		// 语言变化时重新渲染按钮
		__refreshAppButtons();
	});
}
