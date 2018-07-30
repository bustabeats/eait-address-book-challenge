var expect = require('chai').expect;
var express = require('express');


var functions = require('../routes/functions.js');
describe("jsonExtractor()", function(){
    it("Name and Number attributed JSON array of contacts", function(){
        var query = [{"_index":"contact","_type":"person","_id":"john","_score":1,"_source":{"name":"John","number":"1800111111"}},{"_index":"contact","_type":"person","_id":"doe","_score":1,"_source":{"name":"Doe","number":"6467258596"}},{"_index":"contact","_type":"person","_id":"jay","_score":1,"_source":{"name":"Jay","number":"1482256325"}}];
        var results = functions.jsonExtractor([{"name":"John","number":"1800111111"},{"name":"Doe","number":"6467258596"},{"name":"Jay","number":"1482256325"}]);
        expect(results).to.equal();
    });
});