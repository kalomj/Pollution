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



db.hourlydata.find({bounded:0},{ measurement_key : 1, hour_code : 1, bounded : 1, interpolated : 1, value : 1}).sort({ measurement_key: 1, hour_code : 1 }).pretty()

db.hourlydata.find({
    measurement_key : '000102001OZONE'},{ measurement_key : 1, hour_code : 1, bounded : 1, interpolated : 1, value : 1}).sort({ measurement_key: 1, hour_code : 1 }).pretty()



//count duplicates
db.hourlydata.aggregate([
    { $group: {
        _id: { firstField: "$measurement_key", secondField: "$hour_code" },
        uniqueIds: { $addToSet: "$_id" },
        count: { $sum: 1 }
    }},
    { $match: {
        count: { $gt: 1 }
    }}
])

//count duplicates, don't collect
db.hourlydata.aggregate([
    {
        $match: { measurement_key : "340171002CO", hour_code : 141551  }
    },
    { $group: {
        _id: { measurement_key: "$measurement_key", hour_code: "$hour_code" },
        count: { $sum: 1 }
    }},
    { $match: {
        count: { $gt: 1 }
    }}
])

db.hourlydata.aggregate([
    {
        $match: { measurement_key : "340171002CO"  }
    },
    { $group: {
        _id: { measurement_key: "$measurement_key", hour_code: "$hour_code" },
        count: { $sum: 1 }
    }},
    { $match: {
        count: { $gt: 1 }
    }}
])

db.hourlydata.aggregate([
    {
        $match: { valid_date : "02/23/16"  }
    },
    { $group: {
        _id: { measurement_key: "$measurement_key", hour_code: "$hour_code" },
        count: { $sum: 1 }
    }},
    { $match: {
        count: { $gt: 1 }
    }},
    { $group: {
        _id: null,
        count: { $sum : "$count"}
    }}
])

db.hourlydata.aggregate([
    {
        $match: { valid_date : "02/23/16"  }
    },
    { $group: {
        _id: { measurement_key: "$measurement_key", hour_code: "$hour_code" },
        count: { $sum: 1 }
    }},
    { $match: {
        count: { $gt: 1 }
    }},
    { $group: {
        _id: null,
        count: { $sum : "$count"}
    }}
])

db.hourlydata.aggregate([
    {
        $match: { hour_code : 141551  }
    },
    { $group: {
        _id: { measurement_key: "$measurement_key", hour_code: "$hour_code" },
        count: { $sum: 1 }
    }},
    { $match: {
        count: { $gt: 1 }
    }},
    { $group: {
        _id: null,
        count: { $sum : "$count"}
    }}
])
