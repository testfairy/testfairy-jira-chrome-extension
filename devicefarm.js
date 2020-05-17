// atomic counter for pending ajax calls, used to block periodic timer for extension racing with existing uncomplete processing
var deviceFarmBusy = 0;

// string set for already checked session, used to avoid injecting html elements twice for a test case
var alreadyCheckedSessions = {
	__lastLocation: ''
};

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

		return deviceFarmPathFound && userLoggedIn && userIdVisible;
	} catch (error) {
		console.error(error);
		return false;
	}
}

function addTestFairyDeviceFarmIFrame() {
	if (deviceFarmBusy) {
		// there is an ongoing processing being done, skip this call and give more time for the previous attempt
		return;
	}

	var logsHeader = document.querySelector("#logs-header");
	if (!logsHeader) {
		// if device farm didn't record logcat, we can't do anything
		return;
	}

	if (document.location.href !== alreadyCheckedSessions.__lastLocation) {
		alreadyCheckedSessions = {
			__lastLocation: document.location.href
		};
	}

	var modal = injectModal();

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

	var testCases = extractTestCases(foundSections.filesSection);

	deviceFarmBusy = testCases.length;
	testCases.forEach(function(testCase) {
		/*
		Structure of `testCase`:

		{
			testSuiteName: string
			testName: string,
			testFilesSection: DOMElement of <ul></ul> of <a></a> elements
		}
		*/
		extractSessionUrl(testCase.testFilesSection, function(sessionUrl, exceptionFound) {
			var testCanonicalName = testCase.testSuiteName + "." + testCase.testName;

			if (sessionUrl && !alreadyCheckedSessions[testCanonicalName]) {
				console.error("Session url for " + testCanonicalName + ": " + sessionUrl);
				addSessionLinkToSection(modal, testCase, sessionUrl, exceptionFound);
			}

			alreadyCheckedSessions[testCanonicalName] = true;
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

	testCaseSections.forEach(function(section) {
		// Device Farm has 3 types of details pages:
		//
		// 1. Instrumentation page (has links to test suites)
		// 2. Single test suite page (has links to test cases)
		// 3. Single test case page (has a single link to test output files)
		//
		// This section parser can handle all three cases by checking the selectors below
		var testSuiteNameHeader = section.querySelector("h5:first-child");  // if this is null, we are in single test suite details page
		var testNameHeader = section.querySelectorAll(".results-report-files h6:first-child"); // if this is null, we are in single test suite's single case results page
		var testFiles = section.querySelectorAll(".results-report-files > ul"); // this is always non-empty otherwise we die

		if (testFiles.length === 0) {
			return;
		}

		for (var i = 0; i < testNameHeader.length; i++) {
			var name = testNameHeader[i];
			var files = testFiles[i];

			/*
			Structure of `testCase`:

			{
				testSuiteName: string
				testName: string,
				testFilesSection: DOMElement of <ul></ul> of <a></a> elements
			}
			*/
			testCases.push({
				testSuiteName: testSuiteNameHeader ? testSuiteNameHeader.innerText : '',
				testName: name ? name.innerText : '',
				testFilesSection: files
			});
		}

		if (!testSuiteNameHeader && testNameHeader.length === 0 && testFiles.length === 1) {
			// we are in single test suite's single case results page

			/*
			Structure of `testCase`:

			{
				testSuiteName: string
				testName: string,
				testFilesSection: DOMElement of <ul></ul> of <a></a> elements
			}
			*/
			testCases.push({
				testSuiteName: '',
				testName: '',
				testFilesSection: testFiles[0]
			});
		}
	});

	return testCases;
}

function extractSessionUrl(testFilesSection, callback) {
	if (!testFilesSection) {
		callback();
		return;
	}

	var logcat = Array.prototype.slice.call(testFilesSection.querySelectorAll('li > a'))
	  .filter(function (a) {
	    return a.textContent === 'Logcat';
	  })[0];

	if (!logcat) {
		// if device farm didn't record logcat, we can't do anything
		callback();
		return;
	}

	var testFairySession = Array.prototype.slice.call(testFilesSection.querySelectorAll('li > a'))
	  .filter(function (a) {
	    return a.textContent === 'TestFairy Session';
	  })[0];

	if (testFairySession) {
		// if we already injected a <a>TestFairy Session</a>, we can skip
		callback();
		return;
	}

	// Fetch and parse logcat to detect session urls
	httpGetAsync(logcat.href, function(logs) {
		if (!logs) {
			// if logcat file is empty or unavailable, there is no hope
			callback();
			return;
		}

		var lines = logs.split('\n');
		var sessionUrl = null;
		var exceptionFound = false;
		for (var i = 0; i < lines.length; i++) {
			var line = lines[i];

			// This line must match with these:
			// https://github.com/testfairy-blog/TestFairyInstrumentationExamples/blob/master/app/src/androidTest/java/com/testfairy/instrumentation/utils/TestFairyInstrumentationUtil.java#L139
			// https://github.com/testfairy-blog/TestFairyInstrumentationExamples/blob/master/app/src/androidTest/java/com/testfairy/instrumentation/utils/TestFairyInstrumentationUtil.java#L151
			var instrumentationUrlLine = 'Instrumentation session url:';
			var exceptionLine = 'TestFairy detected an exception:';

			var instrumentationUrlLineIndex = line.indexOf(instrumentationUrlLine);
			if (instrumentationUrlLineIndex !== -1) {
				sessionUrl = line.slice(instrumentationUrlLineIndex + instrumentationUrlLine.length).trim();
			}

			var exceptionLineIndex = line.indexOf(exceptionLine);
			if (exceptionLineIndex !== -1) {
				exceptionFound = true;
			}
		}

		callback(sessionUrl, exceptionFound);
	});
}

function addSessionLinkToSection(modal, testCase, sessionUrl, exceptionFound) {
	/*
	Structure of `testCase`:

	{
		testSuiteName: string
		testName: string,
		testFilesSection: DOMElement of <ul></ul> of <a></a> elements
	}
	*/
	var testCanonicalName = testCase.testSuiteName + "." + testCase.testName;
	// console.error("Injecting TestFairy Session url into files section for " + testCanonicalName);

	var sessionLink = createA("TestFairy Session", sessionUrl);
	testCase.testFilesSection.appendChild(createLi(sessionLink));

  // // The code below showcases how to convert a link into a modal popup with iFrame
	// sessionLink.onclick = function(e) {
	// 	e.preventDefault();
	// 	modal.show();
	// 	modal.clear();
	//
	// 	var iFrame = createIFrame(sessionUrl + "?iframe", 'testfairy-iframe', 'TestFairy Session', '100%', 'auto', 'scroll !important');
	// 	modal.addContent(iFrame);
	//
	// 	modal.element.onclick = function(e) {
	// 		e.preventDefault();
	// 		modal.hide();
	// 		modal.element.onclick = undefined;
	// 	};
	// }

	if (exceptionFound) {
		var throwablesUrl = sessionUrl + "/minimal?widget=throwables";
		testCase.testFilesSection.appendChild(createLiWithText('-'));
		// testCase.testFilesSection.appendChild(createLi(createA('Stacktrace', throwablesUrl)));
		testCase.testFilesSection.appendChild(createLi(createIFrame(throwablesUrl, null, null, '100%', 'auto', 'scroll !important')));

		var sectionContainer = testCase.testFilesSection.parentElement.parentElement;
		sectionContainer.setAttribute('class', sectionContainer.getAttribute('class').replace('large-4', 'large-12'));
		sectionContainer.setAttribute('class', sectionContainer.getAttribute('class').replace('large-3', 'large-12'));
		sectionContainer.parentElement.setAttribute('class', sectionContainer.parentElement.getAttribute('class').replace('large-4', 'large-12'));
	}
}
