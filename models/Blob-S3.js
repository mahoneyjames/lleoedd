var AWS = require('aws-sdk');

exports.saveBlob = async (root, path, data) =>
{
    try{

    
    var s3 = new AWS.S3(getAccessKey());

    const bucketParams = {Bucket: root};

    var bucketResponse = s3.headBucket(bucketParams).promise(); 
    
    bucketResponse.then(()=>{console.log("bucket exists")}).catch((err)=>{
        //ugh. horrid coding model. an error to say that something doesn't exist???
        //why bother to check then? Put the blob, and if it fails, create the bucket, then call the same code again?

        if(err.code=='NotFound')
        {
            console.log("creating bucket");
            s3.createBucket(bucketParams).promise().then((data)=>console.log("bucket created"));
        }        
    
        else
        {
            console.log("head buccket errr");
            console.log(err);
        }
});

    await bucketResponse;
    console.log("we have awaited the bucketResponse");
    const params = {Bucket: root};
    //var response = await s3.createBucket(params).promise();
    //console.log(response);

        return {success: true, msg:"Blob saved!"};
    }
    catch(err)
    {
        console.log("main er");
        console.log(err);
        return {success: false, err};
    }

};

function getAccessKey(){

    return {
        accessKeyId:process.env.BLOB_ID, 
        secretAccessKey :process.env.BLOB_SECRET,
        region: "eu-west-2"
    };
}