const bg = chrome.extension.getBackgroundPage();

bg.get({
    key: "context",
    callback: (args) => {
        console.log(args);
        document.write(args);
    }
});

bg.debug();