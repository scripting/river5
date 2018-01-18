# River5

River5 is a <a href="http://scripting.com/2014/06/02/whatIsARiverOfNewsAggregator.html">river-of-news</a> RSS aggregator in JavaScript running in Node, written by <a href="http://scripting.com/liveblog/users/davewiner/2016/02/09/0995.html">Dave Winer</a>.

## How River5 works

When it starts up, River5 reads files in the <i>lists</i> folder at the top level of the River5 folder.

Each list contains a set of URLs of feeds. The list files can be straight <a href="https://github.com/scripting/river5/blob/master/lists/myTxtFeeds.txt">text</a>, a <a href="https://github.com/scripting/river5/blob/master/lists/myJsonFeeds.json">JSON</a> array of URLs of feeds, or a traditional <a href="https://github.com/scripting/river5/blob/master/lists/myOpmlFeeds.opml">OPML</a> subscription list, with extensions .txt, .json and .opml.  River5 ignores files in the lists folder that are not in one of these formats. 

The feeds pointed to from the lists can be in RSS 0.9x, 1.0 or 2.0, or Atom 1.0.

Every 15 minutes, River5 reads all the feeds you're subscribed to, and routes new items to corresponding files in the <i>rivers</i> folder at the top level of the River5 folder. You're subscribed to a feed if it appears in one or more of your lists. The river files are a <a href="http://riverjs.org/">documented</a> form of JSONP that we've been using since <a href="http://river3.opml.org/">River3</a>, in 2010.

To read the output of River5 on the machine it's running on, go to the home page. Assuming your river is running on the default port, 1337, you would go to this address to read the rivers. http://localhost:1337/. If it's running on a public server, just replace localhost with the domain name or IP address of the server. 

Pretty much everything in this narrative is configurable. 

## Requirements

A current Node.js installation. 

The machine running River5 ahould able to access the Internet.

It is possible to run the software on a non-public machine. Of course, you won't be able to access the home page remotely, or receive realtime notifications of feed updates. You'll also have to find a way to upload the output files in the rivers folder to a place where they can be accessed, if you want others to be able to access your river.

If you don't have Node.js installed on your machine, here are step by step <a href="https://github.com/scripting/river5/blob/master/docs/FORPOETS.md">instructions</a> for installing Node.js on a Macintosh. 

## How to install

1. Download the folder from the repository to your local computer. 

2. From the command line, go to this folder.

3. npm install

4. node river5.js

If it's working properly, you should see tons of stories scroll by in the console. River5 is reading each of the feeds in the lists for the first time. When you see things settle down, then you should open the home page of the RIver5 website, at http://localhost:1337/ and see the result of the first feed readings.

At first there will be a lot of old stories, but as the rivers run for hours and days and into weeks, you'll get the flow. It's a good way to read news.

## Examples of lists

I have included several files in the <i>lists</i> folder to help you get started, so something actually happens the first time you run River5. You can edit, consolidate or delete them, as you wish. 

1. <a href="https://github.com/scripting/river5/blob/master/lists/myJsonFeeds.json">myJsonFeeds.json</a> -- a list of URLs of feeds in the JSON format that River5 understands. 

2. <a href="https://github.com/scripting/river5/blob/master/lists/myOpmlFeeds.opml">myOpmlFeeds.opml</a> -- a list of URLs of feeds in the standard OPML <a href="http://dev.opml.org/spec2.html#subscriptionLists">format</a> for subscription lists.

3. <a href="https://github.com/scripting/river5/blob/master/lists/myTxtFeeds.txt">myTxtFeeds.txt</a> -- a list of URLS in a text file.

4. <a href="https://github.com/scripting/river5/blob/master/lists/nyt.opml">nyt.opml</a> -- a list of a New York Times news feeds.

5. <a href="https://github.com/scripting/river5/blob/master/lists/hn.opml">hn.opml</a> -- a list with just one feed in it, the Hacker News firehose. It's a good list for testing RIver5 because it updates so frequently.

