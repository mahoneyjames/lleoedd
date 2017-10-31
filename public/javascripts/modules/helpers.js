let language='en';

if(window.location.pathname.toLowerCase().startsWith('/cy'))
{
    language = 'cy';
}

exports.language = language;

exports.localiseUrl = (url) =>
{
    if(url.startsWith('/'))
     {
        return `/${language}${url}`;
     }
     else
     {
       return `/${language}/${url}`;
     }

}