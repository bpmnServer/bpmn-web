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
exports.UserService = void 0;
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const User = require('./models/User');
class UserService {
    constructor(server) {
        if (UserService.initialized)
            return;
        UserService.initialized = true;
        setImmediate(() => {
            this.init();
        });
    }
    findUsers(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield User.find(query);
        });
    }
    findUser(query) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield User.findOne(query);
        });
    }
    addUser(userName, email, password, userGroups) {
        return __awaiter(this, void 0, void 0, function* () {
            let exist = yield User.findOne({ userName: userName });
            if (exist) {
                console.log(`user '${userName}' already exists`);
                return exist;
            }
            exist = yield User.findOne({ email: email });
            if (exist) {
                console.log("user already exists with this email", email);
                return exist;
            }
            const user = new User({
                userName, email, password, userGroups
            });
            yield user.save();
            return user;
        });
    }
    setPassword(userName, password) {
        return __awaiter(this, void 0, void 0, function* () {
            let user = yield User.findOne({ userName });
            if (!user) {
                console.log("User does not exist");
                return;
            }
            user.password = password;
            yield user.save();
        });
    }
    install() {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(` adding new User for 'admin'  password: 'admin'`);
            //await this.init();
            yield this.addUser('admin', 'admin@mySite.com', 'admin', ['ADMIN']);
        });
    }
    init() {
        console.log('UserService.init()');
        dotenv.config();
        console.log("MongoDB URL", process.env.MONGO_DB_URL);
        mongoose.set('strictQuery', false);
        mongoose.connect(process.env.MONGO_DB_URL);
        mongoose.connection.on('error', (err) => {
            console.error(err);
            console.log('%s MongoDB connection error. Please make sure MongoDB is running.');
            process.exit();
        });
    }
}
exports.UserService = UserService;
UserService.initialized = false;
//# sourceMappingURL=UserService.js.map