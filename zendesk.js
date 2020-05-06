function isZendeskTab() {
	var metaTags = document.getElementsByTagName("meta");
	for (var i = 0; i < metaTags.length; i++) {
		var tag = metaTags[i];
		if (tag.getAttribute('name') == 'author' && tag.getAttribute('content')) {
			if (tag.getAttribute('content').toLowerCase().indexOf("zendesk") >= 0) {
				return true;
			}
		}
	}

	return false;
}

function addTestFairyZendeskIFrame() {
	var testfairyDescriptionBlock = document.querySelectorAll(".content .body a")

	if (testfairyDescriptionBlock == null || testfairyDescriptionBlock.length == 0) {
		return false;
	}

	var testFairyUrls = [];
	for (let i = 0; i < testfairyDescriptionBlock.length; i++) {
		let anchor = testfairyDescriptionBlock[i];
		var url = anchor.getAttribute("href");
		if (url.includes("projects") && url.includes("builds") && url.includes("sessions")) {
			testFairyUrls.push(anchor);
		}
	}

	if (testFairyUrls.length == 0) {
		return false;
	}

	var testfairyLink = testFairyUrls[0];
	var url = testfairyLink.getAttribute("href");
	if (url.includes('#')) {
		url = url.substring(0, url.indexOf('#'));
	}

	url = url + "?iframe";

	var detailsModule = testfairyLink.closest(".comment");
	var parent = createIFrame(url);

	insertAfter(parent, detailsModule);
	return true;
}
