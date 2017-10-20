const axios =  require('axios');
const csvToJson = require('csvtojson');
const fs = require('fs');
const moment = require('moment');
const promisify = require('es6-promisify');

console.log("yma");
axios.all([axios.get("https://docs.google.com/spreadsheets/d/e/2PACX-1vT24almm6Ob-3ZeIfEYY-78Iv_JFFP6JMjWFd_8ahm3DCZJPNJ5FtX-8o5-HkN5qhhgF6ZYQt6eJv2U/pub?output=csv")])
    .then((results)=>{

        const labels = {};
        csvToJson().fromString(results[0].data)
        .on('json', (json)=>
        {
            labels[json.cat + '.' + json.id] = {en: json.en, cy: json.cy!='' ? json.cy :  json.en + ' [CY ar goll]'};
        })
        .on('done',()=>{
            console.log(labels);
            fs.writeFileSync('./labels.json', JSON.stringify(labels,null,2), 'utf-8');
        });
        
    })
    .catch((err)=>console.log(err));