## To view your rivers

Go to <a href="http://localhost:1337/">http://localhost:1337/</a>.

## Configuring

There's only one way to configure it, via the config.json file in the same folder as the river5.js app.

The example config.json in the folder sets the max number of items in a river to 300.

All of the config.json options and their default values are listed on <a href="https://github.com/scripting/river5/blob/master/docs/CONFIG.md">this page</a>.

## For River4 users

River5 does not support S3 storage, so if that's how you're running your rivers, you should continue to use <a href="https://github.com/scripting/river4">River4</a>.

1. If you're running out of the filesystem, then River5 can replace River4. 

2. Follow the installation instructions <a href="#how-to-install">above</a>, and before you launch river5.js, remove the files from the lists folder, and replace them with the lists from your River4 installation.

3. It will take a while before your rivers re-populate, so I recommend doing it in parallel with your existing River4 install.

You may want to review the Configuration settings page, there are options for setting new things, and in some cases the defaults have changed. 

## Where's the code?

The heart of River5 is in a Node package in the lib folder, called <a href="https://www.npmjs.com/package/davereader">davereader</a>.

To upgrade to the latest version of the software `npm update` at the command line in the river5 folder.

river5.js itsef is a very small file and by design almost never changes. 

## Examples of working rivers

1. <a href="http://podcatch.com/">Podcatch.com</a> subscribes to my friends' podcast feeds.

2. <a href="http://mlbriver.com/">mlbriver.com</a> and <a href="http://nbariver.com/">nbariver.com</a> collect news for two sports I love.

3. I have a <a href="http://scripting.com/?panel=river">River panel</a> on the Scripting News home page. 

4. My <a href="http://radio3.io/rivers/">rivers page</a> puts all the news I care about on a single tabbed page, with panels for the NYT, Washington Post, Guardian, Movies, Tech, baseball and basketball.

## Other docs

1. <a href="https://github.com/scripting/river5/blob/master/docs/ROADTORIVER5.md">The road to River5</a>, reviews  the previous versions of my river-of-news software going back to 1999, with a special focus on the transition from River4 to River5. 

2. The <a href="https://gist.github.com/scripting/87903653a0f5f6df13b4">Hello World of Rivers</a> shows you how to create a standalone river, one that people can read without accessing your RIver5 server. 

3. My <a href="http://scripting.com/liveblog/users/davewiner/2016/02/09/0995.html">blog post</a> announcing River5. 

## Updates

##### v0.50 -- 5/18/17 by DW

Major release of River5, but in a way not much changed. 

The <i>lib</i> folder is gone. The two items that were in the folder have <a href="https://www.npmjs.com/package/daveutils">been</a> <a href="https://www.npmjs.com/package/davereader">published</a> using <a href="https://www.npmjs.com/">NPM</a>, the official Node.js software distribution system. This means that they can be used in projects other than River5. 

<a href="https://github.com/scripting/river5/blob/master/river5.js">river5.js</a> has been <a href="https://github.com/scripting/river5/commit/1b19d1b61cfda43761ec7c106a1dd380f82bc0b4#diff-25e8551cb24637c32e269ed7331a2518">changed</a> to use the new version of feedtools, called <i>davereader</i> (the name feedtools was already taken). It should work exactly as before. 

This change will make new feed-based software possible. I've <a href="https://github.com/scripting/reader#story">written</a> about that on the <i>reader</i> site, and in a <a href="http://scripting.com/2017/05/18/davereaderIsTheEngineOfRiver5.html">blog post</a>. 

Otherwise the changes should be totally transparent to River5 users. The software should behave exactly as it did before. Not much actually changed, it's just been reorganized to make it more useful in more situations. 

Future updates will be logged in the <a href="https://github.com/scripting/reader#updates">Updates section</a> of the <i>reader</i> site.

