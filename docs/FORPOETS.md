### River5 for poets

This is an experiment. 

Back when I was a student there was a class called Computer Science for Poets.

The idea was that even if you were an English major, programming can make sense, we just have to be careful to define our terms and explain everything. I liked the idea then and still like it now. 

So I've written a bunch of poets tutorials for things. And here's another!

#### What is River5?

It's a piece of software that reads lots of RSS feeds and combines their "flows" into a single river that you can then scan to find out what's new. If you were familiar with teletypes, that's kind of what they are like. You just read until you see something you've seen before and then go back to what you were doing. Facebook and Twitter are rivers, btw. We've been doing our rivers since before they existed! 

#### What you need

Your desktop or laptop computer is all you need. 

I'm assuming you're using a Mac though the instructions for Windows and Unix are pretty similar.

#### How to do it

1. First, <a href="https://github.com/scripting/river5/archive/master.zip">download</a> the River5 master folder. You should see a file called <i>river5-master.zip</i> in the Downloads folder.

2. Right-click on the file in the Finder, and choose Open With... and then first item should be Archive utility. Choose that option. It should create a folder called river5-master. 

3. Rename it to river5, and move it somewhere safe, the desktop, or some other folder. 

4. Open the Terminal app, in the Applications folder. You should see a black icon in the Dock. Drag the river5 folder icon onto the black icon in the Doc. It should open in its own window.

5. BTW, you're now directly accessing the Unix operating system through something called the command line. 

6. Now you're going to type four commands. The first one is: <i>sudo apt-get update</i>

7. When you do this the computer is going to ask for your system password. This is because you're doing something that requires access to the secure part of the system. 

9. sudo apt-get install nodejs

10. sudo apt-get install npm

11. sudo apt-get install nodejs-legacy

12. Congratulations you just installed Node.js. Now you're ready to run River5. To do that, enter this command: node river5.js

That's it! It should be doing its thing now, and you can follow the remaining instructions on the home page of the River5 site.

