const config = require('./config')(),
    path = require('path');

/**
 * The send object should be like this:
 * {
 *      from?: email address (defaults to module.exports.contactAddress),
 *      fromName?: string (defaults to 'ImprovPlus'),
 *      to?: email address, (defaults to module.exports.contactAddress)
 *      toName?: string,
 *      subject: string,
 *      content: {content object}
 * }
 * 
 * The Content object can be any of these:
 * 
 * Standard Text:
 * {
 *      type: 'text',
 *      baseUrl: string ('https://' + req.get('host'))
 *      greeting: string (Dear blank,)
 *      body: string (html markup)
 *      action?: string (url for button)
 *      actionText: string (text on the button)
 *      afterAction: string (sincerely,...)
 * }
 */

module.exports = {

    fromAddress: 'kate@katebringardner.com',
    contactAddress: 'kate@katebringardner.com',

    send: (sendObject, callback) => {

        let exphbs = require('express-handlebars'),
            hbs = exphbs.create({}),

            sendgridHelper = require('sendgrid').mail,
            sendgrid = require('sendgrid')(config.sendgrid.key),

            from_email = new sendgridHelper.Email(sendObject.from || module.exports.fromAddress,
                                                sendObject.fromName || 'Coach Yourself'),
            to_email = new sendgridHelper.Email(sendObject.to || module.exports.contactAddress, 
                                                sendObject.toName || 'Coach Yourself'),
            //content = new sendgridHelper.Content(type, sendObject.body),
            content = sendObject.content,
            renderPromise;

        if (!content.baseUrl) {
            content.baseUrl = 'https://app.thespeakers-studio.com';
        }

        if (!content.afterAction) {
            content.afterAction = `
                <p>Sincerely,</p>

                <p>Kate Bringardner</p>
            `;
        }

        switch(content.type) {
            case 'text':
                renderPromise = hbs.render(
                    path.join(__dirname, '/email_templates/text.handlebars'), content);
                break;
            default:
                renderPromise = Promise.resolve(content.body);
                break;
        }
        
        renderPromise
        .catch(e => {
            console.error('Template parse error', e);
            callback(e);
        })
        .then(html => {
            let body = new sendgridHelper.Content('text/html', html);
            let mail = new sendgridHelper.Mail(from_email, sendObject.subject, to_email, body);

            let request = sendgrid.emptyRequest({
                method: 'POST',
                path: '/v3/mail/send',
                body: mail.toJSON()
            });

            sendgrid.API(request, (error, response) => {
                if (error) {
                    console.error(error.response.body.errors, error);
                }

                callback(error, response);
            });
        });

    }

}
