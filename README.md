# Classic WoW World Buff Client

Uploads timers to discord bot so you can check timers from your phone rather than log-in to the game or ask some one on discord to paste you a screenshot.

## How does it work?

WoW addons can not send/receive any data to network or read/write files on your PC. Addon can only interact with the world using Saved Variables. This is a file in your WTF folder
specific only for your account keeping all the addon settings. This data file is updated every time user logs out of game, switch characters or reloads the game or type /reload.
World buff client uploads current timers from lua data file generated by [Nova World Buffs Addon](https://www.curseforge.com/wow/addons/nova-world-buffs). 
This script (client) will upload timers for all known realms and factions to the [world buff server](https://github.com/techi602/wb-server). Data are being send only when client detects that file has been changed. Client is written in JavaScript and I believe for some users it will be more trustworthy rather than some EXE file. You can simply check the source code if you know some programming basics that the client does not do anything harmful.
So You have to run this script in background while you play the game. Or at least several people on the realm should have to the client running.

## Installation

Make sure you have [Nova World Buffs Addon](https://www.curseforge.com/wow/addons/nova-world-buffs) installed and enabled for your account and character! 
In order to run the client you will need [Node.js](https://nodejs.org/). You need at least version 11+. Include binaries to your PATH. Node.js requires only 50MB on your drive. Do not install any extra developer tools. You dont need it.
Node.js allows you to run programs in JavaScript to run on your computer. It is the same language like in your web browser. 
After installation open cmd.exe and type "node -v" and you should see installed version. If not try to to restart your computer.

[Download the files from this repository in ZIP archive](https://github.com/techi602/wb-client/archive/master.zip)
Uncompress the folder to your classic folder i.e.:

```bash
c:\Games\World of Warcraft\_classic_\wb-client
```

Run the script wb.cmd inside the wb-client folder 
```bash
c:\Games\World of Warcraft\_classic_\wb-client\wb.cmd
```

The script will be running in background until you close the console window.
The script should be started before you start your wow client. You can setup automatic startup using shell:startup or scheduler. 

Output should like this:

```bash
Classic World Buff Client version: 1.0.0

Looking for NovaWorldBuffs.lua file...
File found: d:\Games\World of Warcraft\_classic_\WTF\Account\12345#1\SavedVariables\NovaWorldBuffs.lua
Checking file for changes...
NWB saved variables file modified: Wed Sep 16 2020 10:10:16 GMT+0200 (Central European Summer Time)
Zandalar Tribe Horde => 
Ony Timer: no timer
Nef Timer: 17:34
Rend Timer: 12:46
Uploading payload to classic-wb-server.herokuapp.com:443...
Payload uploaded: 200
post received
```

## Issues

In case of troubles open a issue here on github
