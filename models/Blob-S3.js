var AWS = require('aws-sdk');
/*
    This code is - quite frankly - terrible. 
    I don't know enough about promises, async and the AWS sdk (which is terrible itself)
    But it does allow us to backup place data into s3 storage...

*/
function getAccessKey(){

    return {
        accessKeyId:process.env.BLOB_ID, 
        secretAccessKey :process.env.BLOB_SECRET,
        region: "eu-west-2"
    };
}

async function putBlob (s3, bucketName, key, jsonData)
{
    console.log("put blob");
    let errDetails =null;
    var putPromise = s3.putObject({Bucket: bucketName, Key: key, Body: jsonData}).promise().catch((err)=>errDetails=err);

    console.log("after promise");
    await putPromise;
    console.log("after await");
    console.log(errDetails);
    return errDetails;
}


exports.saveBlob = async (root, path, data) =>
{
    try
    {
        console.log("saveBlob-before");
        var s3 = new AWS.S3(getAccessKey());

        const jsonData = data;
        const createResponse = await putBlob(s3, root, path, jsonData);
        console.log("saveBlob-after put blob");
        if(createResponse!=null)
        {
            if(createResponse.code==='NoSuchBucket')
            {
                //bucket does not exist...
                const createResponse2 =  s3.createBucket({Bucket: root}).promise().then(()=>{
                    console.log("saveBlob-create bucket, before put blob 2");
                    const createResponse2 = putBlob(s3, root, path, jsonData);
                    console.log("saveBlob - after put blob 2");
                });

                await createResponse2;
                console.log("blah");
            }
            else
            {
                return{success:false, err:createResponse.err};
            }
        }
        console.log("saveBlob-after");
        return {success: true, msg:"Blob saved!"};
    }
    catch(err)
    {
        console.log("main er");
        console.log(err);
        return {success: false, err};
    }

};
