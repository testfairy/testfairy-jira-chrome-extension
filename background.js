chrome.extension.sendMessage({}, function(response) {
	if ((document.readyState === "interactive" || document.readyState === "complete") && isJiraTab()) {
		window.addEventListener("message", receiveMessage, false);
		if (!addTestfairyIFrame()) {
			setTimeout(addTestfairyIFrame, 5000);
		}
	}
});

function receiveMessage(event) {
	var origin = event.origin || event.originalEvent.origin; // For Chrome, the origin property is in the event.originalEvent object.
	if (event.data.height) {
		document.getElementById('testfairy-iframe').height = (event.data.height) + "px";
	}
}

function addTestfairyIFrame() {

	// Todo remove debug 
	var a  = document.querySelector("#testfairy-session__testfairy-session-web-panel");
	if (a != null) {
		// testfairy jira add-on found
		return true;
	}

	var detailsModule = document.querySelector("#details-module");
	if (detailsModule == null) {
		return false;
	}

	var testfairyDescriptionBlock = document.querySelector("#descriptionmodule .mod-content .user-content-block a");
	if (testfairyDescriptionBlock == null) {
		return false;
	}

	var url = testfairyDescriptionBlock.getAttribute("href");
	if (!url.includes("projects") || !url.includes("builds") || !url.includes("sessions")) {
		return false;
	}
	
	if (url.includes('#')) {
		url = url.substring(0, url.indexOf('#'));	
	}
	
	url = url + "?iframe";

	var parent = document.createElement('div');
	parent.setAttribute("class", "module toggle-wrap");
	var heading = document.createElement('div');
	heading.setAttribute("class", "mod-header");
	parent.appendChild(heading);
	var h2 = document.createElement('h2');
	h2.setAttribute("class", "toggle-title");
	h2.textContent = "TestFairy information";
	heading.appendChild(h2);
	var content = document.createElement('div');
	content.setAttribute("class", "mod-content");
	parent.appendChild(content);
	var iframe = document.createElement('iframe');
	iframe.setAttribute('id', 'testfairy-iframe');
	iframe.setAttribute('frameborder', '0');
	iframe.setAttribute('width', '100%');
	iframe.setAttribute('height', 'auto');
	iframe.setAttribute('src', url);
	content.appendChild(iframe);

	insertAfter(parent, detailsModule);
	return true;
}

function insertAfter(elem, refElem) {
    return refElem.parentNode.insertBefore(elem, refElem.nextSibling);
}

function isJiraTab() {
	var metaTags = document.getElementsByTagName("meta");

	for (var i = 0; i < metaTags.length; i++) {
		if (metaTags[i].getAttribute('name') == 'application-name' && metaTags[i].getAttribute('content') == 'JIRA' && metaTags[i].getAttribute('data-name') == 'jira') {
			return true;
		}
	}

	return false;
}

