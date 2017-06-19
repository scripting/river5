### Using Dropbox for subscription lists

Suppose you want to edit the subscription list of your River5 server through Dropbox, or Google Drive, or an equivalent service?

There's a way to do it, in fact I do it myself for my personal subscription list. 

1. In your lists folder create an OPML file. Call it whatever makes sense, perhaps mylist.opml.

2. Add one line to that file, an <a href="http://dev.opml.org/spec2.html#inclusion">include</a> node, that points to the Dropbox file you want to include. Here's an <a href="https://gist.github.com/scripting/2a123d7df5dbd6eb63668f4af38df544">example</a> of such a subscription list. 

Save it. When you want to add an item to your subscription list, just add it to the included Dropbox list. When River5 reads the list, it  automatically "goes into" includes. 

And of course the target of the include can be anywhere, it doesn't have to be in Dropbox. I actually wrote this howto for a <a href="https://github.com/scripting/river5/issues/10">developer</a> who wants to have a server app generate the list. This technique will work there too. ;-)

