import { 
    Component,
    OnInit,
    OnDestroy,
    Input
} from '@angular/core';
import { Subscription } from 'rxjs/Subscription';

import { AppComponent } from '../component/app.component';

@Component({
    moduleId: module.id,
    selector: 'landing-hero',
    templateUrl: '../template/view/landing-hero.view.html'
})
export class LandingHeroView implements OnInit, OnDestroy {

    @Input() showContent: boolean = true;
    @Input() improv: boolean = false;
    @Input() video: boolean = true;

    videoId = "JyI4c_RJBxM";

    bgheight: number;
    bgwidth: number;
    bgleft: number;
    bgtop: number;

    YT = (<any>window).YT;
    player: any;
    playbackSpeed: number = 0.4;
    currentTime: number;

    scrollSubscription: Subscription;

    whiteBracketTop: number;
    whiteBracketBottom: number;
    
    toolbarheight = 48;
    pageStart = window.innerHeight - (this.toolbarheight + 24);
    pagepos: number = this.pageStart;

    constructor(
        private _app: AppComponent
    ) { }

    ngOnInit(): void {
        this.setupSize();

        this.scrollSubscription = this._app.onScroll$.subscribe(scrollPos => {
            this.pagepos = this.pageStart - scrollPos;

            if (this.pagepos > 20 || (scrollPos > this.whiteBracketTop && scrollPos < this.whiteBracketBottom)) {
                this._app.showWhiteBrackets(true);
            } else {
                this._app.showWhiteBrackets(false);
            }
        });
        this._app.showWhiteBrackets(true);
    }

    ngOnDestroy(): void {
        this.scrollSubscription.unsubscribe();
    }

    scrollBelowLanding(): void {
        this._app.scrollTo(this.pageStart - 10, 800);
    }

    setupSize(): void {
        let targetRatio = 1920 / 1080,
            screenRatio = window.innerWidth / window.innerHeight;

        if (targetRatio >= screenRatio) {
            this.bgheight = window.innerHeight;
            this.bgwidth = 1920 * (this.bgheight / 1080);
            this.bgtop = 0;
            this.bgleft = (this.bgwidth - window.innerWidth) / 2;
        } else {
            this.bgwidth = window.innerWidth;
            this.bgheight = 1080 * (this.bgwidth / 1920);
            this.bgtop = (this.bgheight - window.innerHeight) / 2;
            this.bgleft = 0;
        }

        if (window.innerWidth < 768) {
            // don't do video on tablet or mobile
            if (this.player) {
                this.player.getIframe().remove();
                this.player = null;
            }
        } else {
            if (!this.player) {
                this.initVideoBG();
            } else {
                this.resizeVideo();
            }
        }

        let heroes = document.querySelectorAll('.hero');
        for (let i = 0; i < heroes.length; i++) {
            let h = heroes[i];
            let rect = h.getBoundingClientRect();

            // FIXME:
            this.whiteBracketTop = rect.top;
            this.whiteBracketBottom = rect.bottom;
        }
    }

    initVideoBG(): void {

        if (!this.video) {
            return;
        }

        var currentTime = null;

        if (window.innerWidth < 768) {
            return;
        }
            
        if (this.YT.loaded !== 1) {
            setTimeout(() => this.initVideoBG(), 500);
        } else {
        
            let frameCallback = () => {
                if (!this.player) {
                    return;
                }

                if (!this.currentTime){
                    // restart the player
                    if (this.player.getCurrentTime() + 0.1 >= this.player.getDuration()) {
                        this.currentTime = this.player.getCurrentTime();
                        this.player.pauseVideo();
                        this.player.seekTo(0);
                    }
                } else if (this.player.getCurrentTime() < this.currentTime) {
                    this.currentTime = null;
                    this.player.playVideo()
                }
                
                requestAnimationFrame(frameCallback)
            };

            this.player = new this.YT.Player(
                'player',
                {
                    height: "315",
                    width: "560",
                    videoId: this.videoId,
                    playerVars: {
                        autohide: 1,
                        autoplay: 0,
                        controls: 0,
                        enablejsapi: 1,
                        iv_load_policy: 3,
                        loop: 0,
                        modestbranding: 1,
                        playsinline: 1,
                        rel: 0,
                        showinfo: 0,
                        wmode: "opaque"
                    },
                    events: {
                        onReady: () => {
                            //this.syncPlayer(); scale the video and set the speed

                            this.resizeVideo();

                            this.player.setPlaybackRate(this.playbackSpeed);

                            this.player.mute();
                            this.player.playVideo();
                        },
                        onStateChange: (newstate: any) => {
                            //console.log('new state', newstate);

                            let player = this.player,
                                iframe = player.getIframe(),
                                totalLength = player.getDuration() / this.playbackSpeed;

                            if (newstate.data === this.YT.PlayerState.BUFFERING 
                                && 1 !== player.getVideoLoadedFraction() 
                                    && (0 === player.getCurrentTime() || player.getCurrentTime() > totalLength - -0.1)) {

                                // this.logger("BUFFERING")
                                // this.autoPlayTestTimeout();

                            } else if (newstate.data === this.YT.PlayerState.PLAYING) {

                                this.player.getIframe().style.opacity = 1;
                                
                                requestAnimationFrame(frameCallback)

                            } else if (newstate.data === this.YT.PlayerState.ENDED) {

                                player.playVideo()

                            }
                        }
                    }
                });

        } // end of if YT is loaded yet

    } // end of initVideoBG

    resizeVideo(): void {
        let iframe = this.player.getIframe();

        iframe.style.width = this.bgwidth + 'px';
        iframe.style.height = this.bgheight + 'px';
        iframe.style.left = '-' + this.bgleft + 'px';
        iframe.style.top = '-' + this.bgtop + 'px';
    } 
}
