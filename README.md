# Classic WoW World Buff Client

Uploads timers to discord bot so you can check timers from your phone rather than log-in to the game or ask some one on discord to paste you a screenshot.

## How does it work?

WoW addons can not send/receive any data to network or read/write files on your PC. Addon can only interact with the world using Saved Variables. This is a file in your WTF folder
specific only for your account keeping all the addon settings. This data file is updated every time user logs out of game, switch characters or reloads the game or type /reload.
World buff client uploads current timers from lua data file generated by [Nova World Buffs Addon](https://www.curseforge.com/wow/addons/nova-world-buffs). 
The client will upload timers for all known realms and factions to the [world buff server](https://github.com/techi602/wb-server). Data are being send only when client detects that file has been changed. Client is written in JavaScript and I believe for some users it will be more trustworthy rather than some EXE file. You can simply check the source code if you know some programming basics that the client does not do anything harmful.

## Installation

Make sure you have [Nova World Buffs Addon](https://www.curseforge.com/wow/addons/nova-world-buffs) installed. 
In order to run the client you will need [Node.js](https://nodejs.org/). Any version will do. Include binaries to your PATH. Node.js requires only 50MB on your drive. 
Node.js allows you to run programs in JavaScript to run on your computer. It is the same language like in your web browser. 
After installation open cmd.exe and type "node -v" and you should see installed version. If not try to to restart your computer.

[Download the files from this repository in ZIP archive](https://github.com/techi602/wb-client/archive/master.zip)
Uncompress the files - currently in your SavedVariables folder
c:\Games\World of Warcraft\_classic_\WTF\Account\{YOUR_ACCOUNT_ID}\SavedVariables\
The folder should already contain file NovaWorldBuffs.lua

Run the script in cmd.exe and type "node wb.js". The application will run in console until you close the console and show you current status.
The script should be started automatically before you start your wow client.

## Issues

I will simplify the installation so the script will try to detect the folder automatically and create CMD launch file / auto startup.
