function translate() {
    chrome.tabs.query({ active: true,currentWindow:true }, function (tabs) {
        chrome.tabs.sendMessage(tabs[0].id, { "message": "translate" });  
    });
}

chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
        "title": "翻譯中國用語",
        "contexts": ['all'],
        "onclick": translate,
    });
});