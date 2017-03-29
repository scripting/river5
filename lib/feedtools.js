  
/*  The MIT License (MIT)
	Copyright (c) 2014-2016 Dave Winer
	
	Permission is hereby granted, free of charge, to any person obtaining a copy
	of this software and associated documentation files (the "Software"), to deal
	in the Software without restriction, including without limitation the rights
	to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
	copies of the Software, and to permit persons to whom the Software is
	furnished to do so, subject to the following conditions:
	
	The above copyright notice and this permission notice shall be included in all
	copies or substantial portions of the Software.
	
	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
	IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
	FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
	AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
	LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
	OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
	SOFTWARE.
	
	structured listing: http://scripting.com/listings/feedtools.html
	*/

exports.init = init;
exports.httpRequest = handleHttpRequest; //3/24/17 by DW

var myProductName = "River5"; myVersion = "0.48e";

var fs = require ("fs");
var request = require ("request");
var http = require ("http"); 
var urlpack = require ("url");
var md5 = require ("md5");
var websocket = require ("nodejs-websocket"); 
var qs = require ("querystring");
var OpmlParser = require ("opmlparser");
var FeedParser = require ("feedparser");
var utils = require ("../lib/utils.js");

var config = {
	enabled: true,
	
	httpPort: 1337,
	flHttpEnabled: true,
	webSocketPort: 1338,
	flWebSocketEnabled: true,
	
	dataFolder: "data/",
	listsFolder: "lists/",
	riversFolder: "rivers/",
	
	localStoragePath: "localStorage.json",
	statsFilePath: "serverStats.json",
	templatePath: "misc/template.html",
	addToRiverCallbacksFolder: "callbacks/addToRiver/",
	
	riverDataFileName: "riverData.json",
	listInfoFileName: "listInfo.json",
	
	flAddItemsFromNewSubs: true,
	maxRiverItems: 250,
	maxBodyLength: 280,
	flSkipDuplicateTitles: true,
	flRequestCloudNotify: true, 
	flMaintainCalendarStructure: false,
	flWriteItemsToFiles: false,
	ctMinutesBetwBuilds: 15,
	maxConcurrentFileWrites: 100,
	remotePassword: "",
	
	flWatchAppDateChange: false,
	fnameApp: "lib/feedtools.js",
	
	urlServerHomePageSource: "http://rss2.io/code/feedtools/misc/serverhomepage.html", 
	urlDashboardSource: "http://rss2.io/code/feedtools/misc/dashboard.html",
	urlFavicon: "http://rss2.io/code/favicon.ico",
	
	notifyListenersCallback: undefined, //3/25/17 by DW
	statsChangedCallback: undefined, //3/25/17 by DW
	consoleLogCallback: undefined, //3/28/17 by DW
	
	flBuildEveryFiveSeconds: false //3/29/17 by DW
	};
var serverStats = {
	aggregator: myProductName + " v" + myVersion,
	
	ctStarts: 0,
	ctFeedReads: 0, 
	ctFeedReadsThisRun: 0,
	ctFeedReadsToday: 0,
	ctFeedReadsLastHour: 0,
	ctRiverSaves: 0, 
	ctStoriesAdded: 0,
	ctStoriesAddedThisRun: 0,
	ctStoriesAddedToday: 0,
	ctHits: 0, 
	ctHitsToday: 0, 
	ctHitsThisRun: 0,
	ctListFolderReads: 0,
	ctRssCloudUpdates: 0,
	ctLocalStorageWrites: 0,
	ctStatsSaves: 0,
	ctFeedStatsSaves: 0,
	ctRiverJsonSaves: 0,
	ctRssCloudRenews: 0,
	
	ctSecsSinceLastStart: 0,
	ctSecsSinceLastFeedReed: 0,
	
	whenFirstStart: new Date (),
	whenLastStart: new Date (0),
	whenLastFeedRead: new Date (0),
	whenLastRiverSave: new Date (0), 
	whenLastStoryAdded: new Date (0),
	whenLastListFolderRead: new Date (0),
	whenLastRssCloudUpdate: new Date (0),
	whenLastLocalStorageWrite: new Date (0),
	whenLastStatsSave: new Date (0),
	whenLastFeedStatsSave: new Date (0),
	whenLastRiverJsonSave: new Date (0),
	whenLastRssCloudRenew: new Date (0),
	
	lastFeedRead: "",
	serialnum: 0, //each new story gets an ID
	urlFeedLastCloudUpdate: "", //the last feed we got pinged about
	listNames: new Array (),
	listsThatChanged: new Array (),
	
	lastStoryAdded: new Object ()
	};
var flStatsChanged = false;
var flEveryMinuteScheduled = false;
var lastEveryMinuteHour = -1;
var origAppModDate = new Date (0);
var whenServerStart = new Date ();

function myConsoleLog (s) { //3/28/17 by DW
	if (config.consoleLogCallback !== undefined) {
		config.consoleLogCallback (s);
		}
	console.log (s);
	}
function myRequestCall (url) { //2/11/17 by DW
	var options = {
		url: url,
		jar: true,
		maxRedirects: 5,
		headers: {
			"User-Agent": myProductName + " v" + myVersion
			}
		};
	return (request (options));
	}

//files
	function readFile (relpath, callback) {
		var f = config.dataFolder + relpath;
		fsSureFilePath (f, function () {
			fs.exists (f, function (flExists) {
				if (flExists) {
					fs.readFile (f, function (err, data) {
						if (err) {
							console.log ("readFile: error reading file " + f + " == " + err.message)
							callback (undefined);
							}
						else {
							callback (data);
							}
						});
					}
				else {
					callback (undefined);
					}
				});
			});
		}
	function writeFile (relpath, data, callback) {
		var f = config.dataFolder + relpath;
		fsSureFilePath (f, function () {
			fs.writeFile (f, data, function (err) {
				if (err) {
					myConsoleLog ("writeFile: relpath == " + relpath + ", error == " + err.message);
					}
				if (callback !== undefined) {
					callback ();
					}
				});
			});
		}
	function readStats (relpath, stats, callback) {
		readFile (relpath, function (data) {
			if (data !== undefined) {
				try {
					var savedStats = JSON.parse (data.toString ());
					for (var x in savedStats) {
						stats [x] = savedStats [x];
						}
					}
				catch (err) {
					writeStats (relpath, stats); //write initial values
					}
				}
			else {
				writeStats (relpath, stats); //write initial values
				}
			if (callback !== undefined) {
				callback ();
				}
			});
		}
	function writeStats (relpath, stats, callback) {
		writeFile (relpath, utils.jsonStringify (stats), function () {
			if (callback !== undefined) {
				callback ();
				}
			});
		}
	function listFiles (folder, callback) {
		
		fsSureFilePath (folder + "xxx", function () {
			fs.readdir (folder, function (err, list) {
				if (!endsWithChar (folder, "/")) {
					folder += "/";
					}
				if (list !== undefined) { //6/4/15 by DW
					for (var i = 0; i < list.length; i++) {
						callback (folder + list [i]);
						}
					}
				callback (undefined);
				});
			});
		}
	
//file write queue
	var fileWriteQueue = new Array (), flFileWriteQueueChanged = false;
	function pushFileWriteQueue (theFile, theData) {
		fileWriteQueue [fileWriteQueue.length] = {
			f: theFile,
			jsontext: utils.jsonStringify (theData)
			};
		flFileWriteQueueChanged = true;
		}
	function checkFileWriteQueue () {
		var ct = 0;
		while (fileWriteQueue.length > 0) {
			var item = fileWriteQueue [0];
			fileWriteQueue.shift (); //remove first element
			writeFile (item.f, item.jsontext);
			if (++ct > config.maxConcurrentFileWrites) {
				break;
				}
			}
		}
//feeds array
	var feedsArray = [], flFeedsArrayChanged = false, fnameFeedsStats = "feedsStats.json";
	
	function initFeedsArrayItem (feedstats) {
		if (feedstats.description === undefined) { //5/28/14 by DW
			feedstats.description = "";
			}
		
		if (feedstats.ctReads === undefined) {
			feedstats.ctReads = 0;
			}
		if (feedstats.whenLastRead === undefined) {
			feedstats.whenLastRead = new Date (0);
			}
		
		if (feedstats.ctItems === undefined) {
			feedstats.ctItems = 0;
			}
		if (feedstats.whenLastNewItem === undefined) {
			feedstats.whenLastNewItem = new Date (0);
			}
		
		if (feedstats.ctReadErrors === undefined) {
			feedstats.ctReadErrors = 0;
			}
		if (feedstats.whenLastReadError === undefined) {
			feedstats.whenLastReadError = new Date (0);
			}
		if (feedstats.ctConsecutiveReadErrors === undefined) {
			feedstats.ctConsecutiveReadErrors = 0;
			}
		
		if (feedstats.ctTimesChosen === undefined) {
			feedstats.ctTimesChosen = 0;
			}
		if (feedstats.whenLastChosenToRead === undefined) {
			feedstats.whenLastChosenToRead = new Date (0);
			}
		
		if (feedstats.ctCloudRenew === undefined) {
			feedstats.ctCloudRenew = 0;
			}
		if (feedstats.ctCloudRenewErrors === undefined) {
			feedstats.ctCloudRenewErrors = 0;
			}
		if (feedstats.ctConsecutiveCloudRenewErrors === undefined) {
			feedstats.ctConsecutiveCloudRenewErrors = 0;
			}
		if (feedstats.whenLastCloudRenew === undefined) {
			feedstats.whenLastCloudRenew = new Date (0);
			}
		if (feedstats.whenLastCloudRenewError === undefined) {
			feedstats.whenLastCloudRenewError = new Date (0);
			}
		}
	function findInFeedsArray (urlfeed) {
		var lowerfeed = urlfeed.toLowerCase (), flfound = false, ixfeed;
		for (var i = 0; i < feedsArray.length; i++) {
			if (feedsArray [i].url.toLowerCase () == lowerfeed) {
				var feedstats = feedsArray [i];
				initFeedsArrayItem (feedstats);
				return (feedstats);
				}
			}
		return (undefined);
		}
	function addFeedToFeedsArray (urlfeed, listname) {
		var obj = {
			url: urlfeed,
			lists: []
			}
		if (listname !== undefined) {
			obj.lists [obj.lists.length] = listname;
			}
		initFeedsArrayItem (obj);
		feedsArray [feedsArray.length] = obj;
		flFeedsArrayChanged = true;
		return (obj);
		}
	function saveFeedsArray () {
		serverStats.ctFeedStatsSaves++;
		serverStats.whenLastFeedStatsSave = new Date ();
		flStatsChanged = true;
		writeStats (fnameFeedsStats, feedsArray);
		}
	function getFeedTitle (urlfeed) {
		var feedStats = findInFeedsArray (urlfeed); 
		return (feedStats.title);
		}
	
