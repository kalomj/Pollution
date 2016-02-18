db.triangles.createIndex( { valid_date : 1, valid_time : 1, parameter_name : 1, triangle : "2dsphere" } );
db.triangles.createIndex( { valid_date : 1, valid_time : 1, parameter_name : 1  } );
db.hourlydata.createIndex( { measurement_key: 1, valid_date : 1, valid_time : 1 } );
db.hourlydata.createIndex( { valid_date : 1, valid_time : 1, parameter_name : 1 } );
db.hourlydata.createIndex( { measurement_key : 1, bounded : 1, hour_code : 1 } );
db.locations.createIndex( { measurement_key : 1, hour_code : 1 } );
db.loadedfiles.createIndex( { hour_code : 1 } );
db.delaunayjobs.createIndex( { hour_code : 1, parameter_name : 1 } );
