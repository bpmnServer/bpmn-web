"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MyAppDelegate = void 0;
const _1 = require("./");
const appServices_1 = require("./appServices");
const appUtils_1 = require("./appUtils");
const Mailer = require('../userAccess/config/mail');
const fs = require('fs');
var seq = 1;
const MULTI_APP_SERVICES = false;
const nodemailer = require("nodemailer");
class MyAppDelegate extends _1.DefaultAppDelegate {
    constructor(server) {
        super(server);
        this.appUtils = new appUtils_1.AppUtils(server);
    }
    getServicesProvider(context) {
        return __awaiter(this, void 0, void 0, function* () {
            // for multiple appServices  -start 
            if (MULTI_APP_SERVICES) {
                this.appServices = new Map();
                console.log('call services provider', context.instance.tenantId);
                const path = './' + context.instance.tenantId + '_appServices';
                let instance = this.appServices.get(path);
                if (!instance) {
                    const IMPORT = yield Promise.resolve(`${path}`).then(s => require(s));
                    const aClass = IMPORT.AppServices;
                    instance = new aClass();
                    this.appServices.set(path, instance);
                    console.log('instance loaded', path, instance);
                }
                return instance;
                // for multiple appServices  -end 
            }
            else {
                if (this.appServices == null)
                    this.appServices = new appServices_1.AppServices();
                return this.appServices;
            }
        });
    }
    /**
    * is fired on application startup
    **/
    startUp(options) {
        const _super = Object.create(null, {
            startUp: { get: () => super.startUp }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.startUp.call(this, options);
            if (options['cron'] == false) {
                return;
            }
            console.log('myserver started');
            var query = { "items.status": "start" };
            var list = yield this.server.dataStore.findItems(query);
            if (list.length > 0) {
                this.server.logger.log("** There are " + list.length, " items that seems to be hung");
            }
        });
    }
    /**
     * sends emails is called by Notification class
     *
     * @param to
     * @param subject
     * @param text
     */
    sendEmail(to, subject, text) {
        return __awaiter(this, void 0, void 0, function* () {
            let emailMsg;
            if (process.env.EMAIL_ENABLE == 'true') {
                // send mail with defined transport object
                const transporter = nodemailer.createTransport({
                    service: 'gmail',
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASSWORD
                    }
                });
                const info = yield transporter.sendMail({
                    from: process.env.EMAIL_FROM,
                    to: to,
                    subject: subject,
                    text: text,
                    html: text //"<b>Hello world?</b>", // html body
                });
                emailMsg = info.messageId;
                console.log("Message sent: %s", info.messageId);
            }
            else
                emailMsg = 'email disabled by .env';
            let emailLog = process.env.EMAIL_LOG;
            if (emailLog && emailLog !== '') {
                let log = `\n\nto:${to}\n${subject}\n${text}\n${emailMsg}`;
                fs.appendFileSync(emailLog, log);
            }
            return emailMsg;
        });
    }
    /* only for show
    sendEmailSendGrid(to, msg, body) {

        console.log(`Sending email to ${to}`);

        const key = process.env.SENDGRID_API_KEY;

        if (key && (key != '')) {
            const sgMail = require('@sendgrid/mail')
            sgMail.setApiKey(process.env.SENDGRID_API_KEY)

            const email = {
                to: to,
                from: 'ralphhanna@hotmail.com', // Change to your verified sender
                subject: msg,
                text: body,
                html: body
            }

            sgMail
                .send(email)
                .then((response) => {
                    this.server.logger.log('responseCode', response[0].statusCode)
                    this.server.logger.log('responseHeaders', response[0].headers)
                })
                .catch((error) => {
                    console.error('Email Error:' + error)
                })

        }
        else {
            console.log(`email is disabled`);
        }

    }
    */
    executionStarted(execution) {
        const _super = Object.create(null, {
            executionStarted: { get: () => super.executionStarted }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.executionStarted.call(this, execution);
        });
    }
    executionEvent(context, event) {
        return __awaiter(this, void 0, void 0, function* () {
            if (context.item) {
                //            console.log(`----->Event: '${event}' for ${context.item.element.type} '${context.item.element.id}' id: ${context.item.id}`);
                //            if (event == 'wait' && context.item.element.type == 'bpmn:UserTask')
                //                console.log(`----->Waiting for User Input for '${context.item.element.id}' id: ${context.item.id}`);
            }
            //       else
            //           console.log('----->All:' + event, context.definition.name);
        });
    }
    messageThrown(messageId, data, matchingQuery, item) {
        const _super = Object.create(null, {
            messageThrown: { get: () => super.messageThrown }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.messageThrown.call(this, messageId, data, matchingQuery, item);
        });
    }
    signalThrown(signalId, data, matchingQuery, item) {
        const _super = Object.create(null, {
            signalThrown: { get: () => super.signalThrown }
        });
        return __awaiter(this, void 0, void 0, function* () {
            yield _super.signalThrown.call(this, signalId, data, matchingQuery, item);
        });
    }
    serviceCalled(input, context) {
        return __awaiter(this, void 0, void 0, function* () {
            this.server.logger.log("service called");
        });
    }
}
exports.MyAppDelegate = MyAppDelegate;
//# sourceMappingURL=appDelegate.js.map