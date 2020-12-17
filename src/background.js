
chrome.runtime.onInstalled.addListener(function() {
    chrome.contextMenus.create({
        "title": "翻譯中國IT用語",
        "contexts": ['all'],
        "onclick": translate,
    });
});
chrome.runtime.onMessage.addListener((req, sender) => {
    console.log('req, sender: ', req, sender);
    const { type, value } = req
    if (type === 'icon') {
        setIcon(value)
    }
})
chrome.tabs.onActivated.addListener(function (tab) {
    console.log('activated', tab);
    chrome.tabs.get(tab.tabId, async function (tab) {
        const siteStatus = await getSiteStatus(getUrlDomain(tab.url))
        setIcon(siteStatus)
    });
})
chrome.browserAction.onClicked.addListener(async function(tab) {
    console.log('clicked', tab);
    const url = getUrlDomain(tab.url)
    const siteStatus = !(await getSiteStatus(url))
    setSiteStatus(url, siteStatus)
    setIcon(siteStatus)
})

function translate() {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        const tab = tabs[0]
        const url = getUrlDomain(tab.url)
        chrome.tabs.sendMessage(tab.id, { "message": "translate" });
        setSiteStatus(url, true)
        setIcon(true)
    });
}

function setIcon(bool) {
    chrome.browserAction.setIcon({
        path: (bool) ? 'icons/icon-active16.png' : 'icons/icon-inactive16.png',
    })
}

function getUrlDomain(url) {
    return /^(?:https?:\/\/)?(?:[^@\/\n]+@)?(?:www\.)?([^:\/?\n]+)/.exec(url)[1]
}

function setSiteStatus(host, bool) {
    chrome.storage.sync.set({ [host]: bool }, function () {
        console.log(host, 'is set to ' + bool);
    });
}

function getSiteStatus(host) {
    return new Promise((res, rej) => chrome.storage.sync.get(host, function (result) {
        console.log(host, 'currently is ', result[host]);
        res(result[host])
    }));
}