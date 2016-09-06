chrome.extension.sendMessage({}, function(response) {

	if (document.readyState === "interactive" && isJiraTab() ) {
		
		// ruToSucses(addTestfairyIFrame);
		if (addTestfairyIFrame() == false) {
			setTimeout(addTestfairyIFrame ,5000);
		}

	}
});

function addTestfairyIFrame() {

console.log("addTestfairyIFrame ---- ");

	// Todo remove debug 
	var a  = document.querySelector("#testfairy-session__testfairy-session-web-panel")
	if (a != null ){
		a.style.display = 'none';
	}
	

	var detailsModule = document.querySelector("#details-module");
	if (detailsModule == null) {
		console.log("detailsModule not found ---- ");
		return false;
	}

	var testfairyDescriptionBlock document.querySelector("#descriptionmodule .mod-content .user-content-block a");
	if (testfairyDescriptionBlock == null) {
		return;
	}
	
	var url = testfairyDescriptionBlock.getAttribute("href");
	url = url.substring(0, url.indexOf('#')) + "?iframe";


	var parent = document.createElement('div');
	parent.setAttribute("class", "module toggle-wrap");
	var heading = document.createElement('div');
	heading.setAttribute("class", "mod-header");
	parent.appendChild(heading);
	var h2 = document.createElement('h2');
	h2.setAttribute("class", "toggle-title");
	h2.textContent = "TestFairy - chrome extension";
	heading.appendChild(h2);
	var content = document.createElement('div');
	content.setAttribute("class", "mod-content");
	parent.appendChild(content);
	var iframe = document.createElement('iframe');
	iframe.setAttribute('frameborder', '0');
	iframe.setAttribute('width', '100%');
	iframe.setAttribute('height', '918px');
	iframe.setAttribute('src', url);
	content.appendChild(iframe);

	insertAfter(parent, detailsModule);
	return true;
}

function insertAfter(elem, refElem) {
    return refElem.parentNode.insertBefore(elem, refElem.nextSibling)
}

function isJiraTab() {

	var metaTags = document.getElementsByTagName("meta");

	for (var i = 0; i < metaTags.length; i++) {
    	
    	if (metaTags[i].getAttribute('name') == 'application-name' && 
    		metaTags[i].getAttribute('content') == 'JIRA' && 
    		metaTags[i].getAttribute('data-name') == 'jira') {

    		return true;
    	}
	}

	return false;
}
