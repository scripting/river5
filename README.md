### River5

River5 is a river-of-news RSS aggregator in JavaScript running in Node

#### How River5 works

When it starts up, River5 reads files in the <i>lists</i> folder at the top level of the River5 folder.

Each list contains a set of URLs of feeds. The list files can be straight text, a JSON array of URLs of feeds, or a traditional <a href="http://dev.opml.org/spec2.html#subscriptionLists">OPML</a> subscription list, with extensions .txt, .json and .opml.  River5 ignores files in the lists folder that are not in one of these formats.

The feeds pointed to from the lists can be in RSS 0.9x, 1.0 or 2.0, or Atom 1.0.

Every 15 minutes, River5 reads all the feeds you're subscribed to, and routes new items to corresponding files in the <i>rivers</i> folder at the top level of the River5 folder. You're subscribed to a feed if it appears in one or more of your lists. The river files are a <a href="http://riverjs.org/">documented</a> form of JSONP that we've been using since <a href="http://river3.opml.org/">River3</a>, in 2010.

To read the output of River5 on the machine it's running on, go to the home page. Assuming your river is running on the default port, 1337, you would go to this address to read the rivers. http://localhost:1337/. If it's running on a public server, just replace localhost with the domain name or IP address of the server. 

Pretty much everything in this narrative is configurable. 

#### Requirements

A current Node.js installation. 

The machine running River5 ahould be accessible over the Internet.

It is possible to run the software in a limited form on a non-public machine. Of course, you won't be able to access the home page remotely, or receive realtime notifications of feed updates. You'll also have to find a way to upload the output files in the rivers folder to a place where they can be accessed.

#### How to install

1. Download the folder from the repository to your local computer. 

2. From the command line, go to this folder.

3. npm install

4. node river5.js

Let it run for a few minutes, watching the messages scroll by in the console. When you see .js files show up in the rivers folder, one for each of your lists, you'll know that River5 is working. 

#### Examples

I have included several files in the <i>lists</i> folder to help you get started, so something actually happens the first time you run River5. You can edit, consolidate or delete them, as you wish. 

1. myJsonFeeds.json -- a list of URLs of feeds in the JSON format that River5 understands. 

2. myOpmlFeeds.json -- a list of URLs of feeds in the standard OPML format for subscription lists.

3. myTxtFeeds.txt -- a list of URLS in a text file.

4. nyt.opml -- a list of a New York Times news feeds.

5. hn.opml -- a list with just one feed in it, the Hacker News firehose. It's a good list for testing RIver5 because it updates so frequently.

#### To view your rivers

Go to <a href="http://localhost:1337/">http://localhost:1337/</a>.

#### Configuring

There's only one way to configure it, via the config.json file in the same folder as the river5.js app.

The example config.json in the folder sets the max number of items in a river to 300.

All of the config.json options and their default values are listed on <a href="https://github.com/scripting/river5/blob/master/docs/CONFIG.md">this page</a>.

#### For River4 users

River5 is designed to run your installation, without modifications. 

You can just replace river4.js with river5.js.

It will take a while for your rivers to repopulate because River5 does not use the calendar structure to build rivers. It has a new faster method for building rivers that happens automatically as we read the feeds. The calendar is turned off by default, but you can turn it on, if you've built apps that run off the calendar. 

#### Where's the code?

The heart of River5 is in a Node package in the lib folder, called <a href="https://github.com/scripting/river5/blob/master/lib/feedtools.js">feedtools.js</a>.

The plan is to eventually offer it through the Node.js package distribution system so we can easily include feed functionality in other apps. For right now, feedtools.js is set up just to work with river5.js. 

#### Testing plan

For now this is only for the very adventurous developer type user. Unless you're one of the testers I'm working directly with don't ask for support until this message goes away.

#### Other docs

<a href="https://github.com/scripting/river5/blob/master/docs/ROADTORIVER5.md">The road to River5</a>, reviews  the previous versions of my river-of-news software going back to 1999, with a special focus on the transition from River4 to River5. 

#### Updates

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

#### Questions, comments?

Please post a note on the <a href="https://groups.google.com/forum/?fromgroups#!forum/river5">River5</a> mail list. 

