// ==UserScript==
// @name TabPlus.uc.js
// @description 自用整合版标签增强
// @updateURL  https://raw.githubusercontent.com/xinggsf/uc/master/tabPlus.uc.js
// @namespace TabPlus@gmail.com
// @include chrome://browser/content/browser.xul
// @include chrome://browser/content/bookmarks/bookmarksPanel.xul
// @include chrome://browser/content/history/history-panel.xul
// @include chrome://browser/content/places/places.xul
// @version 2016.5.21
// @Note xinggsf 2016.5.15  用API判断是否为FX可用地址
// @Note xinggsf 2015.12.18 增加右击新建按钮新开剪贴板中的网址
// @Note xinggsf 2015.1.28 整合，并去掉经常产生BUG的地址栏输入新开功能
// @Note 2014.09.18 最后一次修正整合 by defpt
// ==/UserScript==
(function() {
// 新标签打开:书签、历史、搜索栏
try {
	eval('openLinkIn=' + openLinkIn.toString().replace(
		'w.gBrowser.selectedTab.pinned', '(!w.isTabEmpty(w.gBrowser.selectedTab) || $&)')
	.replace(/&&\s+w\.gBrowser\.currentURI\.host != uriObj\.host/, ''));
}catch(e){}
/* 地址栏新标签打开
try {
location=="chrome://browser/content/browser.xul" &&
eval("gURLBar.handleCommand="+gURLBar.handleCommand.toString().replace(/^\s*(load.+);/gm,
"if(/^javascript:/.test(url)||isTabEmpty(gBrowser.selectedTab)){loadCurrent();}else{this.handleRevert();gBrowser.loadOneTab(url, {postData: postData, inBackground: false, allowThirdPartyFixup: true});}"));
}catch(e){}
*/
//中键点击bookmark菜单不关闭
try {
	eval('BookmarksEventHandler.onClick =' + BookmarksEventHandler.onClick
		.toString().replace('node.hidePopup()', ''));
	eval('checkForMiddleClick =' + checkForMiddleClick.toString()
		.replace('closeMenus(event.target);', ''));
} catch(e) {}
//右键关闭标签页，ctrl+右键打开菜单
gBrowser.mTabContainer.addEventListener("click", e => {
	if (e.target.localName === "tab" && e.button === 2 && !e.ctrlKey) {
		e.preventDefault();
		gBrowser.removeTab(e.target);
		e.stopPropagation();
	}
}, false);
// 关闭当前标签页回到左边标签
try {
	eval("gBrowser._blurTab = " + gBrowser._blurTab.toString()
		.replace('this.selectedTab = tab;',
		"this.selectedTab = aTab.previousSibling? aTab.previousSibling : tab;"));
}catch(e){};

//右键点击新建按钮打开剪贴板中的网址
/* document.querySelector('#TabsToolbar .tabs-newtab-button').addEventListener('click', function(e){
	if(e.button == 2) {
		//let url= getClipboardURL();
		openNewTabWith('about:blank');
		gURLBar.select();
		goDoCommand('cmd_paste');
		gURLBar.handleCommand();
		e.preventDefault();
		e.stopPropagation();
	}
}, true); */
location=="chrome://browser/content/browser.xul" &&
window.addEventListener("click", function(e) {
	if (e.button === 2 && e.originalTarget.matches(".tabs-newtab-button")) {
		let url = readFromClipboard();
		// if (!/^(https?:\/\/)?([\w\-]+\.)+\w+(:\d+)?\/?[\w\-\/\|\?\.#%&=]*$/.test(url))
			// url = 'https://www.baidu.com/s?wd='+ encodeURIComponent(url);
		//gBrowser.loadOneTab(url, {inBackground:false});
		try {
			switchToTabHavingURI(url, true);
		} catch (ex) {
			url = 'https://www.baidu.com/s?wd='+ encodeURIComponent(url);
			switchToTabHavingURI(url, true);
		}
		e.preventDefault();
		e.stopPropagation();
	}
}, false);

//鼠标停留标签自动聚焦
(document.getElementById("tabbrowser-tabs") || gBrowser.mTabBox)
.addEventListener('mouseover', function onMouseOver(e) {
	if ((onMouseOver.target = e.target).localName === 'tab') {
		if (!onMouseOver.timeoutID) {
			this.addEventListener('mouseout', function () {
				clearTimeout(onMouseOver.timeoutID);
			}, false);
		}
		onMouseOver.timeoutID = setTimeout(function () {
			gBrowser.selectedTab = onMouseOver.target;
		}, 230);
	}
}, false);

//自动关闭下载产生的空白标签
eval("gBrowser.mTabProgressListener = " + gBrowser.mTabProgressListener.toString().replace(/(?=var location)/, '\
if (aWebProgress.DOMWindow.document.documentURI == "about:blank"\
&& aRequest.QueryInterface(nsIChannel).URI.spec != "about:blank") {\
aWebProgress.DOMWindow.setTimeout(function() {\
!aWebProgress.isLoadingDocument && aWebProgress.DOMWindow.close();\
}, 100);\
}\
'));
})();