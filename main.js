const terms = {
    變量: '變數',
    數組: '陣列',
    對象: '物件',
    對像: '物件',
    代碼: '程式碼',
    源碼: '原始碼',
    項目: '專案',
    信息: '資訊',
    戰略: '策略',
    程序: '程式',
    數據: '資料',
    可視化: '視覺化',
    模塊: '模組',
    字段: '欄位',
    連機窗體: '線上表單',
    數字: '數位',
    移動: '行動',
    餅圖: '圓餅圖',
    指針: '指標',
    窗口: '視窗',
    智能手機: '智慧型手機',
    智能: '智慧',
    屏幕: '螢幕',
    全屏: '全螢幕',
    服務器: '伺服器',
    在線: '線上',
    文檔: '文件',
    操作系統: '作業系統',
    互聯網: '網路',
    帶寬: '頻寬',
    軟件: '軟體',
    硬件: '硬體',
    服務器: '伺服器',
    筆記本: '筆記型電腦',
    上網本: '小筆電',
    臺式機: '桌上型電腦',
    光驅: '光碟機',
    硬盤: '硬碟',
    內存: '記憶體',
    刻錄光盤: '燒錄光碟',
    鼠標: '滑鼠',
    打印機: '印表機',
    激光: '雷射',
    屏幕: '螢幕',
    智能手機: '智慧型手機',
    攝像頭: '網路攝影機',
    U盤: '隨身碟',
    知識產權: '智慧財產權',
    社交網站: '社群網站',
    社會媒體: '社群媒體',
    博客: '部落格',
    論壇: '討論區',
    關鍵詞: '關鍵字',
    搜索引擎: '搜尋引擎',
    文件管理: '檔案管理',
    數據庫: '資料庫',
    優化: '最佳化',
    文本: '純文字檔',
    設置: '設定',
    查找: '查詢',
    卸載: '移除',
    拷貝: '複製',
    視頻: '視訊',
    音頻: '音訊',
    短信: '簡訊',
    在線: '上線',
    離線: '下線',
    掉線: '斷線',
    重啟: '重開',
    個人形象: '個人造型',
    聯繫人: '聯絡人',
}

/**
 * 
 * @param  {HTMLElement} node 
 * @return {void}
 */
function translate(node) {
    if (node.children.length) {
        forEach(node.children, node => translate(node))
    } else if (node.root) {
        forEach(node.root.children, node => translate(node))
    } else {
        const original = node.innerText
        if (!original) return
        let res = original
        let skipUntil = 0

        forEach(original, (char, i) => {
            if (!isChineseChar(char) || skipUntil > i) return

            // 詞
            for (const cn in terms) {
                const tw = terms[cn]
                let match = true
                // 字
                for (const o in cn) {
                    const cnChar = cn[o];
                    const j = +i + +o
                    if (original[j] !== cnChar) {
                        match = false
                        break
                    }
                }
                if (match) {
                    // const _tw = `<span style="color:red;">${tw}</span>`
                    // res = res.replaceAll(cn, _tw)
                    res = res.replaceAll(cn, tw)
                    skipUntil += Math.min(tw.length, cn.length) // + 32
                }
            }
        })

        node.innerText = res
    }
}

function isChineseChar(char) {
    return char.match(/[\u3400-\u9FBF]/)
}

function forEach(collection, cb) {
    for (const i in collection) {
        if (collection.hasOwnProperty(i)) {
            const element = collection[i];
            cb(element, i)
        }
    }
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message == 'ShowError') {
        ShowError();
    } else if (request.message == 'FindError') {
        FindError();
    } else if (request.message == 'TransWord') {
        translate(document.body);
    } else if(request.message =="findAndShowError"){
        findAndShowError();
    }
    sendResponse({ status: "running" });
    return true;
});

console.log('loaded');
document.body.onload = function () {
    const st = performance.now()
    translate(document.body)
    const dur = performance.now() - st
    console.log('translate done in ' + (dur / 1000).toFixed(4) + 's')
}