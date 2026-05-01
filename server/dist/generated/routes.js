"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RegisterRoutes = RegisterRoutes;
const runtime_1 = require("@tsoa/runtime");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const UserController_1 = require("./../controllers/UserController");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const ProfileController_1 = require("./../controllers/ProfileController");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const MessageController_1 = require("./../controllers/MessageController");
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const AuthController_1 = require("./../controllers/AuthController");
const authMiddleware_1 = require("./../middleware/authMiddleware");
const multer = require('multer');
const expressAuthenticationRecasted = authMiddleware_1.expressAuthentication;
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
const models = {
    "UserSummary": {
        "dataType": "refObject",
        "properties": {
            "userId": { "dataType": "string", "required": true },
            "username": { "dataType": "string", "required": true },
            "displayName": { "dataType": "string", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ProfileResponse": {
        "dataType": "refObject",
        "properties": {
            "userId": { "dataType": "string", "required": true },
            "username": { "dataType": "string", "required": true },
            "displayName": { "dataType": "string", "required": true },
            "bio": { "dataType": "string", "required": true },
            "avatarBase64": { "dataType": "string" },
            "avatarMimeType": { "dataType": "string" },
            "createdAt": { "dataType": "string", "required": true },
            "updatedAt": { "dataType": "string", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateProfileRequest": {
        "dataType": "refObject",
        "properties": {
            "displayName": { "dataType": "string" },
            "bio": { "dataType": "string" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PublicProfileResponse": {
        "dataType": "refObject",
        "properties": {
            "userId": { "dataType": "string", "required": true },
            "username": { "dataType": "string", "required": true },
            "displayName": { "dataType": "string", "required": true },
            "bio": { "dataType": "string", "required": true },
            "avatarBase64": { "dataType": "string" },
            "avatarMimeType": { "dataType": "string" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MessageResponse": {
        "dataType": "refObject",
        "properties": {
            "messageId": { "dataType": "string", "required": true },
            "conversationId": { "dataType": "string", "required": true },
            "senderId": { "dataType": "string", "required": true },
            "receiverId": { "dataType": "string", "required": true },
            "senderUsername": { "dataType": "string", "required": true },
            "senderDisplayName": { "dataType": "string", "required": true },
            "content": { "dataType": "string", "required": true },
            "readBy": { "dataType": "array", "array": { "dataType": "string" }, "required": true },
            "sentAt": { "dataType": "string", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LoginResponse": {
        "dataType": "refObject",
        "properties": {
            "token": { "dataType": "string", "required": true },
            "user": { "ref": "UserSummary", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RegisterRequest": {
        "dataType": "refObject",
        "properties": {
            "username": { "dataType": "string", "required": true },
            "password": { "dataType": "string", "required": true },
            "displayName": { "dataType": "string" },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LoginRequest": {
        "dataType": "refObject",
        "properties": {
            "username": { "dataType": "string", "required": true },
            "password": { "dataType": "string", "required": true },
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new runtime_1.ExpressTemplateService(models, { "noImplicitAdditionalProperties": "throw-on-extras", "bodyCoercion": true });
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
function RegisterRoutes(app, opts) {
    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################
    const upload = opts?.multer || multer({ "limits": { "fileSize": 8388608 } });
    const argsUserController_getUsers = {
        req: { "in": "request", "name": "req", "required": true, "dataType": "object" },
    };
    app.get('/users', authenticateMiddleware([{ "bearerAuth": [] }]), ...((0, runtime_1.fetchMiddlewares)(UserController_1.UserController)), ...((0, runtime_1.fetchMiddlewares)(UserController_1.UserController.prototype.getUsers)), async function UserController_getUsers(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsUserController_getUsers, request, response });
            const controller = new UserController_1.UserController();
            await templateService.apiHandler({
                methodName: 'getUsers',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsProfileController_getMyProfile = {
        req: { "in": "request", "name": "req", "required": true, "dataType": "object" },
    };
    app.get('/profile/me', authenticateMiddleware([{ "bearerAuth": [] }]), ...((0, runtime_1.fetchMiddlewares)(ProfileController_1.ProfileController)), ...((0, runtime_1.fetchMiddlewares)(ProfileController_1.ProfileController.prototype.getMyProfile)), async function ProfileController_getMyProfile(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsProfileController_getMyProfile, request, response });
            const controller = new ProfileController_1.ProfileController();
            await templateService.apiHandler({
                methodName: 'getMyProfile',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsProfileController_updateProfile = {
        body: { "in": "body", "name": "body", "required": true, "ref": "UpdateProfileRequest" },
        req: { "in": "request", "name": "req", "required": true, "dataType": "object" },
    };
    app.patch('/profile/me', authenticateMiddleware([{ "bearerAuth": [] }]), ...((0, runtime_1.fetchMiddlewares)(ProfileController_1.ProfileController)), ...((0, runtime_1.fetchMiddlewares)(ProfileController_1.ProfileController.prototype.updateProfile)), async function ProfileController_updateProfile(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsProfileController_updateProfile, request, response });
            const controller = new ProfileController_1.ProfileController();
            await templateService.apiHandler({
                methodName: 'updateProfile',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsProfileController_uploadAvatar = {
        avatar: { "in": "formData", "name": "avatar", "required": true, "dataType": "file" },
        req: { "in": "request", "name": "req", "required": true, "dataType": "object" },
    };
    app.post('/profile/me/avatar', authenticateMiddleware([{ "bearerAuth": [] }]), upload.fields([
        {
            name: "avatar",
            maxCount: 1
        }
    ]), ...((0, runtime_1.fetchMiddlewares)(ProfileController_1.ProfileController)), ...((0, runtime_1.fetchMiddlewares)(ProfileController_1.ProfileController.prototype.uploadAvatar)), async function ProfileController_uploadAvatar(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsProfileController_uploadAvatar, request, response });
            const controller = new ProfileController_1.ProfileController();
            await templateService.apiHandler({
                methodName: 'uploadAvatar',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsProfileController_deleteAvatar = {
        req: { "in": "request", "name": "req", "required": true, "dataType": "object" },
    };
    app.delete('/profile/me/avatar', authenticateMiddleware([{ "bearerAuth": [] }]), ...((0, runtime_1.fetchMiddlewares)(ProfileController_1.ProfileController)), ...((0, runtime_1.fetchMiddlewares)(ProfileController_1.ProfileController.prototype.deleteAvatar)), async function ProfileController_deleteAvatar(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsProfileController_deleteAvatar, request, response });
            const controller = new ProfileController_1.ProfileController();
            await templateService.apiHandler({
                methodName: 'deleteAvatar',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsProfileController_getPublicProfile = {
        userId: { "in": "path", "name": "userId", "required": true, "dataType": "string" },
        req: { "in": "request", "name": "req", "required": true, "dataType": "object" },
    };
    app.get('/profile/:userId', authenticateMiddleware([{ "bearerAuth": [] }]), ...((0, runtime_1.fetchMiddlewares)(ProfileController_1.ProfileController)), ...((0, runtime_1.fetchMiddlewares)(ProfileController_1.ProfileController.prototype.getPublicProfile)), async function ProfileController_getPublicProfile(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsProfileController_getPublicProfile, request, response });
            const controller = new ProfileController_1.ProfileController();
            await templateService.apiHandler({
                methodName: 'getPublicProfile',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsMessageController_getMessages = {
        receiverId: { "in": "path", "name": "receiverId", "required": true, "dataType": "string" },
        req: { "in": "request", "name": "req", "required": true, "dataType": "object" },
        page: { "in": "query", "name": "page", "dataType": "double" },
        limit: { "in": "query", "name": "limit", "dataType": "double" },
    };
    app.get('/messages/:receiverId', authenticateMiddleware([{ "bearerAuth": [] }]), ...((0, runtime_1.fetchMiddlewares)(MessageController_1.MessageController)), ...((0, runtime_1.fetchMiddlewares)(MessageController_1.MessageController.prototype.getMessages)), async function MessageController_getMessages(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsMessageController_getMessages, request, response });
            const controller = new MessageController_1.MessageController();
            await templateService.apiHandler({
                methodName: 'getMessages',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsMessageController_searchMessages = {
        receiverId: { "in": "path", "name": "receiverId", "required": true, "dataType": "string" },
        req: { "in": "request", "name": "req", "required": true, "dataType": "object" },
        q: { "in": "query", "name": "q", "required": true, "dataType": "string" },
    };
    app.get('/messages/:receiverId/search', authenticateMiddleware([{ "bearerAuth": [] }]), ...((0, runtime_1.fetchMiddlewares)(MessageController_1.MessageController)), ...((0, runtime_1.fetchMiddlewares)(MessageController_1.MessageController.prototype.searchMessages)), async function MessageController_searchMessages(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsMessageController_searchMessages, request, response });
            const controller = new MessageController_1.MessageController();
            await templateService.apiHandler({
                methodName: 'searchMessages',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsMessageController_markRead = {
        messageId: { "in": "path", "name": "messageId", "required": true, "dataType": "string" },
        req: { "in": "request", "name": "req", "required": true, "dataType": "object" },
    };
    app.patch('/messages/:messageId/read', authenticateMiddleware([{ "bearerAuth": [] }]), ...((0, runtime_1.fetchMiddlewares)(MessageController_1.MessageController)), ...((0, runtime_1.fetchMiddlewares)(MessageController_1.MessageController.prototype.markRead)), async function MessageController_markRead(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsMessageController_markRead, request, response });
            const controller = new MessageController_1.MessageController();
            await templateService.apiHandler({
                methodName: 'markRead',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsAuthController_register = {
        body: { "in": "body", "name": "body", "required": true, "ref": "RegisterRequest" },
        req: { "in": "request", "name": "req", "required": true, "dataType": "object" },
    };
    app.post('/auth/register', ...((0, runtime_1.fetchMiddlewares)(AuthController_1.AuthController)), ...((0, runtime_1.fetchMiddlewares)(AuthController_1.AuthController.prototype.register)), async function AuthController_register(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_register, request, response });
            const controller = new AuthController_1.AuthController();
            await templateService.apiHandler({
                methodName: 'register',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    const argsAuthController_login = {
        body: { "in": "body", "name": "body", "required": true, "ref": "LoginRequest" },
        req: { "in": "request", "name": "req", "required": true, "dataType": "object" },
    };
    app.post('/auth/login', ...((0, runtime_1.fetchMiddlewares)(AuthController_1.AuthController)), ...((0, runtime_1.fetchMiddlewares)(AuthController_1.AuthController.prototype.login)), async function AuthController_login(request, response, next) {
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        let validatedArgs = [];
        try {
            validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_login, request, response });
            const controller = new AuthController_1.AuthController();
            await templateService.apiHandler({
                methodName: 'login',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
            });
        }
        catch (err) {
            return next(err);
        }
    });
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    function authenticateMiddleware(security = []) {
        return async function runAuthenticationMiddleware(request, response, next) {
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            // keep track of failed auth attempts so we can hand back the most
            // recent one.  This behavior was previously existing so preserving it
            // here
            const failedAttempts = [];
            const pushAndRethrow = (error) => {
                failedAttempts.push(error);
                throw error;
            };
            const secMethodOrPromises = [];
            for (const secMethod of security) {
                if (Object.keys(secMethod).length > 1) {
                    const secMethodAndPromises = [];
                    for (const name in secMethod) {
                        secMethodAndPromises.push(expressAuthenticationRecasted(request, name, secMethod[name], response)
                            .catch(pushAndRethrow));
                    }
                    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
                    secMethodOrPromises.push(Promise.all(secMethodAndPromises)
                        .then(users => { return users[0]; }));
                }
                else {
                    for (const name in secMethod) {
                        secMethodOrPromises.push(expressAuthenticationRecasted(request, name, secMethod[name], response)
                            .catch(pushAndRethrow));
                    }
                }
            }
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
            try {
                request['user'] = await Promise.any(secMethodOrPromises);
                // Response was sent in middleware, abort
                if (response.writableEnded) {
                    return;
                }
                next();
            }
            catch (err) {
                // Show most recent error as response
                const error = failedAttempts.pop();
                error.status = error.status || 401;
                // Response was sent in middleware, abort
                if (response.writableEnded) {
                    return;
                }
                next(error);
            }
            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        };
    }
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
