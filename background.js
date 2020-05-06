function isSupported() {
	return isJiraTab() || isZendeskTab() || isDeviceFarmTab();
}

function loadExtension() {
	if ((document.readyState === "interactive" || document.readyState === "complete")) {
		if (isSupported()) {
			addTimer();
			window.addEventListener("message", receiveMessage, false);
		}
	}
}

function receiveMessage(event) {
	var origin = event.origin || event.originalEvent.origin; // For Chrome, the origin property is in the event.originalEvent object.
	if (event.data.height) {
		document.getElementById('testfairy-iframe').height = (event.data.height) + "px";
	}
}

function addTimer() {
	if (isSupported()) {
		setTimeout(addTimer, 5000);
	}

	var testFairyFrame = document.querySelector("#testfairy-iframe");
	if (testFairyFrame) {
		return;
	}

	if (isJiraTab()) {
		addTestFairyJiraIFrame();
	}

	if (isZendeskTab()) {
		addTestFairyZendeskIFrame();
	}

	if (isDeviceFarmTab()) {
		addTestFairyDeviceFarmIFrame();
		addTestFairyInstrumentationLinksIfFound();
	}
}

////////////////////////////////// Startup

if (chrome && chrome.extension && chrome.extension.sendMessage) {
	chrome.extension.sendMessage({}, loadExtension); // Chrome
} else if (browser && browser.runtime && browser.runtime.sendMessage) {
	browser.runtime.sendMessage({}).then(loadExtension).catch(loadExtension); // Firefox (WebExtensions)
} else {
	throw new Error('TestFairy extension does not support this browser!');
}
