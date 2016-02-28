var duplicates = [];


//use aggregation framework to group on the natural key of the hourlydata collection
db.hourlydata.aggregate([
    { $group: {
        _id: { measurement_key: "$measurement_key", hour_code: "$hour_code" }, //combination of measurement_key and hour_code should uniquely identify a document in hourlydata collection
        dups: { "$addToSet": "$_id" }, //collect the id of each matching row -  there should only be one in a clean data set
        count: { $sum: 1 } //count how many we find
    }},
    { $match: {
        count: { $gt: 1 } //match where count was greater than one - uh oh, that wasn't supposed to happen
    }}
],{allowDiskUse:true} // this option allows disk use in case there are a huge number of duplicates that can't fit in memory at one time
 ).forEach(function(doc) {
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

print("Found " + duplicates.length + " to delete...");

// Remove all duplicates -  process documents 500000 ids at a time, otherwise the delete job won't fit in memory
while(duplicates.length > 0) {
    var slice = duplicates.slice(0,500000);
    db.hourlydata.remove({_id: {$in: slice}});
    duplicates = duplicates.slice(500000);
}

print("done.");