//feeds in lists object
	var feedsInLists = new Object (), flFeedsInListsChanged = false, fnameFeedsInLists = "feedsInLists.json";
	
	function atLeastOneSubscriber (urlfeed) {
		var ctsubscribers = feedsInLists [urlfeed];
		if (ctsubscribers === undefined) {
			return (false);
			}
		else {
			return (Number (ctsubscribers) > 0);
			}
		}
	function addToFeedsInLists (urlfeed) { //5/30/14 by DW
		if (feedsInLists [urlfeed] === undefined) {
			feedsInLists [urlfeed] = 1;
			}
		else {
			feedsInLists [urlfeed]++;
			}
		flFeedsInListsChanged = true;
		}
	function saveFeedsInLists () {
		writeStats (fnameFeedsInLists, feedsInLists);
		}
//feeds
	function getFolderForFeed (urlfeed) { //return path to the folder for the feed
		var s = urlfeed;
		if (utils.beginsWith (s, "http://")) {
			s = utils.stringDelete (s, 1, 7);
			}
		else {
			if (utils.beginsWith (s, "https://")) {
				s = utils.stringDelete (s, 1, 8);
				}
			}
		s = cleanFilenameForPlatform (s); 
		s = "feeds/" + s + "/";
		return (s);
		}
	function writeFeedInfoFile (feed, callback) {
		var f = getFolderForFeed (feed.prefs.url) + "feedInfo.json";
		
		feed.stats.ctInfoWrites++;
		feed.stats.whenLastInfoWrite = new Date ();
		
		writeFile (f, utils.jsonStringify (feed), function () {
			if (callback !== undefined) {
				callback ();
				}
			});
		}
	function initFeed (urlfeed, callback) {
		var f = getFolderForFeed (urlfeed) + "feedInfo.json";
		function initFeedStruct (obj) {
			//prefs
				if (obj.prefs === undefined) {
					obj.prefs = new Object ();
					}
				if (obj.prefs.enabled === undefined) {
					obj.prefs.enabled = true;
					}
				if (obj.prefs.url === undefined) {
					obj.prefs.url = urlfeed;
					}
				if (obj.prefs.ctSecsBetwRenews === undefined) {
					obj.prefs.ctSecsBetwRenews = 24 * 60 * 60; //24 hours
					}
				if (obj.prefs.flNonListSubscribe === undefined) {
					obj.prefs.flNonListSubscribe = false;
					}
			//data
				if (obj.data === undefined) {
					obj.data = new Object ();
					}
				if (obj.data.feedhash === undefined) {
					obj.data.feedhash = "";
					}
			//stats
				if (obj.stats === undefined) {
					obj.stats = new Object ();
					}
				if (obj.stats.ctReads === undefined) {
					obj.stats.ctReads = 0;
					}
				if (obj.stats.ctReadErrors === undefined) {
					obj.stats.ctReadErrors = 0;
					}
				if (obj.stats.ctConsecutiveReadErrors === undefined) {
					obj.stats.ctConsecutiveReadErrors = 0;
					}
				if (obj.stats.ctItems === undefined) {
					obj.stats.ctItems = 0;
					}
				if (obj.stats.ctEnclosures === undefined) {
					obj.stats.ctEnclosures = 0;
					}
				if (obj.stats.ctFeedTextChanges === undefined) {
					obj.stats.ctFeedTextChanges = 0;
					}
				if (obj.stats.ct304s === undefined) {
					obj.stats.ct304s = 0;
					}
				if (obj.stats.ctItemsTooOld === undefined) {
					obj.stats.ctItemsTooOld = 0;
					}
				if (obj.stats.ctReadsSkipped === undefined) {
					obj.stats.ctReadsSkipped = 0;
					}
				if (obj.stats.ctInfoReads === undefined) {
					obj.stats.ctInfoReads = 0;
					}
				if (obj.stats.ctInfoWrites === undefined) {
					obj.stats.ctInfoWrites = 0;
					}
				if (obj.stats.whenSubscribed === undefined) {
					obj.stats.whenSubscribed = new Date ();
					}
				if (obj.stats.whenLastRead === undefined) {
					obj.stats.whenLastRead = new Date (0);
					}
				if (obj.stats.whenLastNewItem === undefined) {
					obj.stats.whenLastNewItem = new Date (0);
					}
				if (obj.stats.mostRecentPubDate === undefined) {
					obj.stats.mostRecentPubDate = new Date (0);
					}
				if (obj.stats.whenLastInfoWrite === undefined) {
					obj.stats.whenLastInfoWrite = new Date (0);
					}
				if (obj.stats.whenLastReadError === undefined) {
					obj.stats.whenLastReadError = new Date (0);
					}
				if (obj.stats.whenLastInfoRead === undefined) {
					obj.stats.whenLastInfoRead = new Date (0);
					}
				if (obj.stats.lastReadError === undefined) {
					obj.stats.lastReadError = "";
					}
				if (obj.stats.itemSerialnum === undefined) {
					obj.stats.itemSerialnum = 0;
					}
				
			//feedInfo
				if (obj.feedInfo === undefined) {
					obj.feedInfo = new Object ();
					}
				if (obj.feedInfo.title === undefined) {
					obj.feedInfo.title = "";
					}
				if (obj.feedInfo.link === undefined) {
					obj.feedInfo.link = "";
					}
				if (obj.feedInfo.description === undefined) {
					obj.feedInfo.description = "";
					}
			//misc
				if (obj.history === undefined) {
					obj.history = new Array ();
					}
				if (obj.lists === undefined) {
					obj.lists = new Array ();
					}
				if (obj.calendar === undefined) {
					obj.calendar = new Object ();
					}
			}
		
		readFile (f, function (data) {
			if (data === undefined) {
				var jstruct = new Object ();
				initFeedStruct (jstruct);
				callback (jstruct);
				}
			else {
				var jstruct;
				try {
					jstruct = JSON.parse (data.toString ());
					}
				catch (err) {
					jstruct = new Object ();
					}
				initFeedStruct (jstruct);
				
				jstruct.stats.ctInfoReads++;
				jstruct.stats.whenLastInfoRead = new Date ();
				
				callback (jstruct);
				}
			});
		
		
		}
	function readFeed (urlfeed, callback) {
		var starttime = new Date ();
		var itemsInFeed = new Object (); //6/3/15 by DW
		function getItemGuid (item) {
			function ok (val) {
				if (val != undefined) {
					if (val != "null") {
						return (true);
						}
					}
				return (false);
				}
			if (ok (item.guid)) {
				return (item.guid);
				}
			var guid = "";
			if (ok (item.pubDate)) {
				guid += item.pubDate;
				}
			if (ok (item.link)) {
				guid += item.link;
				}
			if (ok (item.title)) {
				guid += item.title;
				}
			if (guid.length > 0) {
				guid = md5 (guid);
				}
			return (guid);
			}
		initFeed (urlfeed, function (feed) {
			function writeFeed () {
				feed.stats.ctSecsLastRead = utils.secondsSince (starttime);
				writeFeedInfoFile (feed);
				}
			function feedError () {
				feed.stats.ctReadErrors++;
				feed.stats.ctConsecutiveReadErrors++;
				feed.stats.whenLastReadError = starttime;
				writeFeed ();
				
				feedstats.ctReadErrors++;
				feedstats.ctConsecutiveReadErrors++;
				feedstats.whenLastReadError = starttime;
				}
			if (feed.prefs.enabled) {
				var flFirstRead = feed.stats.ctReads == 0, feedstats;
				feedstats = findInFeedsArray (urlfeed); //the in-memory feed stats, stuff the scanner uses to figure out which feed to read next
				if (feedstats === undefined) {
					feedstats = addFeedToFeedsArray (urlfeed);
					}
				//stats
					serverStats.ctFeedReads++;
					serverStats.ctFeedReadsLastHour++;
					serverStats.ctFeedReadsThisRun++;
					serverStats.ctFeedReadsToday++;
					serverStats.lastFeedRead = urlfeed;
					serverStats.whenLastFeedRead = starttime;
					
					feed.stats.ctReads++;
					feed.stats.whenLastRead = starttime;
					
					feedstats.ctReads++;
					feedstats.whenLastRead = starttime;
					
					flFeedsArrayChanged = true;
				if (utils.beginsWith (urlfeed, "feed://")) { //8/13/15 by DW
					urlfeed = "http://" + utils.stringDelete (urlfeed, 1, 7);
					}
				
				var req = myRequestCall (urlfeed);
				var feedparser = new FeedParser ();
				req.on ("response", function (res) {
					var stream = this;
					if (res.statusCode == 200) {
						stream.pipe (feedparser);
						}
					else {
						feedError ();
						}
					});
				req.on ("error", function (res) {
					feedError ();
					});
				feedparser.on ("readable", function () {
					try {
						var item = this.read (), flnew;
						if (item !== null) { //2/9/17 by DW
							if (new Date (item.pubDate) > new Date (feed.stats.mostRecentPubDate)) {
								feed.stats.mostRecentPubDate = item.pubDate;
								feedstats.mostRecentPubDate = item.pubDate;
								}
							
							//set flnew -- do the history thing
								var theGuid = getItemGuid (item);
								itemsInFeed [theGuid] = true; //6/3/15 by DW
								flnew = true;
								for (var i = 0; i < feed.history.length; i++) {
									if (feed.history [i].guid == theGuid) { //we've already seen it
										flnew = false;
										break;
										}
									}
							if (flnew) { //add to the history array
								var obj = new Object (), flAddToRiver = true;
								obj.title = item.title; 
								obj.link = item.link; 
								obj.description = getItemDescription (item);
								obj.guid = theGuid;
								obj.when = starttime;
								feed.history [feed.history.length] = obj;
								
								//stats
									feed.stats.ctItems++;
									feed.stats.whenLastNewItem = starttime;
									
									feedstats.ctItems++;
									feedstats.whenLastNewItem = starttime;
									
								
								//copy feed info from item into the feed record -- 6/1/14 by DW
									feed.feedInfo.title = item.meta.title;
									feed.feedInfo.link = item.meta.link;
									feed.feedInfo.description = item.meta.description;
								//copy cloud info, if present -- 6/3/15 by DW
									if (item.meta.cloud !== undefined) {
										if (item.meta.cloud.domain !== undefined) {
											feed.feedInfo.cloud = {
												domain: item.meta.cloud.domain,
												port: item.meta.cloud.port,
												path: item.meta.cloud.path,
												port: item.meta.cloud.port,
												registerProcedure: item.meta.cloud.registerprocedure,
												protocol: item.meta.cloud.protocol
												};
											feedstats.cloud = {
												domain: item.meta.cloud.domain,
												port: item.meta.cloud.port,
												path: item.meta.cloud.path,
												port: item.meta.cloud.port,
												registerProcedure: item.meta.cloud.registerprocedure,
												protocol: item.meta.cloud.protocol,
												};
											}
										}
								//copy feeds info from item into feeds in-memory array element -- 6/1/14 by DW
									feedstats.title = item.meta.title;
									feedstats.text = item.meta.title;
									feedstats.htmlurl = item.meta.link;
									feedstats.description = item.meta.description;
									flFeedsArrayChanged = true;
								
								//exclude items that newly appear in feed but have a too-old pubdate
									if ((item.pubDate != null) && (new Date (item.pubDate) < utils.dateYesterday (feed.stats.mostRecentPubDate)) && (!flFirstRead)) { 
										flAddToRiver = false;
										feed.stats.ctItemsTooOld++;
										feed.stats.whenLastTooOldItem = starttime;
										}
								
								if (flFirstRead) {
									if (config.flAddItemsFromNewSubs) {
										flAddToRiver = true;
										}
									else {
										flAddToRiver = false;
										}
									}
								
								if (flAddToRiver) {
									addToRiver (urlfeed, item);
									if (config.flWriteItemsToFiles) {
										var relpath = getFolderForFeed (urlfeed) + "items/" + utils.padWithZeros (feed.stats.itemSerialnum++, 3) + ".json";
										pushFileWriteQueue (relpath, utils.jsonStringify (item, true))
										}
									}
								}
							}
						}
					catch (err) {
						myConsoleLog ("readFeed: error == " + err.message);
						}
					});
				feedparser.on ("error", function () {
					feedError ();
					});
				feedparser.on ("end", function () {
					//delete items in the history array that are no longer in the feed -- 6/3/15 by DW
						var ctHistoryItemsDeleted = 0;
						for (var i = feed.history.length - 1; i >= 0; i--) { //6/3/15 by DW
							if (itemsInFeed [feed.history [i].guid] === undefined) { //it's no longer in the feed
								feed.history.splice (i, 1);
								ctHistoryItemsDeleted++;
								}
							}
						
					writeFeed ();
					if (callback !== undefined) { //6/5/15 by DW
						callback ();
						}
					});
				}
			});
		}
	function subscribeToFeed (urlfeed, listname) {
		if ((urlfeed !== undefined) && (urlfeed.length > 0)) { 
			var feedStats = findInFeedsArray (urlfeed);
			if (feedStats === undefined) { //new subscription
				addFeedToFeedsArray (urlfeed, listname);
				}
			else { //be sure this list is in its array of lists
				var fladd = true;
				for (var i = 0; i < feedStats.lists.length; i++) {
					if (feedStats.lists [i] == listname) {
						fladd = false;
						break;
						}
					}
				if (fladd) {
					feedStats.lists [feedStats.lists.length] = listname;
					flFeedsArrayChanged = true;
					}
				}
			addToFeedsInLists (urlfeed); 
			}
		}
	function findNextFeedToRead (callback) {
		var now = new Date (), whenLeastRecent = now, itemLeastRecent = undefined;
		for (var i = 0; i < feedsArray.length; i++) {
			var item = feedsArray [i];
			if (atLeastOneSubscriber (item.url)) {
				var when = new Date (item.whenLastChosenToRead);
				if (when < whenLeastRecent) {
					itemLeastRecent = item;
					whenLeastRecent = when;
					}
				}
			}
		if (itemLeastRecent !== undefined) { //at least one element in array
			if (utils.secondsSince (itemLeastRecent.whenLastChosenToRead) >= (config.ctMinutesBetwBuilds * 60)) { //ready to read
				itemLeastRecent.whenLastChosenToRead = now;
				itemLeastRecent.ctTimesChosen++;
				flFeedsArrayChanged = true;
				if (callback !== undefined) {
					callback (itemLeastRecent.url);
					}
				}
			}
		}
	function getOneFeed (urlfeed, callback) { //11/26/14 by DW
		initFeed (urlfeed, function (feed) {
			callback (feed);
			});
		}
