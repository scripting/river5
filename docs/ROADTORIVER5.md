### The road to River5

River5 is the fifth major version of my River of News aggregator.

#### My.UserLand

The first was My.UserLand which co-existed with My.Netscape in 1999. These were the first two RSS feed readers, they started the market. My.UserLand evolved into My UserLand on the Desktop. It was the first software to support podcasting. 

#### Radio UserLand

Radio UserLand shipped in 2002, combining the river of news aggregator with a simple blogging tool, running in the Frontier environment on the user's desktop. So you could use the same simple software to both publish and read news items through RSS. It supported both the publishing and listening sides of podcasting. 

#### River3

River3 was a complete rewrite of the aggregator, without the UI, designed to run from a folder in Dropbox. As with all previous versions River3 ran in Frontier.

#### River4

River4 had same basic functionality of River3, but ported to Node.js. River4 was one of my first Node projects. And it was designed to run in Heroku. So I used a variety of ways to configure an app, as I learned about them. And because Heroku apps don't have a filesystem that persists, I used S3 for storage, but later added the option of using the local filesystem when we had to migrate off Heroku. 

The net result was a bit of a hairball. It works, but it was hard for me to work on it and it's hard for users to set up and configure. I felt that I could re-factor the code, and have a single way to configure it, and only use the filesystem for storage. That's River5.

#### River5

Also in Node.js, it's simplified and streamlined. It only works in the file system. There is only one way to configure it. It should be easy for me to work on so I may be able to add some of the features I've wanted to add. 

It's designed to work with an existing River4 installation. All the files by default are in the same place, but you can choose to put them elsewhere. It's fully configurable through a single JSON file in the same directory as the app. 

