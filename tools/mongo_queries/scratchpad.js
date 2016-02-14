//query to add bounded field to parameters we care about
db.hourlydata.update(
    {
        parameter_name : {
            $in : ['PM25', 'PM10', 'OZONE', 'NO2', 'SO2', 'CO']
        }
    },
    {
        $set : {
            bounded : 0
        }
    },
    {
        multi: true
    }
);

//query to add bounded field to parameters that currently have an hour_code but not a bounded flag




// or query skeleton
db.hourlydata.find({
    $or: [
        {},
        {}
    ]
});



