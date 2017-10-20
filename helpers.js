/*
  This is a file of data and helper functions that we can expose and use in our templating function
*/

// FS is a built in module to node that let's us read files from the system we're running on

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

exports.localise = (value) =>
{
  if(typeof(value)==="string")
  {
    return value;
  }
  else
  {    
    //console.log(user);
    return value["en"];
  }
};

exports.environment = () => 
{
  return process.env.NODE_ENV;
}

exports.labels = labels;
/*
function label(what)
{
    const cat = labels[category];
    
    if(cat!=null)
    {
      if(cat[id] && cat[id].cy)
      {
        return cat[id].cy;
      }            
    }
    return `${category}:${id}-noLabel`;
}
exports.label = label;
*/
function languageLabel(language,what)
{
    const cat = labels[what];    
    if(cat!=null)
    {
      if(cat[language])
      {
        return cat[language];
      }            
    }
    return `${what}:${language}-noLabel`;
}

exports.languageLabel = languageLabel;

// exports.htmlFromMarkdown = async (filename)=>
// {
//   const md = await readAFileReturnPromise(filename,'UTF-8');
//   const markdownToHtmlConvertor = new marked.Renderer();
//   return marked(md, {renderer: markdownToHtmlConvertor});
  
// }