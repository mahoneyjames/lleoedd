/*
  This is a file of data and helper functions that we can expose and use in our templating function
*/

// FS is a built in module to node that let's us read files from the system we're running on

//const labelHelper = require('./labelRuntime.js');
const labels = require('./labels.json');



//const readAFileReturnPromise = util.promisify(readFile);

// moment.js is a handy library for displaying dates. We need this in our templates to display things like "Posted 5 minutes ago"
exports.moment = require('moment');

// Dump is a handy debugging function we can use to sort of "console.log" our data
exports.dump = (obj) => JSON.stringify(obj, null, 2);

// Making a static map is really long - this is a handy helper function to make one
exports.staticMap = ([lng, lat]) => `https://maps.googleapis.com/maps/api/staticmap?center=${lat},${lng}&zoom=14&size=800x150&key=${process.env.MAP_KEY}&markers=${lat},${lng}&scale=2`;

// inserting an SVG
exports.icon = (name) => fs.readFileSync(`./public/images/icons/${name}.svg`);

// Some details about the site
exports.siteName = `Admin - chat.cymru [${process.env.NODE_ENV}]`;

exports.menu = [
  { slug: '/map', title: 'map', icon: 'map', },
  { slug: '/places', title: 'places', icon: 'store', },  
  //{ slug: '/top', title: 'Top', icon: 'top', },
  { slug: '/places-add', title: 'add', icon: 'add', },
  
];

exports.environment = () => 
{
  return process.env.NODE_ENV;
}

exports.labels = labels;

//Returns a localised label
exports.localiseLabel = (preferenceLanguage, what) =>
{
  const result = exports.localise(preferenceLanguage, labels[what], what);
  if(result.found && result.fallback==false)
  {
    return result.text;
  }
  else if (result.found && result.fallback==true)
  {
    console.log(`Fallback label '${what}' for '${preferenceLanguage}'`);
    return `${result.text} [${result.language}]`;
  }
  else
  {      
    console.log(`Label not found for '${what}'`);
    return `${what}-notFound`;
  }    
}

//Returns a single string out of one of our localisation objects
exports.localiseString = (preferenceLanguage, what, options)=>
{
  if(options===undefined)
  {
    options = {indicateFallbackLanguage:true};
  }
  const result = exports.localise(preferenceLanguage, what);
  if(result.found && result.fallback)
  {
    if(options.indicateFallbackLanguage)
    {
      return `${result.text} [${result.language}]`;
    }
    else
    {
      return `${result.text}`;
    }
  }
  else
  {
    return result.text;
  }
}

/*
  Return a single language version out of this structure

  { en: 'english', cy:'cymraeg'}

*/
exports.localise = (preferenceLanguage, what,debug)=>
{


    if(what===undefined)
    {
      return {text:'', found:true, debug};
    }

    if(typeof(what)==='String')
    {
      return {text:what,found:true, debug};
    }
    else
    {
      const getLocal = (languageRequired, otherLanguage, what) =>
      {
        if(what[languageRequired]!=null)
        {
          return {text:what[languageRequired], language:languageRequired, found:true, fallback:false,debug};
        }
        else if(what[otherLanguage]!=null)
        {
          return {text:what[otherLanguage], language:otherLanguage, found:true, fallback:true,debug};
        }
        else
        {
          return {text:'', language:languageRequired, found:false, fallback:false,debug};
        }
      };

      if(preferenceLanguage=="en")
      {
        return getLocal("en","cy", what);
      }
      else
      {
        return getLocal("cy","en", what);
      }
    }

}