var express = require('express');
var router = express.Router();
var Joi = require('joi');
var functions = require("./functions.js");



// This Endpoint handles GET /contact?pageSize={}&page={}&query={}.
// ASSUMING &query PARAMETER IS A COMPLETE QUERY ENCLOSED IN CURLY BRACES
// e.g &query={"query":{"match":{"name": "JOHN DOE"}}}
router.get('/', function (req, res, next) {

    if (req.query.pageSize != undefined)
        var pageSizeQ = req.query.pageSize.replace(/\D/g, '');
    if (req.query.page != undefined)
        var pageQ = req.query.page.replace(/\D/g, '') * pageSizeQ;
    var queryQ = req.query.query;

    var query = {
        index: 'contact',
        type: 'person',
        body: {
            from: pageQ,
            size: pageSizeQ,
            query: {}
        }
    };

    //QUERY SETUP FOR TO GET ALL ENTRIES ONLY IF "&query=" IS UNDEFINED
    if (queryQ == undefined) {
        query = JSON.stringify(query);
        query = query.replace("\"query\":{}", "\"query\":{\"match_all\":{}}");
        query = JSON.parse(query);
    }
    //QUERY SETUP IF "&query=" is DEFINED
    else {
        query = JSON.stringify(query);
        queryQ = queryQ.substr(1, queryQ.length - 2);
        query = query.replace("\"query\":{}", queryQ);
        query = JSON.parse(query);
    }

    //CALLING 'searchQuery' HELPER METHOD THAT QUERIES THE DATABASE/DOCUMENTS AND HANDLES THE RESPONSE
    functions.searchQuery(query).then(function(response){
        if(response == null){
            res.status(404).send("No entry returned for query \'{" + queryQ + "\}'");
        }
        else{
            var responseArr = functions.jsonExtractor(response.hits);
            res.status(200).send(responseArr);
        }
    });
});






//This endpoint should return the contact by a unique name.
//e.g GET /contact/{name}
router.get('/:name', function (req, res, next) {

    var nameParam = req.params.name;

    var query = {
        index: 'contact',
        type: 'person',
        body: {
            query: {
                match: {}
            }
        }
    };
    //JSON QUERY SETUP FOR PROVIDED NAME
    query = JSON.stringify(query);
    query = query.replace("\"match\":{}", "\"match\":{\"name\":\"" + nameParam + "\"}");
    query = JSON.parse(query);

    //SEARCH THROUGH DOCUMENTS/DATABASE USING THE ABOVE QUERY
    functions.searchQuery(query).then(function(response){
        if(response == null){
            res.status(404).send("No contact named \'" + nameParam + "\' found!");
        }
        else{
            var responseArr = functions.jsonExtractor(response.hits);
            res.status(200).send(responseArr);
        }
    });
});





// THIS ENDPOINT CREATES A UNIQUE CONTACT
// 'name' AND 'number' ARE REQUIRED IN REQUEST BODY
router.post('/', function (req, res, next) {

    // 'name' AND 'number' VALIDATION
    var schema = {
        name: Joi.string().min(3).required(),
        number: Joi.string().min(10).max(14).required()
    }
    var valResult = Joi.validate(req.body, schema);

    if (valResult.error) {
        res.status(400).send(valResult.error.details[0].message);
        return;
    }
    var nameParam = req.body.name;
    var numberParam = req.body.number;
    var id = nameParam.toLowerCase();

    //QUERY TO BE EXECUTED
    var query = {
        index: 'contact',
        id: id,
        type: 'person',
        body: {
            name: nameParam,
            number: numberParam
        }
    };

    functions.createQuery(query).then(function (response){
        if(response == true){
            res.status(200).send("Contact \'" + nameParam + "\' sucessfully created!");
        }else{
            res.status(400).send("Contact \'" + nameParam + "\' already exists!");
        }
    });

});





// THIS ENDPOINT UPDATES A CONTACT IF IT EXISTS
// 'number' MUST BE IN REQUEST BODY
router.put('/:name', function (req, res, next) {

    var nameParam = req.params.name;

    //SEARCH QUERY
    var query = {
        index: 'contact',
        type: 'person',
        body: {
            query: {
                match: {
                    name: nameParam
                }
            }
        }

    };
    //CHECK IF THE USER EXISTS
    functions.searchQuery(query).then(function(response){
        if(response == null){
            res.status(404).send("Contact \'" + nameParam + "\' not found. Update Failed!");
        }
        //IF THE USER EXISTS, CONTINUE ON TO VALIDATE THE DATA THAT IS TO BE UPDATED
        else {
            var schema = {number: Joi.string().min(10).max(14).required()};
            var valResult = Joi.validate(req.body, schema);

            //RETURN IF THE NEW 'number' PROVIDED IS INVALID
            if (valResult.error) {
                console.log(req.body);
                res.status(400).send(valResult.error.details[0].message);
                return;
            }
            //ELSE CREATE THE QUERY
            var numberParam = req.body.number;
            var id = nameParam.toLowerCase();
            var query = {
                index: 'contact',
                id: id,
                type: 'person',
                body: {
                    name: nameParam,
                    number: numberParam
                }
            };

            //UPDATE REQUEST
            client.index(query).then(function (resp) {
                res.status(200).send("Contact \'" + nameParam + "\' has been updated!");
            }, function (err) {
                console.trace(err.message);
            });
        }
    }, function (err) {
        console.trace(err.message);
        return;
    });
});






// THIS ENDOINT WILL HANDLE A DELETE REQUEST PROVIDED THAT THE ENTRY EXISTS
router.delete('/:name', function (req, res, next) {

    //DELETE QUERY
    var nameParam = req.params.name;
    var id = nameParam.toLowerCase();
    var query = {
        index: 'contact',
        type: 'person',
        id: id
    };

    //DELETE REQUEST
    client.delete(query).then(function (resp) {
        res.status(200).send("Contact \'" + nameParam + "\' sucessfully deleted.");
    }, function (err) {
        res.status(404).send("Contact \'" + nameParam + "\' Not Found");
        console.trace(err.message);
    });
});


module.exports = router;