To update to the new version, follow the same <a href="https://github.com/scripting/river5/blob/master/docs/UPGRADE.md">instructions</a> as for previous releases. 

##### v0.49 -- 4/18/17 by DW

Support for podcasting. New config values, described on the config docs <a href="https://github.com/scripting/river5/blob/master/docs/CONFIG.md#podcastsfolder-podcasts">page</a>.

Added <a href="https://github.com/scripting/river5/blob/master/docs/CONFIG.md#buildrivercallbacksfolder-callbacksbuildriver">buildRiver</a> callbacks. 

##### v0.48 -- 3/29/17 by DW

Changes for <a href="http://scripting.com/2017/03/28/comingSoonElectricRiver.html">Electric River</a>. Added three new callbacks to config that allow us to do things a bit more efficiently because the reading and configuring app is running in the same process as the server. Wrote a <a href="https://github.com/scripting/river5/blob/master/docs/ELECTRIC.md">howto doc</a> for people with experience running River5. Added <i>flBuildEveryFiveSeconds</i> to config, if true, we build changed rivers every five seconds instead of once a minute, the default. Building rivers became a lot more efficient in the change from River4 so it made sense to allow them to be rebuilt more frequently. 

##### v0.47 -- 2/9/17 by DW

Fixed two problems reported by Andrew Shell. Added some feeds to the default set up, and configured the default home page so it only has three panels and they have intelligent labels, using the relatively new <a href="https://github.com/scripting/river5/blob/master/docs/CONFIG.md#configuring-the-home-page">homePage</a> configuration option. Fixed a <a href="http://scripting.com/2017/02/11/cookiesInNytFeeds.html">problem</a> with NYT feeds and cookies. We now set the User-Agent header on requests. Apparently some servers won't respond unless this header is present. 

##### v0.46 -- 11/16/16 by DW

Refreshed the admin app, <a href="http://rss2.io/admin/">relocated</a> it, and fixed a couple of entry-points it depends on that didn't work with CORS. 

##### v0.45 -- 3/14/16 by DW

Fixed a bug that prevented addToRiver callbacks from working correctly. When you made a change to an item in a river it wasn't actually being reflected back in the river. 

As a result of this fix, <a href="https://github.com/scripting/river4/wiki/How-callbacks-work-in-River4">River4 callbacks</a> should now work in River5. 

##### v0.44 -- 2/22/16 by DW

Fixed a bug that prevented text file lists from working. It would only subscribe to the last feed in the list.

##### v0.43 -- 2/4/16 by DW

You can now configure the panels on the server's home page. 

The new configuration feature is documented in a <a href="https://github.com/scripting/river5/blob/master/docs/CONFIG.md#configuring-the-home-page">new section</a> on the configuration page.

##### v0.42 -- 2/4/16 by DW

We accept two new formats for files in the lists folder -- straight text and JSON, in addition to the traditional OPML subscription lists.

If a file in the lists folder has a .txt extension, we assume it's just a series of lines with the URLs of feeds. It's the simplest of all the list formats. 

If it has a .json format, we look for a JSON file that's just an array of URLs. 

Created a new top-level lists folder containing example lists in each of the three supported formats. 

##### v0.41 -- 2/3/16 by DW

We now maintain a new data structure for each list, riverData.json, in the same folder as the listInfo.json file.

It contains an array of river items that are part of this river. To build the riverjs file, all we have to do is loop over that array. 

It's kept in memory while River5 is running, so now building a river on reads a file from the disk the first time a river is built or an item is added to it. 

One of the first bennies of rebuilding the river software, it's now quite a bit faster at building rivers, and it's no longer a function of how dense the river is. In previous versions, rivers that don't update often would require us to go back a long ways into the calendar structure to build the river. 

Now the calendar structure is just an archive, it's no longer used to build anything. It could be made optional. 

## Questions, comments?

Please post a note on the <a href="https://groups.google.com/forum/?fromgroups#!forum/river5">River5</a> mail list. 

