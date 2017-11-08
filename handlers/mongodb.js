exports.handleMongoError = (req,res,err, view, data)=>
{

    const validationErrors = [];
    for(var field in err.errors)
    {
        validationErrors.push({param:field, msg: err.errors[field].message });
    }

    req.flash('error', `<p>Mongo DB validation errors:</p><ul>` +   validationErrors.map(err=>`<li>${err.msg}</li>`).join('') + "</ul>");  

    data["flashes"] = req.flash();
    data["validationErrors"] = validationErrors;

          
    res.render(view,data);
}