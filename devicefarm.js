var deviceFarmBusy = 0;

function isDeviceFarmTab() {
	if (deviceFarmBusy) {
		return;
	}

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
	if (deviceFarmBusy) {
		return;
	}

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

	// console.error('Found Sections:');
	// console.error(foundSections);

	var testCases = extractTestCases(foundSections.filesSection);

	console.error('Test Cases:');
	console.error(testCases);

	if (testCases.length <= 2) {
		return;
	}

	deviceFarmBusy = testCases.length;
	testCases.forEach(function(testCase) {
		extractSessionUrl(testCase.testFilesSection, function(sessionUrl) {
			if (sessionUrl) {
				console.error("Session url: " + sessionUrl);
			} else {
				console.error("Session url is empty");
			}

			deviceFarmBusy--;
		});
	});

	return;
}

function extractTestCases(filesSection) {
	if (!filesSection) {
		return [];
	}

	var testCases = [];
	var testCaseSections = filesSection.querySelectorAll('.adf-card > div');

	console.error(testCaseSections);

	testCaseSections.forEach(function(section) {
		var testSuiteNameHeader = section.querySelector("h5:first-child");
		var testNameHeader = section.querySelectorAll(".results-report-files h6:first-child");
		var testFiles = section.querySelectorAll(".results-report-files > ul");

		if (testFiles.length == testNameHeader.length) {
			for (var i = 0; i < testNameHeader.length; i++) {
				var name = testNameHeader[i];
				var files = testFiles[i];

				testCases.push({
					testSuiteName: testSuiteNameHeader.innerText,
					testName: name.innerText,
					testFilesSection: files
				});
			}
		}
	});

	return testCases;
}

function extractSessionUrl(testFilesSection, callback) {
	if (!testFilesSection) {
		callback();
		return;
	}

	// console.error("Test Files Section:");
	// console.error(testFilesSection);

	var logcat = Array.prototype.slice.call(testFilesSection.querySelectorAll('li > a'))
	  .filter(function (a) {
	    return a.textContent === 'Logcat';
	  })[0];

	// console.error("Logcat:");
	// console.error(logcat);

	if (!logcat) {
		callback();
		return;
	}

	// console.error("Logcat Url:");
	// console.log(logcat.href);

	httpGetAsync(logcat.href, function(logs) {
		// console.error("Fetched logcat file");

		if (!logs) {
			// console.error("Logcat is empty");
			callback();
			return;
		}

		var lines = logs.split('\n');

		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];

			var instrumentationUrlLine = 'Instrumentation session url: ';
			if (line.indexOf(instrumentationUrlLine) != -1) {
				// console.error("Found line: " + line);
				callback(line.replace(instrumentationUrlLine, ''));
				return;
			}
		}

		callback();
	});
}
