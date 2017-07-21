var express = require('express');
var router = express.Router();
var config = require('../config')();
const util = require('../util');

const emailUtil = require('../email'),
    ContactModel = require('../models/contact.model'),
    contactGreeting = 'Dear Proprietors of <span>improv</span><strong>plus</strong>,';

router.post('/featurerequest', function(req, res) {
  
    let message = req.body.message,
        email = req.user.email,
        name = req.user.firstName + ' ' + req.user.lastName,
        body = util.breakStringIntoParagraphs(message);

    ContactModel.create({
        user: req.user._id,
        type: 'featurerequest',
        message: body
    }).then(data => {

        let sendObject = {
            from: email,
            fromName: name,
            subject: 'ImprovPlus Feature Request',
            content: {
                type: 'text',
                greeting: contactGreeting,
                body: '<p>In order to make ImprovPlus even more awesome...</p>' + body,
                afterAction: '<p></p><p>Sincerely,</p><p>' + name + '</p><p>' + email + '</p><p>User ID: ' + req.user._id + '</p>'
            }
        }

        emailUtil.send(sendObject, (error, response) => {
            if (error) {
                res.status(500).json({error: "very yes"});
            } else {
                res.send('Success');
            }
        });

    })

});

router.post('/bugreport', function(req, res) {

    let email = req.user.email,
        name = req.user.firstName + ' ' + req.user.lastName,

        tryingTo = req.body.tryingTo,
        expectation = req.body.expectation,
        reality = req.body.reality,
        steps = req.body.steps;

    body = '<p>Something went wrong while I was trying to...</p>'
    body += util.breakStringIntoParagraphs(tryingTo);
    
    body += '<p>I expected it to...</p>'
    body += util.breakStringIntoParagraphs(expectation);
    
    body += '<p>But unfortunately it actually...</p>'
    body += util.breakStringIntoParagraphs(reality);
    
    body += '<p>The steps I took to cause the problem were...</p>'
    body += util.breakStringIntoParagraphs(steps)

    ContactModel.create({
        user: req.user._id,
        type: 'bugreport',
        message: body
    }).then(data => {
        let sendObject = {
            from: email,
            fromName: name,
            subject: 'ImprovPlus Bug Report',
            content: {
                type: 'text',
                baseUrl: 'https://' + req.get('host'),
                greeting: contactGreeting,
                body: body,
                afterAction: '<p></p><p>Sincerely,</p><p>' + name + '</p><p>' + email + '</p><p>User ID: ' + req.user._id + '</p>'
            }
        };

        emailUtil.send(sendObject, (error, response) => {
            if (error) {
                res.status(500).json({error: "very yes"});
            } else {
                res.send('Success');
            }
        });
    });

})

module.exports = router;
