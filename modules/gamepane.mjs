class GamePane {
    constructor( refs ) {
        for ( const [key, val] of Object.entries(refs) ) {
            this[key] = val;
        }

        this.currentHook = 'roulette_payout';
        this.games = {};
    }

    add( game ) {
        game.o.ctx = this;
        this.games[ game.name ] = game.o;
    }

    get currentGame() {
        return this.game( this.currentHook );
    }

    game( hook ) {
        return this.games[hook];
    }

    showPane( game ) {
        let paneElem = this.$( game.paneName );
        paneElem.classList.remove('hidden');
    }

    hidePane( game ) {
        let paneElem = this.$( game.paneName );
        paneElem.classList.add('hidden');
    }

    $(id, doc) {
        return document.querySelector(`#${id}`);
    }

    switchPane( hook ) {
        this.hidePane( this.currentGame );
        this.currentGame.onPaneHide();

        this.currentHook = hook;

        this.showPane( this.currentGame );
        this.currentGame.onPaneShow();
        this.currentGame.refresh();
    }
}

export { GamePane };
