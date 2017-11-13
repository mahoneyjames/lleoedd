require('dotenv').config({ path: __dirname + '/../variables.env' });
const fs = require('fs');

const mongoose = require('mongoose');
mongoose.connect(process.env.DATABASE);
mongoose.Promise = global.Promise; // Tell Mongoose to use ES6 promises

const Place = require('../models/Place');


// const stores = JSON.parse(fs.readFileSync(__dirname + '/stores.json', 'utf-8'));
// const reviews = JSON.parse(fs.readFileSync(__dirname + '/reviews.json', 'utf-8'));
// const users = JSON.parse(fs.readFileSync(__dirname + '/users.json', 'utf-8'));

async function migratePlaces() {
  
  const places = await Place.find();
  for(var i = 0 ; i< places.length; i++)
  {
    const place = places[i];

    console.log(place);
    if(!place.schemaVersion || place.schemaVersion==2)
    {
        const name = place.name;
        console.log(typeof(place.summary));
        place.name = {en:name.toString()};
        place.summary = {en:place.summary};
        place.description = {en:place.description}
        //place.schemaVersion = 2;
        //await Place.update(place);

        console.log(`Updating ${place.name.en} to schemaVersion 2`);
        console.log(place);
    }
    else
    {
      console.log(`${place.name.en} schema version =${place.schemaVersion}`);
    }


    
  }  
  process.exit();
}


migratePlaces();

