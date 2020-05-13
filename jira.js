function isJiraTab() {
	var metaTags = document.getElementsByTagName("meta");

	for (var i = 0; i < metaTags.length; i++) {
		if (metaTags[i].getAttribute('name') == 'application-name' && metaTags[i].getAttribute('content') == 'JIRA' && metaTags[i].getAttribute('data-name') == 'jira') {
			return true;
		}
	}

	return false;
}

function addTestFairyJiraIFrame() {
	// Todo remove debug
	var a  = document.querySelector("#testfairy-session__testfairy-session-web-panel");
	if (a != null) {
		// testfairy jira add-on found
		return true;
	}

	// Works for JIRA servers
	var testfairyDescriptionBlock = document.querySelector("#descriptionmodule .mod-content .user-content-block a");

	// Works for JIRA cloud
	testfairyDescriptionBlock = testfairyDescriptionBlock || document.querySelector("div[data-test-id='issue.views.field.rich-text.description'] a");

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

	// Works for JIRA servers
	var detailsModule = document.querySelector("#details-module");

	// Works for JIRA cloud
	detailsModule = detailsModule || testfairyDescriptionBlock.closest("div");
	if (detailsModule == null) {
		return false;
	}

	var parent = createIFrame(url, 'testfairy-iframe', 'TestFairy Information');

	insertAfter(parent, detailsModule);
	return true;
}