//lists
	function listChanged (listname) {
		var flAdd = true;
		for (var i = 0; i < serverStats.listsThatChanged.length; i++) {
			if (serverStats.listsThatChanged [i] == listname) {
				flAdd = false;
				}
			}
		if (flAdd) {
			serverStats.listsThatChanged [serverStats.listsThatChanged.length] = listname;
			}
		}
	function getListFilename (listname) {
		return ("lists/" + utils.stringPopExtension (listname) + "/" + config.listInfoFileName);
		}
	function initList (name, callback) {
		var f = getListFilename (name);
		function initListStruct (obj) {
			//prefs
				if (obj.prefs == undefined) {
					obj.prefs = new Object ();
					}
				if (obj.prefs.enabled == undefined) {
					obj.prefs.enabled = true;
					}
			//stats
				if (obj.stats == undefined) {
					obj.stats = new Object ();
					}
				if (obj.stats.ctReads == undefined) {
					obj.stats.ctReads = 0;
					}
				if (obj.stats.whenLastRead == undefined) {
					obj.stats.whenLastRead = new Date (0);
					}
				if (obj.stats.whenSubscribed == undefined) {
					obj.stats.whenSubscribed = new Date ();
					}
				if (obj.stats.ctBlockedItems == undefined) {
					obj.stats.ctBlockedItems = 0;
					}
			//listInfo
				if (obj.listInfo == undefined) {
					obj.listInfo = new Object ();
					}
				if (obj.listInfo.title == undefined) {
					obj.listInfo.title = "";
					}
			//misc
				if (obj.feeds == undefined) {
					obj.feeds = new Array ();
					}
				if (obj.feedsBlocked == undefined) {
					obj.feedsBlocked = new Array ();
					}
				if (obj.calendar == undefined) {
					obj.calendar = new Object ();
					}
				if (obj.river == undefined) {
					obj.river = new Object ();
					}
			}
		readFile (f, function (data) {
			if (data === undefined) {
				var jstruct = new Object ();
				initListStruct (jstruct);
				callback (jstruct);
				}
			else {
				try {
					var jstruct = JSON.parse (data.toString ());
					initListStruct (jstruct);
					callback (jstruct);
					}
				catch (err) {
					var jstruct = new Object ();
					initListStruct (jstruct);
					callback (jstruct);
					}
				}
			});
		
		}
	function writeListInfoFile (listname, listObj, callback) {
		var f = getListFilename (listname);
		writeFile (f, utils.jsonStringify (listObj), callback);
		}
	function readIncludedList (listname, urloutline) { //6/17/14 by DW
		var req = myRequestCall (urloutline);
		var opmlparser = new OpmlParser ();
		req.on ("response", function (res) {
			var stream = this;
			if (res.statusCode == 200) {
				stream.pipe (opmlparser);
				}
			});
		req.on ("error", function (res) {
			});
		opmlparser.on ("error", function (error) {
			myConsoleLog ("readIncludedList: opml parser error == " + error.message);
			});
		opmlparser.on ("readable", function () {
			var outline;
			while (outline = this.read ()) {
				switch (outline ["#type"]) {
					case "feed":
						subscribeToFeed (outline.xmlurl, listname);
						break;
					}
				}
			});
		opmlparser.on ("end", function () {
			});
		}
	function readOneList (listname, f, callback) {
		initList (listname, function (listObj) {
			var opmlparser = new OpmlParser ();
			opmlparser.on ("error", function (error) {
				myConsoleLog ("readOneList: opml parser error == " + error.message);
				});
			opmlparser.on ("readable", function () {
				var outline;
				while (outline = this.read ()) {
					switch (outline ["#type"]) {
						case "feed":
							subscribeToFeed (outline.xmlurl, listname);
							break;
						}
					switch (outline.type) {
						case "include":
							readIncludedList (listname, outline.url);
							break;
						}
					}
				});
			opmlparser.on ("end", function () {
				writeListInfoFile (listname, listObj, function () {
					if (callback !== undefined) { 
						callback ();
						}
					});
				});
			
			fs.readFile (f, function (err, data) {
				if (err) {
					myConsoleLog ("readOneList: error reading list file == " + f + ", err.message == " + err.message);
					if (callback !== undefined) { 
						callback ();
						}
					}
				else {
					opmlparser.end (data.toString ());
					}
				});
			});
		}
	function readOneTxtList (listname, f, callback) {
		initList (listname, function (listObj) {
			fs.readFile (f, function (err, data) {
				if (err) {
					myConsoleLog ("readOneTxtList: error reading list file == " + f + ", err.message == " + err.message);
					}
				else {
					var s = data.toString (), url = "";
					for (var i = 0; i < s.length; i++) {
						switch (s [i]) {
							case "\n": case "\r": 
								if (url.length > 0) {
									subscribeToFeed (url, listname);
									url = "";
									}
								break;
							case "\t": //ignore tabs
								break;
							case " ": //spaces only significant if inside a url
								if (url.length > 0) {
									url += " ";
									}
								break;
							default: 
								url += s [i];
								break;
							}
						}
					if (url.length > 0) {
						subscribeToFeed (url, listname);
						}
					}
				if (callback !== undefined) { 
					callback ();
					}
				});
			});
		}
	function readOneJsonList (listname, f, callback) {
		initList (listname, function (listObj) {
			fs.readFile (f, function (err, data) {
				if (err) {
					myConsoleLog ("readOneJsonList: error reading list file == " + f + ", err.message == " + err.message);
					}
				else {
					try {
						var feedArray = JSON.parse (data.toString ());
						for (var i = 0; i < feedArray.length; i++) { 
							subscribeToFeed (feedArray [i], listname);
							}
						}
					catch (err) {
						myConsoleLog ("readOneJsonList: error parsing JSON list file == " + f + ", err.message == " + err.message);
						}
					}
				if (callback !== undefined) { 
					callback ();
					}
				});
			});
		}
	function loadListsFromFolder (callback) {
		var now = new Date ();
		for (var i = 0; i < feedsArray.length; i++) { //6/7/14 by DW
			feedsArray [i].lists = [];
			}
		serverStats.ctListFolderReads++;
		serverStats.whenLastListFolderRead = now;
		serverStats.listNames = new Array ();
		feedsInLists = new Object ();
		listFiles (config.listsFolder, function (f) {
			if (f === undefined) { //no more files
				flFirstListLoad = false;
				if (callback !== undefined) {
					callback ();
					}
				}
			else {
				function addListToStats (listname) {
					serverStats.listNames [serverStats.listNames.length] = listname; 
					flStatsChanged = true;
					}
				var listname = utils.stringLastField (f, "/"); //something like myList.opml
				var ext = utils.stringLower (utils.stringLastField (listname, "."));
				switch (ext) {
					case "opml":
						readOneList (listname, f);
						addListToStats (listname);
						break;
					case "txt":
						readOneTxtList (listname, f);
						addListToStats (listname);
						break;
					case "json":
						readOneJsonList (listname, f);
						addListToStats (listname);
						break;
					}
				}
			});
		}
	function getAllLists (callback) {
		var theLists = new Array ();
		function getOneFile (ix) {
			if (ix >= serverStats.listNames.length) {
				callback (theLists);
				}
			else {
				var fname = serverStats.listNames [ix], f = config.listsFolder + fname;
				fs.readFile (f, function (err, data) {
					if (err) {
						myConsoleLog ("getAllLists: error reading list " + f + " err.message == " + err.message);
						}
					else {
						theLists [theLists.length] = {
							listname: fname,
							opmltext: data.toString ()
							};
						}
					getOneFile (ix + 1);
					});
				}
			}
		getOneFile (0);
		}
	function getOneList (fname, callback) { 
		var f = config.listsFolder + fname;
		fs.readFile (f, function (err, data) {
			if (err) {
				myConsoleLog ("getOneList: f == " + f + ", err.message == " + err.message);
				callback (undefined);
				}
			else {
				callback (data.toString ());
				}
			});
		}
	function saveSubscriptionList (listname, xmltext, callback) {
		var f = config.listsFolder + listname, now = new Date ();
		fsSureFilePath (f, function () {
			fs.writeFile (f, xmltext, function (err) {
				if (err) {
					myConsoleLog ("saveSubscriptionList: f == " + f + ", err.message == " + err.message);
					}
				if (callback !== undefined) {
					callback ();
					}
				});
			});
		}
