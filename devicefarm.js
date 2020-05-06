function isDeviceFarmTab() {
	try {
		var metaTags = document.getElementsByTagName("meta");

		var deviceFarmPathFound = window.location.pathname === "/devicefarm/home";
		var userLoggedIn = false;
		var userIdVisible = false;

		for (var i = 0; i < metaTags.length; i++) {
			var tag = metaTags[i];

			if (
				tag.getAttribute('name') === 'adf-user-fullName' &&
				tag.getAttribute('content').length > 0
			) {
				userLoggedIn = true;
			}

			if (
				tag.getAttribute('name') === 'adf-user-accountId' &&
				tag.getAttribute('content').length > 0 &&
				!isNaN(parseInt(tag.getAttribute('content'))) &&
				parseInt(tag.getAttribute('content')) > 0
			) {
				userIdVisible = true;
			}
		}

		var found = deviceFarmPathFound && userLoggedIn && userIdVisible;

		// console.error("Found: " + found);

		return found;
	} catch (error) {
		console.error(error);
		return false;
	}
}

function addTestFairyDeviceFarmIFrame() {
	var logsHeader = document.querySelector("#logs-header");
	if (!logsHeader) {
		return;
	}

	var sectionsParent = document.querySelectorAll("#logs-header")[0].parentElement.parentElement.parentElement.parentElement;
	var sections = sectionsParent.querySelectorAll(".results-report-section");
	var foundSections = {
		logsSection: logsHeader.parentElement
	};

	sections.forEach(function(section) {
		switch (section.getAttribute('ui-view')) {
			case 'report-files':
				foundSections.filesSection = section;
				break;
		}
	});

	console.error('Found Sections:')
	console.error(foundSections);

	var testCases = extractTestCases(foundSections.filesSection);

	// TODO : Convert this to async forEach
	var sessions = extractSessionUrl(testCases[0].testFilesSection);

	console.error('Test Cases:')
	console.error(testCases);

	console.error('Sessions:')
	console.error(sessions);

	return false;
}

function extractTestCases(filesSection) {
	if (!filesSection) {
		return [];
	}

	var testCases = [];
	var testCaseSections = filesSection.querySelectorAll('.adf-card');

	testCaseSections.forEach(function(section) {
		var testSuiteNameHeader = section.querySelector("h5:first-child");
		var testNameHeader = section.parentElement.querySelector(".results-report-files h6:first-child");
		var testFiles = section.parentElement.querySelector(".results-report-files > ul");

		testCases.push({
			testSuiteName: testSuiteNameHeader.innerText,
			testName: testNameHeader.innerText,
			testFilesSection: testFiles
		});
	});

	return testCases;
}

function extractSessionUrl(testFilesSection) {
	if (!testFilesSection) {
		return;
	}

	console.error("Test Files Section:");
	console.error(testFilesSection);

	var logcat = Array.prototype.slice.call(testFilesSection.querySelectorAll('li > a'))
	  .filter(function (a) {
	    return a.textContent === 'Logcat';
	  })[0];

	console.error("Logcat:");
	console.error(logcat);

	if (!logcat) {
		return;
	}

	console.error("Logcat Url:");
	console.log(logcat.href);

	httpGetAsync(logcat.href, function(logs) {
		console.error(logs);
		// TODO : Traverse file to extract session url
	});

	return "";
}

function addTestFairyInstrumentationLinksIfFound() {
	return false;
}
