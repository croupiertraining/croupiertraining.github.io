import { Game } from './gamebase.mjs';
import { RouletteLayout } from '../controls/roulettelayout.mjs';
import * as Random from '../random.mjs';

const defaults = {
    emptyBetFrequency: 0.4,
    moreThanOneFrequency: 0.3,
    maxStacks: 12,
    minPerStack: 1,
    maxPerStack: 10,
    maxTotal: 50
};


class Payout extends Game {
    constructor() {
        super({
            paneName: 'tableframe',
            settingsPaneName: 'SettingsPayout',
            mode: 'random',
            matrix: null,
            winningNumber: null,
            winningNumbers: [ 0, 5 ],
            winningBets: [ 'straight-up', 'split', 'street', 'corner', 'six-line' ],
            prevWinningNumber: null,
            emptyBetFrequency: 0.4,
            moreThanOneFrequency: 0.3,
            maxStacks: 12,
            // TODO validate min < max
            minPerStack: 1,
            maxPerStack: 10,
            maxTotal: 10,
        });

        this.layout = new RouletteLayout( () => this.refresh() );
    }

    $(id, doc) {
        return this.doc.getElementById( id );
    }

    reset() {
        for (const prop in defaults) {
            this[prop] = defaults[prop];
        }
    }

    next() {
        this.layout.clear();
        this.prevWinningNumber = this.winningNumber;
        this.winningNumber = Random.elem( this.winningNumbers );

        if ( this.mode == 'picture_bets' ) {
            this.matrix = this.layout.getAvailablePictureBets( this.winningNumber, this.maxStacks );

            let indices = Array.from( Array(this.matrix.length).keys() );
            indices.forEach( this.addChips, this );
        }
        else {
            this.matrix = this.layout.getAvailableBets( this.winningNumber, this.winningBets );
            this.generateRandomBets();
        }
    }

    redraw() {
        super.redraw();

        this.layout.highlightWinningNumber( this.winningNumber, this.prevWinningNumber );
    }

    checkAnswerCondition( answer ) {
        return Number.parseFloat(answer) == this.layout.payout;
    }

    setResult() {
        this.ctx.numpad.target.value = this.layout.payout;
    }

    generateRandomBets() {
        let indices = Array.from( Array(this.matrix.length).keys() );
        Random.shuffle( indices ).forEach( this.addRandomChips, this );

        // if all bets were skipped due to 'emptyBetFrequency'
        if ( this.layout.totalChipsCount == 0 ) {
            this.addChips( indices[0] );
        }
    }

    addRandomChips( randomIndex ) {
        if ( Math.random() < this.emptyBetFrequency ) {
            return;
        }

        if ( this.layout.totalStacksCount < this.maxStacks ) {
            this.addChips( randomIndex );
        }
    }

    addChips( index ) {
        let count = 1;

        if (
            this.maxPerStack > 1
            && Math.random() < this.moreThanOneFrequency
        ) {
            count += Random.int( 1, this.maxPerStack-1 );
        }


        let minFill = this.minPerStack - count;

        if ( minFill > 0 ) {
            count += minFill;
        }


        let totalCountDiff = this.maxTotal - this.layout.totalChipsCount - count;

        if ( totalCountDiff < 0 ) {
            count += totalCountDiff;
        }


        if ( count > 0 ) {
            let coords = this.matrix[index];
            this.layout.addStack( coords, count );
        }
    }
}

export { Payout };
