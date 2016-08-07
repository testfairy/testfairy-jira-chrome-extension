chrome.tabs.onUpdated.addListener( function (tabId, changeInfo, tab) {
	if (changeInfo.status == 'complete') {
		chrome.tabs.executeScript({
			code: '$("body").css("background-color", "blue"); alert("x");'
		}); 
	}
});
