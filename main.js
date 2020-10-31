const terms = { 
    // 繁
    變量: '變數', 數組: '陣列', 對象: '物件', 對像: '物件', 代碼: '程式碼', 源碼: '原始碼', 項目: '專案', 信息: '資訊', 戰略: '策略', 程序: '程式', 數據: '資料', 可視化: '視覺化', 模塊: '模組', 字段: '欄位', 連機窗體: '線上表單', 移動: '行動', 指針: '指標', 窗口: '視窗', 智能手機: '智慧型手機', 智能: '智慧', 屏幕: '螢幕', 全屏: '全螢幕', 服務器: '伺服器', 在線: '線上', 文檔: '文件', 操作系統: '作業系統', 互聯網: '網路', 帶寬: '頻寬', 軟件: '軟體', 硬件: '硬體', 服務器: '伺服器', 筆記本: '筆記型電腦', 上網本: '小筆電', 臺式機: '桌上型電腦', 光驅: '光碟機', 硬盤: '硬碟', 內存: '記憶體', 刻錄光盤: '燒錄光碟', 鼠標: '滑鼠', 打印機: '印表機', 激光: '雷射', 攝像頭: '網路攝影機', 知識產權: '智慧財產權', 社交網站: '社群網站', 社會媒體: '社群媒體', 博客: '部落格', 論壇: '討論區', 關鍵詞: '關鍵字', 搜索引擎: '搜尋引擎', 文件管理: '檔案管理', 數據庫: '資料庫', 優化: '最佳化', 文本: '純文字檔', 設置: '設定', 查找: '查詢', 卸載: '移除', 拷貝: '複製', 視頻: '視訊', 音頻: '音訊', 短信: '簡訊', 離線: '下線', 掉線: '斷線', 重啟: '重開', 個人形象: '個人造型', 聯繫人: '聯絡人',
    自帶: '內建', 計算機: '電腦', 質量: '品質',
    // 簡
    变量: '变数', 数组: '阵列', 对象: '物件', 对像: '物件', 代码: '程式码', 源码: '原始码', 项目: '专案', 信息: '资讯', 战略: '策略', 程序: '程式', 数据: '资料', 可视化: '视觉化', 模块: '模组', 字段: '栏位', 连机窗体: '线上表单', 移动: '行动', 指针: '指标', 窗口: '视窗', 智能手机: '智慧型手机', 智能: '智慧', 屏幕: '萤幕', 全屏: '全萤幕', 服务器: '伺服器', 在线: '线上', 文档: '文件', 操作系统: '作业系统', 互联网: '网路', 带宽: '频宽', 软件: '软体', 硬件: '硬体', 服务器: '伺服器', 笔记本: '笔记型电脑', 上网本: '小笔电', 台式机: '桌上型电脑', 光驱: '光碟机', 硬盘: '硬碟', 内存: '记忆体', 刻录光盘: '烧录光碟', 鼠标: '滑鼠', 打印机: '印表机', 激光: '雷射', 摄像头: '网路摄影机', 知识产权: '智慧财产权', 社交网站: '社群网站', 社会媒体: '社群媒体', 博客: '部落格', 论坛: '讨论区', 关键词: '关键字', 搜索引擎: '搜寻引擎', 文件管理: '档案管理', 数据库: '资料库', 优化: '最佳化', 文本: '纯文字档', 设置: '设定', 查找: '查询', 卸载: '移除', 拷贝: '复制', 视频: '视讯', 音频: '音讯', 短信: '简讯', 离线: '下线', 掉线: '断线', 重启: '重开', 个人形象: '个人造型', 联系人: '联络人',
    自带: '内建', 计算机: '电脑', 质量: '品质',
}

let translated = new Set()

/**
 * 翻譯，會先爬到最底層的DOM，再翻譯該DOM的文字
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
        let res = []
        let skipUntil = 0

        forEach(original, (char, i) => {
            if (skipUntil > i) return
            if (!isChineseChar(char)) {
                skipUntil++
                return res.push(char)
            }

            let oMatch = false
            // 詞
            for (const cn in terms) {
                const tw = terms[cn]
                let iMatch = true
                // 字
                for (const o in cn) {
                    const cnChar = cn[o];
                    const j = +i + +o
                    if (original[j] !== cnChar) {
                        iMatch = false
                        break
                    }
                }
                if (iMatch) {
                    oMatch = true
                    translated.add(cn)
                    res.push(tw)
                    skipUntil += Math.max(tw.length, cn.length)
                    // 台用語較長時，把會被蓋掉的字先加上。例: 源碼123 => 原始碼23
                    if (tw.length > cn.length) {
                        for (let c = 0; c < tw.length - cn.length; c++) {
                            const char = original[+i + cn.length + c];
                            res.push(char)
                        }
                    }
                    break
                }
            }
            if (!oMatch) {
                res.push(char)
            }
            if (skipUntil < +i + 1) skipUntil = +i + 1
        })

        node.innerText = res.join('')
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

function callTranslate() {
    translated.clear()
    const st = performance.now()
    translate(document.body)
    const dur = performance.now() - st
    console.log('translate done in ' + (dur / 1000).toFixed(4) + 's')
    console.log(Array.from(translated.values()).join(','));
}

chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
    if (request.message == 'ShowError') {
        ShowError();
    } else if (request.message == 'FindError') {
        FindError();
    } else if (request.message == 'TransWord') {
        callTranslate()
    } else if(request.message =="findAndShowError"){
        findAndShowError();
    }
    sendResponse({ status: "running" });
    return true;
});

document.body.onload = callTranslate
// google翻譯時
document.addEventListener('DOMSubtreeModified', function (e) {
    if(e.target.tagName === 'HTML') {
        if(e.target.className.match('translated-ltr')) {
            // page has been translated
            setTimeout(callTranslate, 1000);
        } else {
            // page has been translated and translation was canceled
        }
   }
}, true);