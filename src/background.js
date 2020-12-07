function translate() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { "message": "translate" });
    });
}

chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
        "title": "翻譯中國IT用語",
        "contexts": ['all'],
        "onclick": translate,
    });
});
chrome.tabs.onActivated.addListener(function (tabs) {
    chrome.pageAction.show(tabs.tabId);
})
chrome.pageAction.onClicked.addListener(function(tab) {
    console.log('tab: ', tab);

})