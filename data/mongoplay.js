const promisify = require('es6-promisify');
var MongoClient = require('mongodb').MongoClient;

var uri = "mongodb://localhost:27017/cymru";

async function migratePlacesToVersion2()
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
        
            if(doc.schemaVersion==undefined || doc.schemaVersion ==1)
            {
                console.log(`"Migrating '${doc.name}' to schema version 2'`);
                //doc._id = null;
                doc.name = {en:doc.name};
                doc.summary = {en:doc.summary};
                doc.description = {en:doc.description};                                
                doc.slugs = [doc.slug]
                doc.slug = {en:doc.slug};

                doc.schemaVersion = 2;

                await placesCollection.save(doc);
            }
            else{
                console.log(`'${doc.name.en}' is already schema version 2'`);
            }
            
      }

        

        db.close();
    });

}

migratePlacesToVersion2();