//each list's river -- 2/2/16 by DW
	var allTheRivers = new Object ();
	
	function getRiverDataFilename (listname) {
		return ("lists/" + utils.stringPopExtension (listname) + "/" + config.riverDataFileName);
		}
	function initRiverData (theData) {
		if (theData.ctRiverBuilds === undefined) {
			theData.ctRiverBuilds = 0;
			theData.flDirty = true;
			}
		if (theData.whenLastRiverBuild === undefined) {
			theData.whenLastRiverBuild = new Date (0);
			theData.flDirty = true;
			}
		}
	function getRiverData (listname, callback) {
		if (allTheRivers [listname] !== undefined) { //we already have it in memory
			if (callback !== undefined) {
				var jstruct = allTheRivers [listname];
				initRiverData (jstruct);
				callback (jstruct);
				}
			}
		else { //read it from the file into allTheRivers struct
			var f = getRiverDataFilename (listname);
			readFile (f, function (data) {
				var jstruct = {
					ctItemsAdded: 0,
					whenLastItemAdded: new Date (0),
					ctSaves: 0,
					whenLastSave: new Date (0),
					flDirty: true,
					ctRiverBuilds: 0,
					whenLastRiverBuild: new Date (0),
					items: new Array ()
					};
				if (data !== undefined) {
					try {
						jstruct = JSON.parse (data.toString ());
						}
					catch (err) {
						}
					}
				initRiverData (jstruct);
				allTheRivers [listname] = jstruct;
				if (callback !== undefined) {
					callback (allTheRivers [listname]);
					}
				});
			}
		}
	function addRiverItemToList (listname, item, callback) {
		getRiverData (listname, function (jstruct) {
			jstruct.items [jstruct.items.length] = item; //3/14/16 by DW
			if (jstruct.items.length > config.maxRiverItems) {
				jstruct.items.shift ();
				}
			jstruct.ctItemsAdded++;
			jstruct.whenLastItemAdded = new Date ();
			jstruct.flDirty = true;
			if (callback !== undefined) {
				callback ();
				}
			});
		}
	function saveChangedRiverStructs () {
		for (var x in allTheRivers) {
			var item = allTheRivers [x];
			if (item.flDirty) {
				var f = getRiverDataFilename (x);
				item.flDirty = false;
				item.ctSaves++;
				item.whenLastSave = new Date ();
				writeFile (f, utils.jsonStringify (item));
				}
			}
		}
	
	function buildOneRiver (listname, callback) { 
		var theRiver = new Object (), starttime = new Date (), ctitems = 0, titles = new Object (), ctDuplicatesSkipped = 0;
		theRiver.updatedFeeds = new Object ();
		theRiver.updatedFeeds.updatedFeed = new Array ();
		getRiverData (listname, function (myRiverData) { //an array of all the items in the river
			var lastfeedurl = undefined, theRiverFeed, flThisFeedInList = true;
			function finishBuild () {
				var jsontext;
				
				myRiverData.ctRiverBuilds++;
				myRiverData.whenLastRiverBuild = starttime;
				myRiverData.flDirty = true;
				
				theRiver.metadata = {
					name: listname,
					docs: "http://scripting.com/stories/2010/12/06/innovationRiverOfNewsInJso.html",
					secs: utils.secondsSince (starttime),
					ctBuilds: myRiverData.ctRiverBuilds,
					ctDuplicatesSkipped: ctDuplicatesSkipped,
					whenGMT: starttime.toUTCString (),
					whenLocal: starttime.toLocaleString (),
					aggregator: myProductName + " v" + myVersion
					};
				jsontext = utils.jsonStringify (theRiver, true);
				jsontext = "onGetRiverStream (" + jsontext + ")";
				var fname = utils.stringPopLastField (listname, ".") + ".js", f = config.riversFolder + fname;
				fsSureFilePath (f, function () {
					fs.writeFile (f, jsontext, function (err) {
						if (err) {
							myConsoleLog ("finishBuild: f == " + f + ", error == " + err.message);
							}
						else {
							}
						serverStats.ctRiverJsonSaves++;
						serverStats.whenLastRiverJsonSave = starttime;
						flStatsChanged = true;
						notifyWebSocketListeners ("updated " + listname);
						if (callback !== undefined) {
							callback ();
							}
						});
					});
				}
			for (var i = myRiverData.items.length - 1; i >= 0; i--) {
				var story = myRiverData.items [i], flskip = false, reducedtitle;
				if (config.flSkipDuplicateTitles) { //5/29/14 by DW
					reducedtitle = utils.trimWhitespace (utils.stringLower (story.title));
					if (reducedtitle.length > 0) { //6/6/14 by DW
						if (titles [reducedtitle] != undefined) { //duplicate
							ctDuplicatesSkipped++;
							flskip = true;
							}
						}
					}
				if (!flskip) {
					if (story.feedUrl != lastfeedurl) {
						var feedstats = findInFeedsArray (story.feedUrl);
						var ix = theRiver.updatedFeeds.updatedFeed.length;
						theRiver.updatedFeeds.updatedFeed [ix] = new Object ();
						theRiverFeed = theRiver.updatedFeeds.updatedFeed [ix];
						
						theRiverFeed.feedTitle = feedstats.title;
						theRiverFeed.feedUrl = story.feedUrl;
						theRiverFeed.websiteUrl = feedstats.htmlurl;
						//description
							if (feedstats.description == undefined) {
								theRiverFeed.feedDescription = "";
								}
							else {
								theRiverFeed.feedDescription = feedstats.description;
								}
						//whenLastUpdate -- 6/7/15 by DW
							if (story.when !== undefined) {
								theRiverFeed.whenLastUpdate = new Date (story.when).toUTCString ();
								}
							else {
								theRiverFeed.whenLastUpdate = new Date (feedstats.whenLastNewItem).toUTCString ();
								}
						theRiverFeed.item = new Array ();
						
						lastfeedurl = story.feedUrl;
						}
					
					var thePubDate = story.pubdate; //2/10/16 by DW
					if (thePubDate == null) {
						thePubDate = starttime;
						}
					
					var theItem = {
						title: story.title,
						link: story.link,
						body: story.description,
						pubDate: new Date (thePubDate).toUTCString (),
						permaLink: story.permalink
						};
					if (story.outline != undefined) { //7/16/14 by DW
						theItem.outline = story.outline;
						}
					if (story.comments.length > 0) { //6/7/14 by DW
						theItem.comments = story.comments;
						}
					//enclosure -- 5/30/14 by DW
						if (story.enclosure != undefined) {
							var flgood = true;
							
							if ((story.enclosure.type == undefined) || (story.enclosure.length === undefined)) { //both are required
								flgood = false; //sorry! :-(
								}
							else {
								if (utils.stringCountFields (story.enclosure.type, "/") < 2) { //something like "image" -- not a valid type
									flgood = false; //we read the spec, did you? :-)
									}
								}
							
							if (flgood) {
								theItem.enclosure = [story.enclosure];
								}
							}
					//id
						if (story.id == undefined) {
							theItem.id = "";
							}
						else {
							theItem.id = utils.padWithZeros (story.id, 7);
							}
					
					theRiverFeed.item [theRiverFeed.item.length] = theItem;
					
					if (config.flSkipDuplicateTitles) { //5/29/14 by DW -- add the title to the titles object
						titles [reducedtitle] = true;
						}
					}
				}
			finishBuild ();
			});
		}
	
	
