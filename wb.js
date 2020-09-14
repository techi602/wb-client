const fs = require('fs');
const https = require('https')

var lastMod;
var filename = './NovaWorldBuffs.lua';
var realm = 'Zandalar Tribe';
var faction = 'Horde';

const ONY_TIMER = 6;
const NEF_TIMER = 8;
const REND_TIMER = 3;


/*
https://worldofwarcraft.com/en-gb/game/status/classic-eu

open console and paste:
var jqry = document.createElement('script');
jqry.src = "https://code.jquery.com/jquery-3.3.1.min.js";
document.getElementsByTagName('head')[0].appendChild(jqry);

jQuery('SortTable-col SortTable-data align-center').each(function(key, val) { 
    console.log(key);
});

*/

const realms = [
    'Golemagg',
    'Zandalar Tribe'
];

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

function readFile() {
    fs.readFile(filename, 'utf8', (err, str) => {
        if (err) {
            console.log(err);
            process.exit(1);
        }

        json = luaToJson(str);

        let data = {};

        realms.forEach((realm) => {
            factions.forEach((faction) => {
                if (typeof json.global[realm] !== 'undefined' && typeof json.global[realm][faction] !== 'undefined') {
                    realmData = {};

                    //realmData.realm = realm;
                    //realmData.faction = faction;
                    realmData.onyTimer = json.global[realm][faction]['onyTimer'];
                    realmData.nefTimer = json.global[realm][faction]['nefTimer'];
                    realmData.rendTimer = json.global[realm][faction]['rendTimer'];
            
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

        console.log(JSON.stringify(data));
        uploadData(data);
    });
}

function execute() {
    fs.stat(filename, (err, stats) => {
        if (stats.mtime.getMilliseconds() !== lastMod) {
            lastMod = stats.mtime.getMilliseconds();

            let seconds = (new Date().getTime() - stats.mtime) / 1000;
            console.log(`Lua file modified ${seconds} ago`);

            readFile();
        }
    });
}

execute();
setInterval(execute, 10000);
