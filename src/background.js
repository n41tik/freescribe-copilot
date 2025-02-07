chrome.runtime.onInstalled.addListener((details) => {
    if (details.reason.search(/install/g) === -1) {
        return;
    }
    chrome.tabs.create({
        url: chrome.runtime.getURL("welcome.html"), active: true,
    });

    // Create a context menu item
    chrome.contextMenus.create({
        id: "freeScribeCopilot", title: "Start FreeScribe Copilot", contexts: ["page", "selection"],
    });
});

let popupWindowId = null;

async function openPopup() {
    if (popupWindowId) {
        try {
            await chrome.windows.update(popupWindowId, {focused: true});
            return;
        } catch (e) {
            console.error(e);
            popupWindowId = null;
        }
    }

    chrome.windows.create({
        url: "index.html", type: "popup", width: 400, height: 700,
    }, function (popupWindow) {
        popupWindowId = popupWindow.id;
    });
}

const action = chrome.action || chrome.browserAction;

action.onClicked.addListener((tab) => {
    openPopup();
});

chrome.windows.onRemoved.addListener((windowId) => {
    if (windowId === popupWindowId) {
        popupWindowId = null;
    }
});

// Handle context menu item click
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === "freeScribeCopilot") {
        openPopup();
    }
});

chrome.commands.onCommand.addListener((command) => {
    switch (command) {
        case "configure":
            chrome.runtime.openOptionsPage?.() || window.open(chrome.runtime.getURL("options.html"));
            break;
        default:
            chrome.runtime.sendMessage({action: command});
            break;
    }
});