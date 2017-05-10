'use strict';
var Alexa = require('alexa-sdk');
var https = require('https');
const cheerio = require('cheerio');

var APP_ID = "amzn1.ask.skill.2d4d1e18-3d9c-472d-bca2-67fc901cd607";
var SKILL_NAME = 'CryptoBot';

var options = {
    host: 'www.schneierfacts.com',
    port: 443,
};


exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.APP_ID = APP_ID;
    alexa.registerHandlers(handlers);
    alexa.execute();
};

var handlers = {
    'LaunchRequest': function () {
        this.emit('GetFact');
    },
    'GetNewFactIntent': function () {
        this.emit('GetFact');
    },
    'GetFact': function () {

        var finalOutput = "Bruce Schneier decided to randomly give you an error. Please try again.";

        var ctx = this;

        var req = https.request(options, function(res) {

            res.setEncoding('utf8');
            var body = "";
            res.on('data', function (chunk) {
                body += chunk;
            });

            res.on('end', function () {
                console.log(`Get status code ${res.statusCode} and content type ${res.headers["content-type"]}`);
                const $ = cheerio.load(body);
                var fact = $("p.fact").text();
                if (fact != "") {
                    finalOutput = fact.trim();
                }
                console.log(`Got fact ${finalOutput}`);
                ctx.emit(':tellWithCard', finalOutput, SKILL_NAME, finalOutput)
            });

        });

        req.on('error', function(e) {
            console.log('problem with request: ' + e.message);
            ctx.emit(':tellWithCard', finalOutput, SKILL_NAME, finalOutput)
        });

        req.end();
    },
    'AMAZON.HelpIntent': function () {
        var speechOutput = "You can say tell me a crypto fact, or, you can say exit... What can I help you with?";
        var reprompt = "What can I help you with?";
        this.emit(':ask', speechOutput, reprompt);
    },
    'AMAZON.CancelIntent': function () {
        this.emit(':tell', 'Goodbye!');
    },
    'AMAZON.StopIntent': function () {
        this.emit(':tell', 'Goodbye!');
    }
};