import * as Random from '../random.mjs';

const betMultiplier = {
    'straight-up': 35,
    'split': 17,
    'street': 11,
    'corner': 8,
    'six-line': 5
};

const stacksPerPictureBet = {
    deck: 2,
    deck_moved: 2,
    mickey_mouse: 3,
    cross: 5,
    dinner_for_two: 3,
    corner_pocket: 2,
    pb13: 2,
    pb19: 2,
    pb33: 3,
    pb42: 3,
    pb54: 6,
    jesus: 3,
    double_jesus: 6,
    pb60: 3,
    x_pattern: 5,
    pb68: 4,
    pb77: 4,
    t_pattern: 4,
    pb88: 8,
    pb90: 6,
    pb100: 8,
    pb101: 7,
    pb102: 6,
    pb123: 9,
    pb135: 9,
    pb156: 12,
    pb73: 5,
    pb81: 6,
    pb99: 6,
    pb116: 7,
    pb129: 9,
    pb130: 11,
    pb141: 9,
    pb165: 12
};

async function loadData() {
    const response = await fetch('/data/roulette.json');
    return await response.json();
}

class Bets {
    constructor() {
        this.tables = [];
        this.wantedTypes = null;
    }

    load( onLoad ) {
        loadData().then( onLoad );
    }

    getCoordsFor( winningNumber, types ) {
        this.wantedTypes = types;

        let number = this.tables.numbers[ winningNumber ];
        let coords = this._iterateMatrix(
            this.tables[number.matrix],
            number.offset
        );

        return coords.filter( this.byType, this );
    }

    getPictureBetsFor( winningNumber, maxStacks ) {
        let number = this.tables.numbers[ winningNumber ];
        let pictureBetsForNumber = this.tables.picture_bets[ winningNumber ];
        // TODO filter by type
        let availablePictureBetsTypes = Object.keys( pictureBetsForNumber ).filter( bet => {
            return stacksPerPictureBet[ bet ] <= maxStacks;
        } );
        let betName = Random.elem( availablePictureBetsTypes );
        let pictureBets = pictureBetsForNumber[ betName ];
        let transposition = Random.elem( pictureBets || [] );

        return this._iterateMatrix( transposition, number.offset );
    }

    getMultiplier( coords ) {
        return this.tables.multipliers[ coords[1] ][ coords[0] ];
    }

    _iterateMatrix( matrix, xOffset ) {
        let coords = [];

        for (let i=0; i<matrix.length; i++) {
            const row = matrix[i];

            for (let j=0; j<row.length; j++) {
                if (row[j] == 1) {
                    coords.push( [j + xOffset, i] );
                }
            }
        }

        return coords;
    }

    byType( coords ) {
        if ( this.wantedTypes === null || this.wantedTypes === undefined ) {
            return true;
        }

        let multiplier = this.getMultiplier( coords );
        let found = this.wantedTypes.indexOf( multiplier );

        return found >= 0;
    }
}


class SvgElem {
    constructor( type, attrs, textContent ) {
        let elem = document.createElementNS("http://www.w3.org/2000/svg", type);

        for (let attr in attrs) {
            elem.setAttribute(attr, attrs[attr]);
        }

        if ( textContent != null ) {
            elem.textContent = textContent;
        }

        return elem;
    }
}


class Chip {
    constructor( coords, count ) {
        this.coords = coords;
        this.count = count;
    }

    toSvgElems() {
        let coords = this.svgCoords;

        let elems = [
            new SvgElem("circle", {
                cx: coords[0],
                cy: coords[1],
                r: 5.75,
                fill: "url(#chipGradient)",
                stroke: "brown",
                "stroke-width": 0.4
            })
        ];

        if ( this.count > 1 ) {
            elems.push( new SvgElem("text", {
                x: coords[0],
                y: coords[1] + 2.75,
                "text-anchor": "middle"
            }, this.count) );
        }

        return elems;
    }

    get svgCoords() {
        return [
            17.5 + this.coords[0] * 12.5,
            12   + this.coords[1] * 15.5
        ];
    }
}


class RouletteLayout {
    constructor( onLoad ) {
        this.chips = document.querySelector('#chips');
        this.bets = new Bets();

        this.bets.load( data => {
            this.bets.tables = data;
            onLoad();
        } );

        this.reset();
    }

    getAvailableBets( winningNumber, types ) {
        return this.bets.getCoordsFor( winningNumber,
            types.map( elem => betMultiplier[ elem ]) );
    }

    getAvailablePictureBets( winningNumber, maxStacks ) {
        return this.bets.getPictureBetsFor( winningNumber, maxStacks );
    }

    reset() {
        this.payout = 0;
        this.totalChipsCount = 0;
        this.totalStacksCount = 0;
    }

    clear() {
        this.reset();

        let chips = document.querySelector('#chips');
        while (chips.firstChild) {
            chips.removeChild( chips.firstChild );
        }
    }

    addStack( coords, count ) {
        let chip = new Chip( coords, count );
        this.chips.append( ...chip.toSvgElems() );

        this.payout += count * this.bets.getMultiplier( coords );
        this.totalChipsCount += count;
        this.totalStacksCount++;
    }

    highlightWinningNumber( newNum, prevNum ) {
        let numColor = {
            0: 'none',
            1: '#b00',
            2: '#000',
            3: '#b00',
            4: '#000',
            5: '#b00',
            6: '#000'
        };

        let frame = 'number' + newNum.toString() + 'frame';
        if ( newNum == 0 ) {
            frame = 'zeroFrame';
        }

        let prevFrame = null;
        if ( prevNum !== null ) {
            prevFrame = 'number' + prevNum.toString() + 'frame';
        }
        if ( prevNum == 0 ) {
            prevFrame = 'zeroFrame';
        }

        if ( prevFrame !== null ) {
            document.querySelector(`#${prevFrame}`).setAttribute('fill', numColor[prevNum]);
        }
        document.querySelector(`#${frame}`).setAttribute('fill', 'url(#winning' + newNum.toString() + 'Gradient)');
    }
}

export { RouletteLayout };
