import { OpaqueToken } from '@angular/core';

export const CONFIG_TOKEN = new OpaqueToken('config');
export const MOBILE_WIDTH = 500;
export const API = {
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
    packageConfig: '/packageConfig',

    package: '/api/package',
    materials: '/api/material',
    validateTeam: '/api/team/validate',

    updateUser: function(id:string) {
        return this.user + '/' + id;
    },
    userPreference: function(id:string) {
        return this.updateUser(id) + '/preference'
    },

    teamInvite: function(teamId: string): string {
        return `${this.getTeam(teamId)}/invite`;
    },
    removeUser: function(teamId: string, userId: string): string {
        return `${this.getTeam(teamId)}/removeUser/${userId}`;
    },
    promoteUser: function(teamId: string, userId: string): string {
        return `${this.getTeam(teamId)}/promote/${userId}`;
    },
    demoteUser: function(teamId: string, userId: string): string {
        return `${this.getTeam(teamId)}/demote/${userId}`;
    },
    teamPurchases: function(teamId: string): string {
        return `${this.getTeam(teamId)}/purchases`;
    },
    teamSubscription: function(teamId: string): string {
        return `${this.getTeam(teamId)}/subscription`;
    },

    cancelInvite: function(inviteId: string) {
        return this.invite + '/' + inviteId;
    },
    acceptInvite: function(userId: string, inviteId: string) {
        return `${this.user}/${userId}/acceptInvite/${inviteId}`;
    },
    leaveTeam: function(userId: string, teamId: string): string {
        return `${this.user}/${userId}/leaveTeam/${teamId}`;
    },
    userPurchases: function(userId: string) {
        return `${this.user}/${userId}/purchases`;
    },
    userSubscription: function(userId: string) {
        return `${this.user}/${userId}/subscription`;
    },

    games: '/api/game',
    names: '/api/name',
    metadata: '/api/metadata',
    playerCount: '/api/metadata/playerCount',
    duration: '/api/metadata/duration',
    tags: '/api/tag',
    notes: '/api/note',

    getGame: function(gameId: string): string {
        return `${this.games}/${gameId}`;
    },
    getName: function(nameId: string): string {
        return `${this.names}/${nameId}`;
    },
    gameAddTag: function(gameId: string, tagId: string): string {
        return `${this.getGame(gameId)}/addTag/${tagId}`
    },
    gameRemoveTag: function(gameId: string, tagId: string): string {
        return `${this.getGame(gameId)}/removeTag/${tagId}`
    },
    gameCreateTag: function(gameId: string, tag: string): string {
        return `${this.getGame(gameId)}/createTag/${tag}`;
    },
    gameNotes: function(gameId: string): string {
        return `${this.getGame(gameId)}/notes`;
    },

    getTag: function(tagId: string): string {
        return `${this.tags}/${tagId}`;
    },

    getNote: function(noteId: string): string {
        return `${this.notes}/${noteId}`;
    },

    history: '/api/history',

    userMaterials: function(userId: string): string {
        return `${this.updateUser(userId)}/materials`;
    },
    teamMaterials: function(teamId: string): string {
        return `${this.getTeam(teamId)}/materials`;
    },

    team: '/api/team',
    getTeam: function(teamId: string): string {
        return `${this.team}/${teamId}`;
    },

    getMaterial: function(id: string): string {
        return `${this.materials}/${id}`;
    },

    getPackage: function(id: string): string {
        return `${this.package}/${id}`;
    },

    materialVersion: function(id: string): string {
        return `${this.getMaterial(id)}/version`
    },
    getMaterialVersion: function(materialId: string, versionId: string): string {
        return `${this.getMaterial(materialId)}/version/${versionId}`;
    },

    savePackagePackages: function(packageId: string): string {
        return `${this.getPackage(packageId)}/packages`;
    },
    savePackageMaterials: function(packageId: string): string {
        return `${this.getPackage(packageId)}/materials`;
    }

}

export const PREFERENCE_KEYS = {
    showPublicNotes: 'show-public-notes',
    showPrivateNotes: 'show-private-notes',
    showTeamNotes: 'show-team-notes',
    shareNotesWithTeam: 'share-notes'
}