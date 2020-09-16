const fs = require('fs').promises;
const https = require('https')

const { resolve } = require('path');
const { readdir } = require('fs').promises;

var lastMod;
var filename;

const ONY_TIMER = 6;
const NEF_TIMER = 8;
const REND_TIMER = 3;


/*
https://worldofwarcraft.com/en-gb/game/status/classic-eu

open console and paste:
var jqry = document.createElement('script');
jqry.src = "https://code.jquery.com/jquery-3.3.1.min.js";
document.getElementsByTagName('head')[0].appendChild(jqry);

let realms = [];
jQuery('.SortTable-col').each(function(key, val) { 
if ((key % 6) == 1 && key > 6)
    realms.push($(this).text());
});
console.log(JSON.stringify(realms));
*/

// EU classic realms
const realms = ["Amnennar", "Ashbringer", "Auberdine", "Bloodfang", "Celebras", "Chromie", "Dragon's Call", "Dragonfang", "Dreadmist", "Earthshaker", "Everlook", "Finkle", "Firemaw", "Flamegor", "Flamelash", "Gandling", "Gehennas", "Golemagg", "Harbinger of Doom", "Heartstriker", "Hydraxian Waterlords", "Judgement", "Lakeshire", "Lucifron", "Mandokir", "Mirage Raceway", "Mograine", "Nethergarde Keep", "Noggenfogger", "Patchwerk", "Pyrewood Village", "Razorfen", "Razorgore", "Rhok'delar", "Shazzrah", "Skullflame", "Stonespine", "Sulfuron", "Ten Storms", "Transcendence", "Venoxis", "Wyrmthalak", "Zandalar Tribe"];

const factions = [
    'Alliance',
    'Horde'
];

function luaToJson(str) {
    let diff;
    do {  // replace curlies around arrays with square brackets
        diff = str.length;
        str = str.replace(/\{(((\n\t*)\t)\S.*(\2.*)*)\,\s--\s\[\d+\]\3\}/g, '[$1$3]');
        diff = diff - str.length;
    } while (diff > 0);
    str = str
        .replace(/NWBdatabase\s=\s/, '')         // remove variable definition
        .replace(/\s--\s\[\d+\](\n)/g, '$1') // remove comment
        .replace(/\,(\n\t*\})/g, '$1')       // remove trailing comma
        .replace(/\[(.*?)\]\s\=\s/g, '$1:')   // change equal to colon, remove brackets
        .replace(/[\t\r\n]/g, '')            // remove tabs & returns
        .replace(/,}/g, '}') // remove trailing commas again
    return JSON.parse(str);
}

function uploadData(data) {
    const payload = JSON.stringify(data);

    const options = {
        hostname: 'classic-wb-server.herokuapp.com',
        port: 443,
        path: '/',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': payload.length,
        },
    }
    console.log(`Uploading payload to ${options.hostname}:${options.port}...`);

    const req = https.request(options, (res) => {
        console.log(`Payload uploaded: ${res.statusCode}`);

        res.on('data', (d) => {
            process.stdout.write(d);
        })
    })

    req.on('error', (error) => {
        console.error(error);
    })

    req.write(payload);
    req.end();
}

function formatTimer(name, timer) {
    let now = new Date();
    let text = name + ': ';

    if (timer && timer.getTime() > now.getTime()) {
        let hh = timer.getHours();
        let mm = timer.getMinutes();
        if (hh < 10) {
            hh = '0' + hh;
        }
        if (mm < 10) {
            mm = '0' + mm;
        }
        text += hh + ':' + mm;
    } else {
        text += 'no timer';
    }
    return text;
}

async function readFile() {
    str = await fs.readFile(filename, 'utf8');
    json = luaToJson(str);
    let data = {};
    realms.forEach((realm) => {
        factions.forEach((faction) => {
            if (typeof json.global[realm] !== 'undefined' && typeof json.global[realm][faction] !== 'undefined') {
                realmData = {};

                // all timestamps should be in UTC - meaning timestamp should be the same regardless of the timezone of the client or the server

                realmData.onyTimer = json.global[realm][faction]['onyTimer'];
                realmData.nefTimer = json.global[realm][faction]['nefTimer'];
                realmData.rendTimer = json.global[realm][faction]['rendTimer'];
                //realmData.timezoneOffset = new Date().getTimezoneOffset();

                var onyTimer = new Date((realmData.onyTimer + (ONY_TIMER * 3600)) * 1000);
                var nefTimer = new Date((realmData.nefTimer + (NEF_TIMER * 3600)) * 1000);
                var rendTimer = new Date((realmData.rendTimer + (REND_TIMER * 3600)) * 1000);

                console.log(realm + ' ' + faction + ' => ');
                console.log(formatTimer('Ony Timer', onyTimer));
                console.log(formatTimer('Nef Timer', nefTimer));
                console.log(formatTimer('Rend Timer', rendTimer));

                if (typeof data[realm] === 'undefined') {
                    data[realm] = {};
                }

                data[realm][faction] = realmData;
            }
        })
    });

    return data;
}

async function printLogo() {
    let version;

    try {
        const data = JSON.parse(await fs.readFile('./package.json', 'binary'));
        version = data.version;
    } catch (e) {
        version = 'unknown';
    }

    console.log('Classic World Buff Client version: ' + version)
    console.log('');
}

async function* getFiles(dir) {
    const dirents = await readdir(dir, { withFileTypes: true });
    for (const dirent of dirents) {
        const res = resolve(dir, dirent.name);
        if (dirent.isDirectory()) {
            yield* getFiles(res);
        } else {
            yield res;
        }
    }
}

async function getNWBFile() {
    for await (const file of getFiles('../WTF')) {
        if (file.endsWith('NovaWorldBuffs.lua')) {
            return file;
        }
    }

    return null;
};

async function loop() {
    stats = await fs.stat(filename);
    if (stats.mtime.getMilliseconds() !== lastMod) {
        lastMod = stats.mtime.getMilliseconds();

        let dateModified = new Date(stats.mtime);
        console.log('NWB saved variables file modified: ' + dateModified.toString());

        let data = await readFile();
        uploadData(data);
    }
}

// main
(async () => {
    await printLogo();

    console.log('Looking for NovaWorldBuffs.lua file...');

    filename = await getNWBFile();
    if (!filename) {
        console.log('NovaWorldBuffs.lua not found in your path. Check that addon is installed and your script is inside wow dir/__classic__/wb-client folder');
        process.exit(1);
    }

    console.log('File found: ' + filename);

    stats = await fs.stat(filename);
    lastMod = stats.mtime.getMilliseconds();

    console.log('Checking file for changes...');

    setInterval(loop, 2000);
})();
