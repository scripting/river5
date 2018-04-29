### Configuring River5

All configuration of River5 is done by adding or changing values in <i>config.json</i> in the same directory as river5.js.

The <a href="https://github.com/scripting/river5/blob/master/config.json">example</a> config.json in the folder sets the max number of items in a river to 300.

##### "enabled": true,

If false, River5 will stop reading feeds and adding new items to rivers. 

##### "httpPort": 1337,

##### "httpUserAgent": "River5",

##### "flHttpEnabled": true,

River5 has a built-in web server. It's needed for the home page which displays the rivers. If you have another way to view rivers, and want to keep your server from being accessed over the web you can turn this feature off. You can also control the User-Agent header by changing the value of httpUserAgent.

##### "webSocketPort": 1338,

##### "flWebSocketEnabled": true,

River5 also can send information back to a client using the relatively new WebSockets technology. Right now this is still somewhat experimental, so if you're not using it, you can turn it off. But it's reallly cool, and you might want to try playing with it. ;-)

Update: Here's a <a href="https://gist.github.com/scripting/4d56250e2c5235663cb2136b1f0b2516">demo app</a> that shows how to get updates from a River5 server.

##### "dataFolder": "data/",

##### "listsFolder": "lists/",

##### "riversFolder": "rivers/",

These values tell River5 where to store its data and the rivers which are the output of the app, and where to look for your feed lists, which form the input. 

You can make these full paths to any location that can be accessed through the file system. You might want to put the rivers folder, for example, in a folder that's accessible through another web server.

##### "templatePath": "misc/template.html",

For debugging, I needed to be able to see info about the feeds RIver5 is working with, so there are some HTML pages that are served by the HTTP server. This is the HTML template those pages use. 

##### "addToRiverCallbacksFolder": "callbacks/addToRiver/",

If you're using the feature that calls JavaScript code when a new item is added to a river, this is the folder where it will look for those scripts. It automatically creates that folder when the first new item is added. 

##### "buildRiverCallbacksFolder": "callbacks/buildRiver/",

This is the folder where it will look for scripts that are called whenever a river is built. Here's an <a href="https://gist.github.com/scripting/db7df50550a6481ef66bbfdd273dab68">example</a> of a script that could be put in the buildRiver callbacks folder.

##### "riverDataFileName": "riverData.json",

##### "listInfoFileName": "listInfo.json",

##### "localStoragePath": "localStorage.json",

##### "statsFilePath": "serverStats.json",

It's hard to imagine why you would want to change the names of these files that RIver5 generates internally, but you can. Have fun! :-)

##### "flAddItemsFromNewSubs": true,

If true, the first time we read a feed we will add the new items. You may want to set it false because feeds may contain a lot of old items, and reading rivers is all about new stuff. It defaults to true because we want new users to see something in their rivers when they start up the first few times.

##### "maxRiverItems": 250,

The maximum number of items in a river. The bigger it is the longer it takes to build and the longer it takes to read over the web. 

##### "maxBodyLength": 280,

We truncate the &lt;description> elements of feed items to this size. I chose 280 as the default as a result of a test we did to determine the max length of a story synopsis in the NYT feeds. We figured they put a lot of time into deciding how long to make these. Pretty much all of them would fit in 280 characters. It's also twice the current limit of tweets. This value <a href="http://scripting.com/stories/2009/06/23/if140IsTooLittleWhatsTheRi.html">feels good</a>, at least to me. ;-)

##### "flSkipDuplicateTitles": true,

Sometimes a news org might put a story in two feeds you subscribe to. Not a good idea to show you that story two (or more) times. It's a heuristic. It's possible to miss stories with this set true. But seeing duplicates sucks more, so I run it with it true. YMMV.

##### "flRequestCloudNotify": true, 

If you're running RIver5 on a non-public server, you should set this false. The notifications will not be able to find you (by design, it's a security feature). 

If it's on a public server, it enables a really cool realtime technology that's part of RSS 2.0 called rssCloud, and it's fairly widely supported among news sites, esp those running WordPress, so we support it in River5. If it's enabled and a feed supports the feature we will request notification on your behalf. If everything is working, when a new item appears in the feed, it will appear in your river in at most a minute (the interval between river builds). 

##### "flMaintainCalendarStructure": false,

All the rivers before River5 kept a structure of news items in a calendar structure. They needed this data to build rivers, but RIver5 does not. So I set this value to default to false. However you may have a use for a JSON-structured archive of news, if so, turn it on. It doesn't cost much to maintain, and it may be interesting to you.

##### "flWriteItemsToFiles": false,

This is primarily a debugging feature, it writes the items to the disk as they come to us from the FeedParser package.

##### "ctMinutesBetwBuilds": 15,

This value determines how often River5 reads all your feeds. I find that with about 1000 feeds, I can make a complete scan in a couple of minutes. You could conceivably set this value to 0, and your RIver5 would be reading feeds all the time. It's up to you. I felt 15 was a Good Netizen value. When we started doing rivers, when the net was smaller and slower, there weren't as many feeds, this value was 60. 

##### "maxConcurrentFileWrites": 100,

There's a limit to how many concurrent file writes a Node app can do. It varies from machine to machine. Almost all of them seem to be much greater than 100, so this seems conservative. 

##### "remotePassword": "",

People who use <a href="http://river4.io/">river4.io</a> to manage their server will need to set this to a non-empty value. We may at some time produce an equivalent app just for River5. 

##### "flWatchAppDateChange": false,

##### "fnameApp": "lib/feedtools.js",

These values tell River5 to quit when it notices that its main JavaScript file has changed. This is useful for me as the developer, but it's hard to imagine who else it might be useful to. 

##### "urlServerHomePageSource": "http://rss2.io/code/feedtools/misc/serverhomepage.html", 

##### "urlDashboardSource": "http://rss2.io/code/feedtools/misc/dashboard.html",

##### "urlFavicon": "http://rss2.io/code/favicon.ico",

When you access the home page of your server, River5 loads the HTML source for the home page from the address specified by urlServerHomePageSource. If you want to develop a customized home page, and you're a JavaScript programmer, you can change this value. You are welcome to use the example at that address as starter code.   

The second address is the HTML source of the dashboard, which is accessible from the home page. The third is the address of the server's favicon. 

##### "podcastsFolder": "podcasts/", 

##### "flDownloadPodcasts": true, 

##### "maxFileNameLength": 32,

##### "maxConcurrentPodcastDownloads": 10,

These config values control whether River5 downloads podcasts, where they're stored, and how the downloader works.

If you don't want River5 to download podcasts, set flDownloadPodcasts to false.

It only downloads enclosures whose type begins with "audio/".

Each feed gets its own sub-folder of the podcasts folder, so the podcasts are grouped by feed. 

It sets the date of the file to the <i>pubDate</i> of the item in the feed. 

It automatically creates the podcasts folder, so you don't have to create it yourself.

### Configuring the home page

You can  configure the tabs on the home page, so that only some of the rivers are displayed, and they have titles that you like. You configure the panels the same way you configure anything in River5, in config.json.

##### homePage

It's an object that contains a single array, with one element for each panel on your home page.

Each item in the array is an object, that has two values: <i>title</i> and <i>river</i>. 

<i>title</i> is the text you want to appear on the page for that river. It can be longer or shorter than the name of the river file. 

<i>river</i> is the name of the file in the rivers folder you want to be displayed in the panel.

You get to the home page by going to <a href="http://localhost:1337/">http://localhost:1337/</a> on the machine the server is running on. 

Here's an <a href="https://gist.github.com/scripting/b03106f660111ac7d987">example</a> of the config.json file to help tie it all together. 

