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
        count: { $sum : "$count"},
        unique: {$sum : 1}
    }}
])

db.hourlydata.aggregate([
    {
        $match: { hour_code : hour_code  }
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
        count: { $sum : "$count"},
        unique: {$sum : 1}
    }}
])

var duplicates = [];
db.hourlydata.aggregate([
    {
        $match: { valid_date : "02/23/16"  }
    },
    { $group: {
        _id: { measurement_key: "$measurement_key", hour_code: "$hour_code" },
        dups: { "$addToSet": "$_id" },
        count: { $sum: 1 }
    }},
    { $match: {
        count: { $gt: 1 }
    }}
]).forEach(function(doc) {
        doc.dups.shift();      // First element skipped for deleting
        doc.dups.forEach( function(dupId){
                duplicates.push(dupId);   // Getting all duplicate ids
            }
        )
    });

printjson(duplicates);

141528
141551

var duplicates = [];

db.hourlydata.aggregate([
    { $group: {
        _id: { measurement_key: "$measurement_key", hour_code: "$hour_code" },
        dups: { "$addToSet": "$_id" },
        count: { $sum: 1 }
    }},
    { $match: {
        count: { $gt: 1 }
    }}
],{allowDiskUse:true}).forEach(function(doc) {
    var noreal = 1;
    for(var i = 0; i < docs.length; i++) {
        //if a real measurement is found, move it out of the array so it won't be deleted
        if(docs.interpolated===0) {
            noreal = 0;
            docs[i] = docs[docs.length-1];
            docs.pop();
            break;
        }
    }

    //if no real measurements are found, arbitrarily delete an element
    if(noreal) {
        doc.dups.shift();
    }
    doc.dups.forEach( function(dupId){
            duplicates.push(dupId);   // Getting all duplicate ids
        }
    )
});

// Remove all duplicates in one go
while(duplicates.length > 0) {
    var slice = duplicates.slice(0,500000);
    db.hourlydata.remove({_id: {$in: slice}});
    duplicates = duplicates.slice(500000);
}