
module.exports = {

    //Extracts and created object array of the JSON response for name and number attributes
    jsonExtractor: function (jsonobj) {
        var ret = [];
        for (var key in jsonobj) {
            ret.push({
                "name": jsonobj[key]._source.name,
                "number": jsonobj[key]._source.number
            });
        }
        return ret;
    },

    //QUERIES THE ELASTICSEARCH DATABASE AND RETURNS MATCHING DOCUMENTS IN JSON
    searchQuery: function (query) {
        var resp = client.search(query).then(function (resp) {
            var response = resp.hits;
            var numObj = response.total;
            if (numObj == 0) {
                return null;
            }
            return response;
        }, function (err) {
            console.trace(err.message);
        });

        return resp;
    },

    //POSTS THE JSON OBJECT TO ELASTICSEARCH DATABASE AND RETURNS AND BOOLEAN VALUE
    createQuery: function (query){
    var ret = client.create(query).then(function (resp) {
        return true;
    }, function (err) {
        console.trace(err.message);
        return false;
    });

    return ret;
}
}

