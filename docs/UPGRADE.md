### How to upgrade to the latest version of River5

On the River5 mail list, Anton <a href="https://groups.google.com/forum/?fromgroups#!topic/river5/6vraWxnIp2A">asks</a> how to install the latest version of the River5 software on an already-running river.

1. Make a copy of the River5 folder, in case anything goes wrong. 

2. Stop the River5 app.

3. <a href="https://github.com/scripting/river5/archive/master.zip">Download</a> the newest version. 

4. Copy from the downloaded folder into the original folder, the following items. <i>lib, misc, package.json, river5.js,</i> replacing the original versions.

6. At the command line enter <i>npm install</i> to install any new packages that might be required by the new version of River5.

7. Restart the River5 app.

#### Notes

If you want to do a fresh start with the same feeds, but regenerate all the data.

1. Stop the River5 app.  

2. Delete the <i>data</i> folder. 

3. Restart the app.

If you're running River5 using <a href="https://github.com/foreverjs/forever">forever</a>, to stop the app:

1. At the command line, type <i>forever list</i> to find out what the process number is for river5.js. 

2. Type <i>forever stop 3</i> if 3 is the number. 

3. To restart, <i>cd</i> to the River5 directory and type <i>forever start river5.js</i> at the command line.

