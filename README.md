#### Docs

<a href="http://river5.smallpict.com/2016/02/03/whyRiver5.html">The road to River5</a>, reviews all the previous versions of my river-of-news software going back to 1999, with a special focus on the transition from River4 to River5. 

#### Quick start for River4 users

1. Download the river5 folder from this repo.

2. Copy into that folder your lists folder from River4, and if you want, the data folder.  If you don't copy it, it will be re-created automatically.

3. In that folder: <i>npm install</i> 

4. In that folder: <i>node river5.js</i>

Let it run for a while. You should see a JS file created in your rivers sub-folder corresponding to each of the OPML files in your lists folder. 

#### To view your rivers

Go to <a href="http://localhost:1600/">http://localhost:1600/</a>.

#### Configuring

There's only one way to configure it, via the config.json file.

Look in the source for the config struct. You can override any of those values via the config.json file in your river5 folder.

The example config.json in the folder sets the max number of items in a river to 300.

#### Testing plan

For now this is only for the very adventurous developer type user. Unless you're one of the testers I'm working directly with don't ask for support until this message goes away.

#### Updates

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

