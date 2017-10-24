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
            const fullpath = json.cat + (json.id ? '.' + json.id : '');
            //const parts = fullpath.split('.');            
            labels[fullpath] = {en: json.en, cy: json.cy!='' ? json.cy :  null};
            // const target = getTarget(labels, parts);
            // target.en = json.en;
            // target.cy = json.cy!='' ? json.cy :  json.en + ' [CY ar goll]';
            //target
        })
        .on('done',()=>{
            console.log(labels);
            fs.writeFileSync('./labels.json', JSON.stringify(labels,null,2), 'utf-8');

            //console.log(labels.page.login.form.email)
        });
        
    })
    .catch((err)=>console.log(err));



// const rawLabels = require('./labels.json');

// function getTarget(start, propertyNames)
// {
//     console.log(propertyNames);
//     let target = start;

//     for(let index=0;index<propertyNames.length;index++)
//     {
        
//         let childTarget = target[propertyNames[index]];
//         console.log(propertyNames[index]);
//         console.log(childTarget);
//         if(childTarget==null)
//         {
//             target[propertyNames[index]] = {};
//             childTarget = target[propertyNames[index]];
//         }

//         target = childTarget;
//     }

//     return target;

// }

// exports.labels = {};

// for(let label in rawLabels)
// {
//     const labelObject = getTarget(exports.labels, label.split('.'));
//     labelObject.en = rawLabels[label].en;
//     labelObject.cy = rawLabels[label].cy;
// }

// console.log(exports.labels);

// exports.rawLabels = rawLabels;