//rivers
	var todaysRiver = [], flRiverChanged = false, dayRiverCovers = new Date ();
	
	function getItemDescription (item) {
		var s = item.description;
		if (s == null) {
			s = "";
			}
		s = utils.stripMarkup (s);
		s = utils.trimWhitespace (s);
		if (s.length > config.maxBodyLength) {
			s = utils.trimWhitespace (utils.maxStringLength (s, config.maxBodyLength));
			}
		return (s);
		}
	function addToRiver (urlfeed, itemFromParser, callback) {
		var now = new Date (), item = new Object ();
		//copy selected elements from the object from feedparser, into the item for the river
			function convertOutline (jstruct) { //7/16/14 by DW
				var theNewOutline = {}, atts, subs;
				if (jstruct ["source:outline"] != undefined) {
					if (jstruct ["@"] != undefined) {
						atts = jstruct ["@"];
						subs = jstruct ["source:outline"];
						}
					else {
						atts = jstruct ["source:outline"] ["@"];
						subs = jstruct ["source:outline"] ["source:outline"];
						}
					}
				else {
					atts = jstruct ["@"];
					subs = undefined;
					}
				for (var x in atts) {
					theNewOutline [x] = atts [x];
					}
				if (subs != undefined) {
					theNewOutline.subs = [];
					if (subs instanceof Array) {
						for (var i = 0; i < subs.length; i++) {
							theNewOutline.subs [i] = convertOutline (subs [i]);
							}
						}
					else {
						theNewOutline.subs = [];
						theNewOutline.subs [0] = {};
						for (var x in subs ["@"]) {
							theNewOutline.subs [0] [x] = subs ["@"] [x];
							}
						}
					}
				return (theNewOutline);
				}
			function newConvertOutline (jstruct) { //10/16/14 by DW
				var theNewOutline = {};
				if (jstruct ["@"] != undefined) {
					utils.copyScalars (jstruct ["@"], theNewOutline);
					}
				if (jstruct ["source:outline"] != undefined) {
					if (jstruct ["source:outline"] instanceof Array) {
						var theArray = jstruct ["source:outline"];
						theNewOutline.subs = [];
						for (var i = 0; i < theArray.length; i++) {
							theNewOutline.subs [theNewOutline.subs.length] = newConvertOutline (theArray [i]);
							}
						}
					else {
						theNewOutline.subs = [
							newConvertOutline (jstruct ["source:outline"])
							];
						}
					}
				return (theNewOutline);
				}
			function getString (s) {
				if (s == null) {
					s = "";
					}
				return (utils.stripMarkup (s));
				}
			function getDate (d) {
				if (d == null) {
					d = now;
					}
				return (new Date (d))
				}
			
			item.title = getString (itemFromParser.title);
			item.link = getString (itemFromParser.link);
			item.description = getItemDescription (itemFromParser);
			
			//permalink -- updated 5/30/14 by DW
				if (itemFromParser.permalink == undefined) {
					item.permalink = "";
					}
				else {
					item.permalink = itemFromParser.permalink;
					}
				
			//enclosure -- 5/30/14 by DW
				if (itemFromParser.enclosures != undefined) { //it's an array, we want the first one
					item.enclosure = itemFromParser.enclosures [0];
					}
			//source:outline -- 7/16/14 by DW
				if (itemFromParser ["source:outline"] != undefined) { //they're using a cool feature! :-)
					item.outline = newConvertOutline (itemFromParser ["source:outline"]);
					}
			item.pubdate = getDate (itemFromParser.pubDate);
			item.comments = getString (itemFromParser.comments);
			item.feedUrl = urlfeed;
			item.when = now; //6/7/15 by DW
			item.aggregator = myProductName + " v" + myVersion;
			item.id = serverStats.serialnum++; //5/28/14 by DW
		if (config.flMaintainCalendarStructure) {
			todaysRiver [todaysRiver.length] = item;
			}
		flRiverChanged = true;
		//stats
			serverStats.ctStoriesAdded++;
			serverStats.ctStoriesAddedThisRun++;
			serverStats.ctStoriesAddedToday++;
			serverStats.whenLastStoryAdded = now;
			serverStats.lastStoryAdded = item;
		//show in console
			var storyTitle = itemFromParser.title;
			if (storyTitle == null) {
				storyTitle = utils.maxStringLength (utils.stripMarkup (itemFromParser.description), 80);
				}
			myConsoleLog (getFeedTitle (urlfeed) + ": " + storyTitle);
		//add the item to each of the lists it belongs to, and mark the river as changed
			var feedstats = findInFeedsArray (urlfeed), listname;
			if (feedstats !== undefined) {
				for (var i = 0; i < feedstats.lists.length; i++) {
					listname = feedstats.lists [i];
					listChanged (listname);
					addRiverItemToList (listname, item);
					}
				}
		
		callAddToRiverCallbacks (urlfeed, itemFromParser, item); //6/19/15 by DW
		
		notifyWebSocketListeners ("item " + utils.jsonStringify (item));
		}
	function getCalendarPath (d) {
		if (d === undefined) {
			d = dayRiverCovers;
			}
		return ("calendar/" + utils.getDatePath (d, false) + ".json");
		}
	function saveTodaysRiver (callback) {
		if (config.flMaintainCalendarStructure) {
			serverStats.ctRiverSaves++;
			serverStats.whenLastRiverSave = new Date ();
			flStatsChanged = true;
			writeStats (getCalendarPath (), todaysRiver, callback);
			}
		}
	function loadTodaysRiver (callback) {
		if (config.flMaintainCalendarStructure) {
			readStats (getCalendarPath (), todaysRiver, function () {
				if (callback !== undefined) {
					callback ();
					}
				});
			}
		else {
			if (callback !== undefined) {
				callback ();
				}
			}
		}
	function checkRiverRollover () { 
		var now = new Date ();
		function roll () {
			if (config.flMaintainCalendarStructure) {
				todaysRiver = new Array (); //clear it out
				dayRiverCovers = now;
				saveTodaysRiver (); 
				}
			serverStats.ctHitsToday = 0;
			serverStats.ctFeedReadsToday = 0;
			serverStats.ctStoriesAddedToday = 0;
			flStatsChanged = true;
			}
		if (utils.secondsSince (serverStats.whenLastStoryAdded) >= 60) {
			if (!utils.sameDay (now, dayRiverCovers)) { //rollover
				if (flRiverChanged) {
					saveTodaysRiver (roll);
					}
				else {
					roll ();
					}
				}
			}
		}
	function buildChangedRivers (callback) {
		if (serverStats.listsThatChanged.length > 0) {
			var listname = serverStats.listsThatChanged.shift (), whenstart = new Date ();
			flStatsChanged = true;
			buildOneRiver (listname, function () {
				myConsoleLog ("buildChangedRivers: listname == " + listname + ", secs == " + utils.secondsSince (whenstart));
				buildChangedRivers (callback);
				});
			}
		else {
			if (callback !== undefined) {
				callback ();
				}
			}
		}
	function buildAllRivers () {
		for (var i=0; i < serverStats.listNames.length; i++) {
			listChanged (serverStats.listNames [i]);
			}
		buildChangedRivers ();
		}
	function getOneRiver (fname, callback) { 
		var name = utils.stringPopLastField (fname, "."); //get rid of .opml extension if present
		var f = config.riversFolder + name + ".js";
		fs.readFile (f, function (err, data) {
			if (err) {
				myConsoleLog ("getOneRiver: f == " + f + ", err.message == " + err.message);
				callback (undefined);
				}
			else {
				callback (data.toString ());
				}
			});
		}
