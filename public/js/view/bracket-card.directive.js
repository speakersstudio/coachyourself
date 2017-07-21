"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = require("@angular/core");
var BracketCardDirective = (function () {
    function BracketCardDirective(el) {
        this.card = el.nativeElement;
    }
    BracketCardDirective.prototype.ngOnInit = function () {
        this._saveDimens();
        this.isOpen = true;
    };
    BracketCardDirective.prototype._saveDimens = function () {
        this.card.dataset.width = this.card.offsetWidth.toString();
        this.card.dataset.height = this.card.offsetHeight.toString();
    };
    BracketCardDirective.prototype.close = function (delay) {
        var _this = this;
        delay = delay || 10;
        this._saveDimens();
        setTimeout(function () {
            if (window.innerWidth < 500) {
                _this._closeVertical();
            }
            else {
                _this._closeHorizontal();
            }
            _this.isOpen = false;
        }, delay);
    };
    BracketCardDirective.prototype._closeVertical = function () {
        var _this = this;
        var children = this.card.children;
        var _loop_1 = function (i) {
            var child = children[i];
            setTimeout(function () {
                child.style.opacity = '0';
            }, 10);
        };
        for (var i = 0; i < children.length; i++) {
            _loop_1(i);
        }
        this.card.style.height = this.card.offsetHeight + 'px';
        this.card.style.overflow = 'hidden';
        setTimeout(function () {
            _this.card.style.height = '0px';
            _this.card.style.opacity = '0.5';
        }, 10);
    };
    BracketCardDirective.prototype._closeHorizontal = function () {
        var _this = this;
        var children = this.card.children;
        var _loop_2 = function (i) {
            var child = children[i];
            child.style.width = child.offsetWidth + 'px';
            child.style.boxSizing = 'border-box';
            child.style.transform = 'translateX(-50%)';
            child.style.marginLeft = '50%';
            setTimeout(function () {
                child.style.opacity = '0';
            }, 10);
        };
        for (var i = 0; i < children.length; i++) {
            _loop_2(i);
        }
        this.card.style.width = this.card.offsetWidth + 'px';
        this.card.style.overflow = 'hidden';
        setTimeout(function () {
            _this.card.style.flexGrow = '0';
            _this.card.style.width = '0px';
            _this.card.style.opacity = '0.5';
        }, 10);
    };
    BracketCardDirective.prototype.open = function (delay) {
        var _this = this;
        delay = delay || 10;
        if (this.card.style.height !== '0px' && this.card.style.width !== '0px') {
            return;
        }
        setTimeout(function () {
            var height = _this.card.dataset.height, width = _this.card.dataset.width, children = _this.card.children;
            var _loop_3 = function (i) {
                var child = children[i];
                child.style.opacity = '0';
                setTimeout(function () {
                    child.style.opacity = '1';
                }, 200);
            };
            for (var i = 0; i < children.length; i++) {
                _loop_3(i);
            }
            _this.card.style.overflow = 'hidden';
            setTimeout(function () {
                _this.card.style.height = height + 'px';
                _this.card.style.width = width + 'px';
                _this.card.style.opacity = '1';
                setTimeout(function () {
                    _this.card.style.flexGrow = '';
                    _this.card.style.width = '';
                    _this.card.style.height = '';
                    _this.card.style.overflow = '';
                }, 500);
            }, 10);
            _this.isOpen = true;
        }, delay);
    };
    return BracketCardDirective;
}());
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], BracketCardDirective.prototype, "error", void 0);
__decorate([
    core_1.Input(),
    __metadata("design:type", String)
], BracketCardDirective.prototype, "key", void 0);
BracketCardDirective = __decorate([
    core_1.Directive({
        selector: '[bracketCard]'
    }),
    __metadata("design:paramtypes", [core_1.ElementRef])
], BracketCardDirective);
exports.BracketCardDirective = BracketCardDirective;

//# sourceMappingURL=bracket-card.directive.js.map
