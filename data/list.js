var MongoClient = require('mongodb').MongoClient;

var uri = "mongodb://localhost:27017/cymru";

async function list()
{
    await MongoClient.connect(uri).then(async (db)=> 
    {    
        // Paste the following examples here
        console.log("connected to mogno");

        var cursor = db.collection('places').find({});
        var placesCollection = db.collection("places");
        // Save a document with no safe option
    
      for (let doc = await cursor.next(); doc != null; doc = await cursor.next()) 
      
      {
          console.log(doc);
      }

        

        db.close();
    });

}

list();