//misc
	function httpReadUrl (url, callback) { //11/16/16 by DW
		request (url, function (error, response, body) {
			if (!error && (response.statusCode == 200)) {
				callback (body) 
				}
			});
		}
	function endsWithChar (s, chPossibleEndchar) {
		if ((s === undefined) || (s.length == 0)) { 
			return (false);
			}
		else {
			return (s [s.length - 1] == chPossibleEndchar);
			}
		}
	function fsSureFilePath (path, callback) { 
		var splits = path.split ("/");
		path = ""; //1/8/15 by DW
		if (splits.length > 0) {
			function doLevel (levelnum) {
				if (levelnum < (splits.length - 1)) {
					path += splits [levelnum] + "/";
					fs.exists (path, function (flExists) {
						if (flExists) {
							doLevel (levelnum + 1);
							}
						else {
							fs.mkdir (path, undefined, function () {
								doLevel (levelnum + 1);
								});
							}
						});
					}
				else {
					if (callback != undefined) {
						callback ();
						}
					}
				}
			doLevel (0);
			}
		else {
			if (callback != undefined) {
				callback ();
				}
			}
		}
	function cleanFilenameForPlatform (s) {
		switch (process.platform) {
			case "win32":
				s = utils.replaceAll (s, "/", "_");
				s = utils.replaceAll (s, "?", "_");
				s = utils.replaceAll (s, ":", "_");
				s = utils.replaceAll (s, "<", "_");
				s = utils.replaceAll (s, ">", "_");
				s = utils.replaceAll (s, "\"", "_");
				s = utils.replaceAll (s, "\\", "_");
				s = utils.replaceAll (s, "|", "_");
				s = utils.replaceAll (s, "*", "_");
				break;
			case "darwin":
				s = utils.replaceAll (s, "/", ":");
				break;
			}
		return (s);
		}
	function saveStats () {
		serverStats.ctStatsSaves++;
		serverStats.whenLastStatsSave = new Date ();
		writeStats (config.statsFilePath, serverStats);
		}
	function getFeedMetadata (url, callback) { //12/1/14 by DW
		var req = myRequestCall (url), feedparser = new FeedParser ();
		req.on ("response", function (res) {
			var stream = this;
			if (res.statusCode == 200) {
				stream.pipe (feedparser);
				}
			else {
				callback (undefined);
				}
			});
		req.on ("error", function (res) {
			callback (undefined);
			});
		feedparser.on ("readable", function () {
			var item = this.read ();
			callback (item.meta);    
			});
		feedparser.on ("end", function () {
			callback (undefined);
			});
		feedparser.on ("error", function () {
			callback (undefined);
			});
		}
//rsscloud
	function pleaseNotify (urlServer, domain, port, path, urlFeed, feedstats, callback) { //6/4/15 by DW
		var now = new Date ();
		var theRequest = {
			url: urlServer,
			followRedirect: true, 
			headers: {Accept: "application/json"},
			method: "POST",
			form: {
				port: port,
				path: path,
				url1: urlFeed,
				protocol: "http-post"
				}
			};
		
		feedstats.whenLastCloudRenew = now;
		feedstats.ctCloudRenew++;
		flFeedsArrayChanged = true; //because we modified feedstats
		
		request (theRequest, function (err, response, body) {
			function recordErrorStats () {
				feedstats.ctCloudRenewErrors++; //counts the number of communication errors
				feedstats.ctConsecutiveCloudRenewErrors++;
				feedstats.whenLastCloudRenewError = now;
				flFeedsArrayChanged = true; 
				}
			try {
				var flskip = false;
				
				if (err) {
					myConsoleLog ("pleaseNotify: urlFeed == " + urlFeed + ", err.message == " + err.message + ".");
					flskip = true;
					}
				else {
					if (!body.success) {
						myConsoleLog ("pleaseNotify: urlFeed == " + urlFeed + ", body.msg == " + body.msg + ".");
						flskip = true;
						}
					}
				
				if (flskip) {
					recordErrorStats ();
					}
				else {
					feedstats.ctConsecutiveCloudRenewErrors = 0;
					flFeedsArrayChanged = true; //because we modified feedstats
					myConsoleLog ("pleaseNotify: " + urlFeed);
					if (callback) {
						callback ();
						}
					}
				}
			catch (err) {
				myConsoleLog ("pleaseNotify: urlFeed == " + urlFeed + ", err.message == " + err.message);
				recordErrorStats ();
				}
			});
		}
	function renewNextSubscription () { //6/4/15 by DW
		if (config.flRequestCloudNotify && config.flHttpEnabled) {
			var theFeed;
			for (var i = 0; i < feedsArray.length; i++) {
				theFeed = feedsArray [i];
				if (theFeed.cloud !== undefined) {
					if (utils.secondsSince (theFeed.whenLastCloudRenew) > (23 * 60 * 60)) { //ready to be renewed
						var urlCloudServer = "http://" + theFeed.cloud.domain + ":" + theFeed.cloud.port + theFeed.cloud.path;
						
						serverStats.ctRssCloudRenews++;
						serverStats.whenLastRssCloudRenew = new Date ();
						flStatsChanged = true;
						
						pleaseNotify (urlCloudServer, undefined, config.httpPort, "/feedupdated", theFeed.url, theFeed, function () {
							});
						return; //we renew at most one each time we're called
						}
					}
				}
			}
		}
	function rssCloudFeedUpdated (urlFeed) { //6/4/15 by DW
		var feedstats = findInFeedsArray (urlFeed);
		if (feedstats === undefined) {
			myConsoleLog ("\nrssCloudFeedUpdated: url == " + urlFeed + ", but we're not subscribed to this feed, so it wasn't read.\n");
			}
		else {
			var now = new Date ();
			serverStats.whenLastRssCloudUpdate = now;
			serverStats.ctRssCloudUpdates++;
			serverStats.urlFeedLastCloudUpdate = urlFeed;
			flStatsChanged = true;
			myConsoleLog ("\nrssCloudFeedUpdated: " + urlFeed);
			readFeed (urlFeed, function () {
				});
			}
		}
//callbacks
	var localStorage = {
		};
	var lastLocalStorageJson = "";
	
	function loadLocalStorage (callback) {
		readFile (config.localStoragePath, function (data) {
			if (data !== undefined) {
				try {
					var s = data.toString ();
					localStorage = JSON.parse (s);
					lastLocalStorageJson = s; 
					}
				catch (err) {
					myConsoleLog ("loadLocalStorage: error reading localStorage == " + err.message);
					}
				}
			if (callback != undefined) {
				callback ();
				}
			});
		}
	function writeLocalStorageIfChanged () {
		var s = utils.jsonStringify (localStorage);
		if (s != lastLocalStorageJson) {
			lastLocalStorageJson = s;
			writeFile (config.localStoragePath, s);
			}
		}
	function todaysRiverChanged () { //6/21/15 by DW -- callback scripts, call this to be sure your changes get saved
		flRiverChanged = true;
		}
	function runUserScript (s, dataforscripts, scriptName) {
		try {
			if (dataforscripts !== undefined) {
				with (dataforscripts) {
					eval (s);
					}
				}
			else {
				eval (s);
				}
			}
		catch (err) {
			myConsoleLog ("runUserScript: error running \"" + scriptName + "\" == " + err.message);
			}
		}
	function runScriptsInFolder (path, dataforscripts, callback) {
		fsSureFilePath (path, function () {
			fs.readdir (path, function (err, list) {
				if (list !== undefined) { //3/29/17 by DW
					for (var i = 0; i < list.length; i++) {
						var fname = list [i];
						if (utils.endsWith (fname.toLowerCase (), ".js")) {
							var f = path + fname;
							fs.readFile (f, function (err, data) {
								if (err) {
									myConsoleLog ("runScriptsInFolder: error == " + err.message);
									}
								else {
									runUserScript (data.toString (), dataforscripts, f);
									}
								});
							}
						}
					}
				if (callback != undefined) {
					callback ();
					}
				});
			});
		}
	function callAddToRiverCallbacks (urlfeed, itemFromParser, itemFromRiver) {
		var dataforscripts = {
			urlfeed: urlfeed,
			itemFromParser: itemFromParser,
			itemFromRiver: itemFromRiver
			};
		runScriptsInFolder (config.addToRiverCallbacksFolder, dataforscripts, function () {
			});
		}
//websockets
	var theWsServer;
	
	function countOpenSockets () {
		if (theWsServer === undefined) { //12/18/15 by DW
			return (0);
			}
		else {
			return (theWsServer.connections.length);
			}
		}
	
	function notifyWebSocketListeners (s) {
		if (theWsServer !== undefined) {
			var ctUpdates = 0;
			for (var i = 0; i < theWsServer.connections.length; i++) {
				var conn = theWsServer.connections [i];
				if (conn.riverServerData !== undefined) { //it's one of ours
					try {
						conn.sendText (s);
						ctUpdates++;
						}
					catch (err) {
						}
					}
				}
			}
		if (config.notifyListenersCallback !== undefined) { //3/25/17 by DW
			config.notifyListenersCallback (s);
			}
		}
	function handleWebSocketConnection (conn) { 
		var now = new Date ();
		
		function logToConsole (conn, verb, value) {
			getDomainName (conn.socket.remoteAddress, function (theName) { //log the request
				var freemem = gigabyteString (os.freemem ()), method = "WS:" + verb, now = new Date (); 
				if (theName === undefined) {
					theName = conn.socket.remoteAddress;
					}
				myConsoleLog (now.toLocaleTimeString () + " " + freemem + " " + method + " " + value + " " + theName);
				conn.chatLogData.domain = theName; 
				});
			}
		
		conn.riverServerData = {
			whenStarted: now
			};
		conn.on ("text", function (s) {
			
			});
		conn.on ("close", function () {
			});
		conn.on ("error", function (err) {
			});
		}
	function startWebSocketServer () {
		if (config.flWebSocketEnabled) {
			if (config.webSocketPort !== undefined) { 
				myConsoleLog ("startWebSocketServer: websockets port is " + config.webSocketPort);
				try {
					theWsServer = websocket.createServer (handleWebSocketConnection);
					theWsServer.listen (config.webSocketPort);
					}
				catch (err) {
					myConsoleLog ("startWebSocketServer: err.message == " + err.message);
					}
				}
			}
		}
	
	
