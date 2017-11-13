require('dotenv').config({ path: __dirname + '/../variables.env' });
const fs = require('fs');

const places= JSON.parse(fs.readFileSync(__dirname + '/places.1.json', 'utf-8'));
var MongoClient = require('mongodb').MongoClient;

var uri = "mongodb://localhost:27017/cymru";

async function deleteData() {
  console.log('😢😢 Goodbye Data...');
   await MongoClient.connect(uri).then(async (db)=> 
      {    
          // Paste the following examples here
          console.log("connected to mogno");

          
          var placesCollection = db.collection("places");
          await placesCollection.drop();
                    
        db.close();
        console.log('Data Deleted. To load sample data, run\n\n\t npm run sample\n\n');
        process.exit();
    });

  
}

async function loadData() {
  try 
  {
      await MongoClient.connect(uri).then(async (db)=> 
      {    
          // Paste the following examples here
          console.log("connected to mogno");

          
          var placesCollection = db.collection("places");
          for(var i = 0; i<places.length; i++)
          {
            await placesCollection.save(places[i]);
          }          
        db.close();
        console.log('👍👍👍👍👍👍👍👍 Done!');
        process.exit();
    });
    
  } catch(e) {
    console.log('\n👎👎👎👎👎👎👎👎 Error! The Error info is below but if you are importing sample data make sure to drop the existing database first with.\n\n\t npm run blowitallaway\n\n\n');
    console.log(e);
    process.exit();
  }
}
if (process.argv.includes('--delete')) {
  deleteData();
} else {
  loadData();
}
