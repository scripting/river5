### The Hello World of rivers

Suppose you have River5 running, generating a few riverjs files, and you want to include one in your news site or blog. That's why I put this simple example page together, to provide source code you can crib to do the job.

#### The source

Here's the <a href="https://gist.github.com/scripting/87903653a0f5f6df13b4">source</a> of an HTML page that you can crib from. 

The code on the Hello River page is yours to do with as you please. But the files it includes are copyrighted and not at this time available under an open source license. 

#### How to

Download the source for the Hello River page, and change the value of <i>urlDefaultRiver</i> to point to your river.js file. 

The other files we include, the Lora font, menus.css, are just to make the sample app look good. They aren't required for your pages.

To load a river, call httpGetRiver with the url of the River.js file as its only parameter.

The commands in the Rivers menu loads a few of the rivers that my server maintains.