//http server
	function getServerStatsJson () { //3/25/17by DW
		serverStats.ctSecsSinceLastStart = utils.secondsSince (serverStats.whenLastStart); 
		serverStats.ctSecsSinceLastFeedReed = utils.secondsSince (serverStats.whenLastFeedRead); 
		return (utils.jsonStringify (serverStats, true)); 
		}
	function returnThroughTemplate (htmltext, title, callback) {
		fs.readFile (config.templatePath, function (err, data) {
			var templatetext;
			if (err) {
				myConsoleLog ("returnThroughTemplate: error reading config.templatePath == " + config.templatePath + ", err.message == " + err.message);
				templatetext = "";
				}
			else {
				templatetext = data.toString ();
				}
			var pagetable = {
				text: htmltext,
				title: title
				};
			var pagetext = utils.multipleReplaceAll (templatetext, pagetable, false, "[%", "%]");
			callback (pagetext);
			});
		}
	function viewFeedList (callback) {
		var htmltext = "", indentlevel = 0;
		function dateString (d) {
			d = new Date (d);
			return ((d.getMonth () + 1) + "/" + d.getDate ());
			}
		function add (s) {
			htmltext += utils.filledString ("\t", indentlevel) + s + "\n";
			}
		add ("<table class=\"feedTable\">"); indentlevel++;
		
		//column titles
			add ("<tr>"); indentlevel++;
			add ("<td class=\"tdFeedTitle\"><b>Title</b></td>");
			add ("<td class=\"tdFeedCt\"><b>Stories</b></td>");
			add ("<td class=\"tdFeedDate\"><b>When</b></td>");
			add ("<td class=\"tdFeedCt\"><b>Reads</b></td>");
			add ("<td class=\"tdFeedDate\"><b>When</b></td>");
			add ("</tr>"); indentlevel--;
		
		for (var i = 0; i < feedsArray.length; i++) {
			var item = feedsArray [i], title = item.title;
			var urlFeedPage = "feed?url=" + encodeURIComponent (item.url);
			//set title
				if ((title === undefined) || (title === null)) {
					title = "No title";
					}
				else {
					title = utils.maxStringLength (title, 40);
					}
			add ("<tr>"); indentlevel++;
			add ("<td class=\"tdFeedTitle\"><a href=\"" + urlFeedPage + "\">" + title + "</a></td>");
			add ("<td class=\"tdFeedCt\">" + item.ctItems + "</td>");
			add ("<td class=\"tdFeedDate\">" + dateString (item.whenLastNewItem) + "</td>");
			add ("<td class=\"tdFeedCt\">" + item.ctReads + "</td>");
			add ("<td class=\"tdFeedDate\">" + dateString (item.whenLastRead) + "</td>");
			add ("</tr>"); indentlevel--;
			}
		add ("</table>"); indentlevel--;
		returnThroughTemplate (htmltext, "Feed List", callback);
		}
	function viewFeed (urlfeed, callback) {
		initFeed (urlfeed, function (feed) {
			var htmltext = "", indentlevel = 0;
			function add (s) {
				htmltext += utils.filledString ("\t", indentlevel) + s + "\n";
				}
			function viewDate (d) {
				var s = utils.viewDate (d);
				if (s == "Wednesday, December 31, 1969") {
					return ("");
					}
				return (s);
				
				}
			function viewDescription () {
				if (feed.feedInfo.description == null) {
					return ("");
					}
				else {
					return (feed.feedInfo.description);
					}
				}
			
			add ("<div class=\"divFeedPageTop\">"); indentlevel++;
			add ("<div class=\"divFeedTitle\"><a href=\"" + feed.feedInfo.link + "\">" + feed.feedInfo.title + "</a></div>");
			add ("<div class=\"divFeedDescription\">" + viewDescription () + "</div>");
			add ("<div class=\"divFeedUrl\"><a href=\"" + feed.prefs.url + "\">" + feed.prefs.url + "</a></div>");
			add ("</div>"); indentlevel--;
			
			add ("<table class=\"feedTable\">"); indentlevel++;
			for (var i = 0; i < feed.history.length; i++) {
				var item = feed.history [i];
				add ("<tr>"); indentlevel++;
				add ("<td class=\"tdFeedTitle\"><a href=\"" + item.link + "\" title=\"" + item.description + "\">" + item.title + "</a></td>");
				add ("<td class=\"tdFeedDate\">" + utils.viewDate (item.when) + "</td>");
				add ("</tr>"); indentlevel--;
				}
			add ("</table>"); indentlevel--;
			
			feed.stats.whenSubscribed = viewDate (feed.stats.whenSubscribed);
			feed.stats.whenLastRead = viewDate (feed.stats.whenLastRead);
			feed.stats.whenLastNewItem = viewDate (feed.stats.whenLastNewItem);
			feed.stats.mostRecentPubDate = viewDate (feed.stats.mostRecentPubDate);
			feed.stats.whenLastInfoWrite = viewDate (feed.stats.whenLastInfoWrite);
			feed.stats.whenLastReadError = viewDate (feed.stats.whenLastReadError);
			feed.stats.whenLastInfoRead = viewDate (feed.stats.whenLastInfoRead);
			
			add ("<div class=\"divFeedStatsJson\"><pre>" + utils.jsonStringify (feed.stats) + "</pre></div>");
			
			returnThroughTemplate (htmltext, "Feed", callback);
			});
		}
	function configToJsonText () { //remove items whose name contains "password"
		var theCopy = new Object ();
		for (var x in config) {
			if (!utils.stringContains (x, "password")) {
				theCopy [x] = config [x];
				}
			}
		return (utils.jsonStringify (theCopy));
		}
	function handleHttpRequest (httpRequest, httpResponse) {
		function returnHtml (htmltext) {
			httpResponse.writeHead (200, {"Content-Type": "text/html"});
			httpResponse.end (htmltext);    
			}
		function returnText (theText, flAnyOrigin) {
			function getHeaders (type, flAnyOrigin) {
				var headers = {"Content-Type": type};
				if (flAnyOrigin) {
					headers ["Access-Control-Allow-Origin"] = "*";
					}
				return (headers);
				}
			httpResponse.writeHead (200, getHeaders ("text/plain", flAnyOrigin));
			httpResponse.end (theText);    
			}
		function return404 (msgIfAny) {
			function getHeaders (type) {
				var headers = {"Content-Type": type};
				return (headers);
				}
			httpResponse.writeHead (404, getHeaders ("text/plain"));
			if (msgIfAny !== undefined) {
				httpResponse.end (msgIfAny);    
				}
			else {
				httpResponse.end ("Not found");    
				}
			}
		function returnRedirect (url, code) {
			if (code === undefined) {
				code = 302;
				}
			httpResponse.writeHead (code, {"location": url, "Content-Type": "text/plain"});
			httpResponse.end (code + " REDIRECT");    
			}
			
		function returnError (message, code) {
			if (code === undefined) {
				code = 500;
				}
			httpResponse.writeHead (code, {"location": url, "Content-Type": "text/plain"});
			httpResponse.end (message);    
			}
			
		function stringMustBeFilename (s, callback) {
			if (utils.stringContains (s, "/")) {
				returnError ("Illegal file name.", 403);
				}
			else {
				callback ();
				}
			}
		function writeHead (type) {
			if (type == undefined) {
				type = "text/plain";
				}
			httpResponse.writeHead (200, {"Content-Type": type, "Access-Control-Allow-Origin": "*"});
			}
		function respondWithObject (obj) {
			writeHead ("application/json");
			httpResponse.end (utils.jsonStringify (obj));    
			}
		function returnServerHomePage () {
			request (config.urlServerHomePageSource, function (error, response, templatetext) {
				if (!error && response.statusCode == 200) {
					var pagetable = {
						config: configToJsonText (),
						version: myVersion
						};
					var pagetext = utils.multipleReplaceAll (templatetext, pagetable, false, "[%", "%]");
					returnHtml (pagetext);
					}
				});
			
			}
		try {
			var parsedUrl = urlpack.parse (httpRequest.url, true), now = new Date (), startTime = now;
			var lowerpath = parsedUrl.pathname.toLowerCase (), host, port = 80, flLocalRequest = false;
			
			//set host, port, flLocalRequest
				host = httpRequest.headers.host;
				if (utils.stringContains (host, ":")) {
					port = utils.stringNthField (host, ":", 2);
					host = utils.stringNthField (host, ":", 1);
					}
				flLocalRequest = utils.beginsWith (host, "localhost");
			//show the request on the console
				var localstring = "";
				if (flLocalRequest) {
					localstring = "* ";
					}
				myConsoleLog (localstring + httpRequest.method + " " + host + ":" + port + " " + lowerpath);
			
			//stats
				serverStats.ctHits++;
				serverStats.ctHitsToday++;
				serverStats.ctHitsThisRun++;
			switch (httpRequest.method) {
				case "GET":
					switch (lowerpath) {
						case "/": //7/4/15 by DW
							returnServerHomePage ();
							break;
						case "/version":
							returnText (myVersion);
							break;
						case "/now":
							returnText (now.toString ());    
							break;
						case "/stats": case "/serverdata":
							returnText (getServerStatsJson (), true); //11/16/16 by DW -- set flAnyOrigin boolean
							break;
						case "/feedstats":
							returnText (utils.jsonStringify (feedsArray, true));    
							break;
						case "/buildallrivers":
							if (config.enabled) {
								buildAllRivers ();
								returnText ("Your rivers are building sir or madam.");    
								}
							else {
								returnText ("Can't build the rivers because config.enabled is false.");    
								}
							break;
						case "/loadlists":
							loadListsFromFolder ();
							returnText ("We're reading the lists, right now, as we speak.");    
						case "/dashboard": 
							request (config.urlDashboardSource, function (error, response, htmltext) {
								if (!error && response.statusCode == 200) {
									returnHtml (htmltext);    
									}
								});
							break;
						case "/ping": 
							var url = parsedUrl.query.url;
							if (url === undefined) {
								returnText ("Ping received, but no url param was specified, so we couldn't do anything with it. Sorry.");    
								}
							else {
								if (findInFeedsArray (url) === undefined) {
									returnText ("Ping received, but we're not following this feed. Sorry.");    
									}
								else {
									returnText ("Ping received, will read asap.");    
									readFeed (url, function () {
										myConsoleLog ("Feed read.");
										});
									}
								}
							break;
						case "/getlistnames": //11/11/14 by DW
							httpResponse.writeHead (200, {"Content-Type": "text/plain", "Access-Control-Allow-Origin": "*"});
							httpResponse.end (utils.jsonStringify (serverStats.listNames));    
							break;
						case "/getalllists": 
							getAllLists (function (theLists) {
								returnText (utils.jsonStringify (theLists), true);
								});
							break;
						case "/getonefeed":
							getOneFeed (parsedUrl.query.url, function (theFeed) {
								returnText (utils.jsonStringify (theFeed), true);    
								});
							break;
						case "/getoneriver": //11/28/14 by DW 
							getOneRiver (parsedUrl.query.fname, function (s) {
								returnText (s, true);
								});
							break;
						case "/getonelist": //2/3/16 by DW
							var fname = parsedUrl.query.fname;
							stringMustBeFilename (fname, function () {
								getOneList (fname, function (s) {
									if (s === undefined) {
										return404 ();
										}
									else {
										returnText (s, true);
										}
									});
								});
							break;
						case "/getfeedmeta": //12/1/14 by DW -- for the list editor, just get the metadata about the feed
							httpResponse.writeHead (200, {"Content-Type": "text/plain", "Access-Control-Allow-Origin": "*"});
							getFeedMetadata (parsedUrl.query.url, function (data) {
								if (data == undefined) {
									httpResponse.end ("");    
									}
								else {
									httpResponse.end (utils.jsonStringify (data));    
									}
								});
							break;
						case "/readfile": //12/1/14 by DW
							httpResponse.writeHead (200, {"Content-Type": "text/plain", "Access-Control-Allow-Origin": "*"});
							httpReadUrl (parsedUrl.query.url, function (s) { //xxx
								if (s == undefined) {
									httpResponse.end ("");    
									}
								else {
									httpResponse.end (s);    
									}
								});
							break;
						case "/getprefs": //12/1/14 by DW
							respondWithObject (config);
							break;
						case "/feedupdated": //6/4/15 by DW
							var challenge = parsedUrl.query.challenge;
							myConsoleLog ("/feedupdated: challenge == " + challenge);
							httpResponse.writeHead (200, {"Content-Type": "text/plain"});
							httpResponse.end (challenge);    
							break;
						case "/favicon.ico": //7/19/15 by DW
							returnRedirect (config.urlFavicon);
							break;
						
						case "/feedlist": //1/27/16 by DW
							viewFeedList (function (s) {
								returnHtml (s);
								});
							break;
						case "/feed": //1/27/16 by DW
							var url = parsedUrl.query.url;
							viewFeed (url, function (s) {
								returnHtml (s);
								});
							break;
						case "/test": //1/28/16 by DW
							var theFeed = findInFeedsArray ("http://scripting.com/rss.xml");
							returnText (utils.jsonStringify (theFeed));
							
							
							
							
							
							break;
						
						default: //404 not found
							httpResponse.writeHead (404, {"Content-Type": "text/plain", "Access-Control-Allow-Origin": "*"});
							httpResponse.end ("\"" + lowerpath + "\" is not one of the endpoints defined by this server.");
						}
					break;
				case "POST": //12/2/14 by DW
					var body = "";
					httpRequest.on ("data", function (data) {
						body += data;
						});
					httpRequest.on ("end", function () {
						var flPostAllowed = false;
						
						//set flPostAllowed -- 12/4/14 by DW
							if (flLocalRequest) {
								flPostAllowed = true;
								}
							else {
								if (lowerpath == "/feedupdated") {
									flPostAllowed = true;
									}
								else {
									if (config.remotePassword.length > 0) { //must have password set
										flPostAllowed = (parsedUrl.query.password === config.remotePassword);
										}
									}
								}
						if (flPostAllowed) {
							myConsoleLog ("POST body length: " + body.length);
							switch (lowerpath) {
								case "/savelist": 
									var listname = parsedUrl.query.listname;
									stringMustBeFilename (listname, function () {
										saveSubscriptionList (listname, body);
										returnText ("", true);    
										});
									break;
								case "/feedupdated": //6/4/15 by DW
									var postbody = qs.parse (body);
									rssCloudFeedUpdated (postbody.url);
									httpResponse.writeHead (200, {"Content-Type": "text/plain"});
									httpResponse.end ("Thanks for the update! :-)");    
									break;
								default: //404 not found
									httpResponse.writeHead (404, {"Content-Type": "text/plain", "Access-Control-Allow-Origin": "*"});
									httpResponse.end ("\"" + lowerpath + "\" is not one of the endpoints defined by this server.");
								}
							}
						else {
							httpResponse.writeHead (403, {"Content-Type": "text/plain", "Access-Control-Allow-Origin": "*"});
							httpResponse.end ("This feature can only be accessed locally.");    
							}
						});
					break;
				}
			}
		catch (tryError) {
			httpResponse.writeHead (503, {"Content-Type": "text/plain", "Access-Control-Allow-Origin": "*"});
			httpResponse.end (tryError.message);    
			}
		}
	function startHttpServer () {
		if (config.flHttpEnabled) {
			try {
				http.createServer (handleHttpRequest).listen (config.httpPort);
				}
			catch (err) {
				myConsoleLog ("startHttpServer: err.message == " + err.message);
				}
			}
		}
