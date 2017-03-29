### Electric River for River5 pros

Electric River is River5 running on the desktop, in the Electron environment. 

It makes it easier to start up, and if you don't need to run a server, that is you're keeping a river just for yourself, it's the easiest way to go long-term too. 

#### Download

To begin it's only available on the Mac. As we go forward there may be Linux and Windows versions as well.

<a href="http://rss2.io/electric/">http://rss2.io/electric/</a>

#### Getting started

To start, unzip the download, launch the app. In a few seconds you should see new items start to flow into the river, automatically. 

If you want to edit the subscription list to add your own feeds, or to remove some of the examples, choose <i>List editor</i> from the Pages menu. Click the <i>Save</i> button to save your changes. Return to the river view by choosing <i>River</i> from the same menu.

#### Lifting the hood

Choose <i>Open River5 folder</i> from the Main menu. 

What you'll <a href="http://scripting.com/2017/03/29/river5Folder.png">see</a> should look familiar to anyone who has run River5. 

It's the data from River5. It's all there. And there are a few other files storing the state of the Electric River app. 

If you add an OPML file to the lists folder, Electric River will start reading those feeds. Because inside Electric River is a copy of River5. Nothing more or less than what you download from GitHub and run on your server. 

And if you add a config.json file to this folder, as I have, you can customize RIver5 exactly as if it were running on a server. 

If you want to see the log that you would see if it were running at the command line, choose <i>JavaScript console</i> from the Window menu at the top of the screen. 

