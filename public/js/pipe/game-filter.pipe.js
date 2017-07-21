"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var GameFilter = (function () {
    function GameFilter() {
    }
    return GameFilter;
}());
exports.GameFilter = GameFilter;
var GameFilterPipe = (function () {
    function GameFilterPipe() {
    }
    GameFilterPipe.prototype.transform = function (value, args) {
        if (args) {
            return value.filter(function (game) {
                if (args.property == 'tagId') {
                    // this isn't a foreach because that won't handle the return properly
                    for (var tagIDIndex = 0; tagIDIndex < game.tags.length; tagIDIndex++) {
                        if (game.tags[tagIDIndex].tag._id == args.value) {
                            return true;
                        }
                    }
                    return false;
                }
                else {
                    return game[args.property] == args.value;
                }
            });
        }
        else {
            return value;
        }
    };
    return GameFilterPipe;
}());
GameFilterPipe = __decorate([
    core_1.Pipe({
        name: 'gameFilter'
    })
], GameFilterPipe);
exports.GameFilterPipe = GameFilterPipe;

//# sourceMappingURL=game-filter.pipe.js.map
