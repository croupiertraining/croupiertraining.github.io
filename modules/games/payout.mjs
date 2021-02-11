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
            payout: 0,
            totalChipsCount: 0,
            totalStacksCount: 0,
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

        this.layout = new RouletteLayout();
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
        this.payout = 0;
        this.totalStacksCount = 0;
        this.totalChipsCount = 0;

        this.prevWinningNumber = this.winningNumber;
        this.winningNumber = Random.elem( this.winningNumbers );

        this.matrix = this.layout.getAvailableBets( this.winningNumber, this.winningBets );
    }

    redraw() {
        super.redraw();
        this.layout.clearTable();
        this.layout.highlightWinningNumber( this.winningNumber, this.prevWinningNumber );
        this.generateBets();
    }

    checkAnswerCondition( answer ) {
        return Number.parseFloat(answer) == this.payout;
    }

    setResult() {
        this.ctx.numpad.target.value = this.payout;
    }

    generateBets() {
        let randomIndices = Random.shuffle(
            Array.from( Array(this.matrix.length).keys() )
        );
        randomIndices.forEach( this.addRandomChips, this );

        if ( this.totalChipsCount == 0 ) {
            this.addChips( randomIndices[0] );
        }
    }

    addRandomChips( randomIndex ) {
        if ( Math.random() < this.emptyBetFrequency ) {
            return;
        }

        if ( this.totalStacksCount < this.maxStacks ) {
            this.addChips( randomIndex );
            this.totalStacksCount++;
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


        let totalCountDiff = this.maxTotal - this.totalChipsCount - count;

        if ( totalCountDiff < 0 ) {
            count += totalCountDiff;
        }


        if ( count > 0 ) {
            let coords = this.matrix[index];
            this.layout.addChip( coords, count );
            this.payout += count * this.layout.bets.getMultiplier( coords );
            this.totalChipsCount += count;
        }
    }
}

export { Payout };