//background processes
	function everyQuarterSecond () {
		if (config.enabled) {
			findNextFeedToRead (function (urlFeed) {
				readFeed (urlFeed, function () {
					});
				});
			}
		}
	function everySecond () {
		function checkStuff () {
			var now = new Date ();
			if (!flEveryMinuteScheduled) {
				if (now.getSeconds () == 0) {
					setInterval (everyMinute, 60000); 
					everyMinute (); //do one right now
					flEveryMinuteScheduled = true;
					}
				}
			if (config.enabled) {
				if (config.flMaintainCalendarStructure) {
					if (flRiverChanged) {
						saveTodaysRiver ();
						flRiverChanged = false;
						}
					}
				if (flStatsChanged) { 
					saveStats ();
					flStatsChanged = false;
					if (config.statsChangedCallback !== undefined) { //3/25/17 by DW
						config.statsChangedCallback (getServerStatsJson ());
						}
					}
				if (flFeedsArrayChanged) {
					saveFeedsArray ();
					flFeedsArrayChanged = false;
					}
				if (flFeedsInListsChanged) {
					flFeedsInListsChanged = false;
					saveFeedsInLists ();
					}
				if (flFileWriteQueueChanged) {
					flFileWriteQueueChanged = false;
					checkFileWriteQueue ();
					}
				}
			}
		if (config.flWatchAppDateChange) { 
			utils.getFileModDate (config.fnameApp, function (theModDate) {
				if (theModDate != origAppModDate) {
					myConsoleLog ("everySecond: " + config.fnameApp + " has been updated. " + myProductName + " is quitting now.");
					process.exit (0);
					}
				else {
					checkStuff ();
					}
				});
			}
		else {
			checkStuff ();
			}
		}
	function everyFiveSeconds () {
		if (config.enabled) {
			renewNextSubscription (); 
			writeLocalStorageIfChanged (); 
			saveChangedRiverStructs ();
			if (config.flBuildEveryFiveSeconds) { //3/29/17 by DW
				buildChangedRivers ();
				}
			}
		}
	function everyMinute () {
		var now = new Date ();
		function doConsoleMessage () {
			var ctsockets = countOpenSockets (), portmsg = "";
			if (ctsockets == 1) {
				ctsockets = ctsockets + " open socket"
				}
			else {
				ctsockets = ctsockets + " open sockets"
				}
			
			if (config.flHttpEnabled) {
				portmsg = ", port: " + config.httpPort;
				}
			
			myConsoleLog ("\n" + myProductName + " v" + myVersion + ": " + now.toLocaleTimeString () + ", " + feedsArray.length + " feeds, " + serverStats.ctFeedReadsThisRun + " reads, " + serverStats.ctStoriesAddedThisRun + " stories, " + ctsockets + portmsg + ".");
			}
		if (config.enabled) {
			buildChangedRivers (function () {
				doConsoleMessage ();
				loadListsFromFolder ();
				checkRiverRollover ();
				//check for hour rollover
					var thisHour = now.getHours ();
					if (thisHour != lastEveryMinuteHour) {
						serverStats.ctFeedReadsLastHour = 0;
						flStatsChanged = true;
						lastEveryMinuteHour = thisHour;
						}
				});
			}
		else {
			doConsoleMessage ();
			}
		}

function init (userConfig, callback) {
	var now = new Date ();
	for (x in userConfig) {
		config [x] = userConfig [x];
		}
		
	loadTodaysRiver (function () {
		readStats (config.statsFilePath, serverStats, function () {
			serverStats.aggregator = myProductName + " v" + myVersion;
			serverStats.whenLastStart = now;
			serverStats.ctStarts++;
			serverStats.ctFeedReadsThisRun = 0;
			serverStats.ctStoriesAddedThisRun = 0;
			serverStats.ctHitsThisRun = 0;
			serverStats.ctFeedReadsLastHour = 0;
			
			if (serverStats.listModDates !== undefined) {
				delete serverStats.listModDates;
				}
			if (serverStats.ctCloudRenews !== undefined) {
				delete serverStats.ctCloudRenews;
				}
			if (serverStats.ctReadsSkipped !== undefined) {
				delete serverStats.ctReadsSkipped;
				}
			if (serverStats.ctActiveThreads !== undefined) {
				delete serverStats.ctActiveThreads;
				}
			
			flStatsChanged = true;
			
			readStats (fnameFeedsStats, feedsArray, function () {
				loadListsFromFolder (function () {
					loadLocalStorage (function () {
						utils.getFileModDate (config.fnameApp, function (theDate) { //set origAppModDate
							origAppModDate = theDate;
							
							var portmsg = "";
							if (config.flHttpEnabled) {
								portmsg = " running on port " + config.httpPort;
								}
							
							myConsoleLog ("\n" + configToJsonText ()); 
							myConsoleLog ("\n" + myProductName + " v" + myVersion + portmsg + ".\n"); 
							
							setInterval (everyQuarterSecond, 250); 
							setInterval (everySecond, 1000); 
							setInterval (everyFiveSeconds, 5000); 
							startHttpServer ();
							startWebSocketServer ();
							if (callback !== undefined) {
								callback ();
								}
							});
						});
					});
				});
			});
		});
	}

