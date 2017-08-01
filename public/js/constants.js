"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
exports.CONFIG_TOKEN = new core_1.OpaqueToken('config');
exports.MOBILE_WIDTH = 500;
exports.API = {
    login: '/login',
    passwordRecovery: '/recoverPassword',
    passwordRecoveryTokenCheck: '/checkPasswordToken',
    passwordChange: '/changePassword',
    logout: '/logout',
    refresh: '/refreshToken',
    user: '/api/user',
    validateUser: '/api/user/validate',
    invite: '/api/invite',
    charge: '/charge',
    signup: '/signup',
    package: '/api/package',
    materials: '/api/material',
    validateTeam: '/api/team/validate',
    updateUser: function (id) {
        return this.user + '/' + id;
    },
    userPreference: function (id) {
        return this.updateUser(id) + '/preference';
    },
    teamInvite: function (teamId) {
        return this.getTeam(teamId) + "/invite";
    },
    removeUser: function (teamId, userId) {
        return this.getTeam(teamId) + "/removeUser/" + userId;
    },
    promoteUser: function (teamId, userId) {
        return this.getTeam(teamId) + "/promote/" + userId;
    },
    demoteUser: function (teamId, userId) {
        return this.getTeam(teamId) + "/demote/" + userId;
    },
    teamPurchases: function (teamId) {
        return this.getTeam(teamId) + "/purchases";
    },
    teamSubscription: function (teamId) {
        return this.getTeam(teamId) + "/subscription";
    },
    cancelInvite: function (inviteId) {
        return this.invite + '/' + inviteId;
    },
    acceptInvite: function (userId, inviteId) {
        return this.user + "/" + userId + "/acceptInvite/" + inviteId;
    },
    leaveTeam: function (userId, teamId) {
        return this.user + "/" + userId + "/leaveTeam/" + teamId;
    },
    userPurchases: function (userId) {
        return this.user + "/" + userId + "/purchases";
    },
    userSubscription: function (userId) {
        return this.user + "/" + userId + "/subscription";
    },
    games: '/api/game',
    names: '/api/name',
    metadata: '/api/metadata',
    playerCount: '/api/metadata/playerCount',
    duration: '/api/metadata/duration',
    tags: '/api/tag',
    notes: '/api/note',
    getGame: function (gameId) {
        return this.games + "/" + gameId;
    },
    getName: function (nameId) {
        return this.names + "/" + nameId;
    },
    gameAddTag: function (gameId, tagId) {
        return this.getGame(gameId) + "/addTag/" + tagId;
    },
    gameRemoveTag: function (gameId, tagId) {
        return this.getGame(gameId) + "/removeTag/" + tagId;
    },
    gameCreateTag: function (gameId, tag) {
        return this.getGame(gameId) + "/createTag/" + tag;
    },
    gameNotes: function (gameId) {
        return this.getGame(gameId) + "/notes";
    },
    getTag: function (tagId) {
        return this.tags + "/" + tagId;
    },
    getNote: function (noteId) {
        return this.notes + "/" + noteId;
    },
    history: '/api/history',
    userMaterials: function (userId) {
        return this.updateUser(userId) + "/materials";
    },
    teamMaterials: function (teamId) {
        return this.getTeam(teamId) + "/materials";
    },
    team: '/api/team',
    getTeam: function (teamId) {
        return this.team + "/" + teamId;
    },
    getMaterial: function (id) {
        return this.materials + "/" + id;
    },
    getPackage: function (id) {
        return this.package + "/" + id;
    },
    materialVersion: function (id) {
        return this.getMaterial(id) + "/version";
    },
    getMaterialVersion: function (materialId, versionId) {
        return this.getMaterial(materialId) + "/version/" + versionId;
    },
    savePackagePackages: function (packageId) {
        return this.getPackage(packageId) + "/packages";
    },
    savePackageMaterials: function (packageId) {
        return this.getPackage(packageId) + "/materials";
    }
};
exports.PREFERENCE_KEYS = {
    showPublicNotes: 'show-public-notes',
    showPrivateNotes: 'show-private-notes',
    showTeamNotes: 'show-team-notes',
    shareNotesWithTeam: 'share-notes'
};

//# sourceMappingURL=constants.js.map
