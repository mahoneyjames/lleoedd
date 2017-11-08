#Data model validation

 - View validation e.g. "required" against an input
 - Controller model validation 
 - MongoDB validation - any rules defined in the mongo model
  - Handle these using handlers/mongodb.handleMongoError. 
  - This looks in the mongo db error object and constructs a slightly friendlier error message
  - It's not very pretty - this is last gasp validation. In depth handling happens in the controllers (which allows us to switch out from MongoDB to another data store) 