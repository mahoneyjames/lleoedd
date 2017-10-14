exports.about =  (req, res)=>{
     res.render('about',{title:"About"});
};


exports.help = (req, res)=>{

    var what = req.params.what;

    switch(what)
    {
        case "address":
            res.render('help/locationLookups', {title: "Help: Finding addresses"});
        default:
            res.render('help/default', {title: "Help"});
    }

};
