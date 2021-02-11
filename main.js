import { GamePane } from "./modules/gamepane.mjs";
import { ModalList } from "./modules/modallist.mjs";
import { DynamicRange } from "./modules/controls/dynamicrange.mjs";
import { Numpad } from "./modules/numpad.mjs";
import * as Games from "./modules/games.mjs";


let modals = new ModalList();
let numpad = new Numpad("answer");


// TODO validate min < max
let drSeriesMinBet = new DynamicRange({
    inputID: 'settings-series-minBet',
    previewID: 'preview-series-minBet',
    ranges: [
        {
            type: '==',
            value: -1,
            returnValue: null
        },
        {
            type: '==',
            value: 0,
            returnValue: 50
        },
        {
            type: '>',
            value: 20,
            returnValue: function(val) {
                return 2000 + 1000 * (val % 20);
            }
        },
        {
            type: 'default',
            returnValue: function(val) {
                return val * 100;
            }
        }
    ],
    // TODO add thousand separator
    labels: [
        {
            type: '==',
            value: null,
            returnValue: 'series minimum'
        },
        {
            type: 'default',
            returnValue: function(val) {
                return val.toString();
            }
        }
    ]
});

// TODO validate min < max
let drSeriesMaxBet = new DynamicRange({
    inputID: 'settings-series-maxBet',
    previewID: 'preview-series-maxBet',
    initialValue: 500,
    ranges: [
        {
            type: '==',
            value: 0,
            returnValue: 50
        },
        {
            type: '>',
            value: 20,
            returnValue: function(val) {
                return 2000 + 1000 * (val % 20);
            }
        },
        {
            type: 'default',
            returnValue: function(val) {
                return val * 100;
            }
        }
    ]
});

let drSeriesStep = new DynamicRange({
    inputID: 'settings-series-step',
    previewID: 'preview-series-step',
    initialValue: 10,
    steps: [5, 10, 25, 50, 100, 250, 500, 1000]
});

let series = new Games.Series({
    minBet: drSeriesMinBet,
    maxBet: drSeriesMaxBet,
    step: drSeriesStep
});

let bj = new Games.BlackJack();
let svgTable = new Games.Payout();

let gamePane = new GamePane({
    numpad: numpad
});

let games = {
    roulette_payout: svgTable,
    roulette_series: series,
    blackjack_payout: bj
};

for ( const [name, o] of Object.entries(games) ) {
    gamePane.add({
        name: name,
        o: o
    });
}


function $( id ) {
    return document.querySelector(`#${id}`);
}

function openSettings() {
    modals.show( gamePane.currentGame.settingsPaneName );
}

function attachEvents() {
    attachSettingsEvents();
    attachToggleGroupEvents({
        name: 'toggle-series-selectedSeries',
        array: series.selectedSeries,
        setInitialValue: function( checkbox ) {
            checkbox.checked = true;
        }
    });
    attachToggleGroupEvents({
        name: 'toggle-payout-winningNumbers',
        array: svgTable.winningNumbers,
        setInitialValue: function( checkbox ) {
            switch (checkbox.labels[0].textContent) {
                case "0":
                case "5":
                    checkbox.checked = true;
                    break;
                default:
                    checkbox.checked = false;
            }
        },
        parseLabel: function( label ) {
            return Number.parseInt( label );
        }
    });
    attachToggleGroupEvents({
        name: 'toggle-payout-winningBets',
        array: svgTable.winningBets,
        setInitialValue: function( checkbox ) {
            checkbox.checked = true;
        }
    });
    attachMenuHooks();
    attachNumpadEvents();
    attachKeyboardShortcuts();
}

function attachSettingsEvents() {
    attachSettingsEventsFor( 'payout', svgTable );
    attachSettingsEventsFor( 'bj', bj );
}

function attachSettingsEventsFor( pane, obj ) {
    let settingInputs = document.getElementsByName(`settings-${pane}`);

    for ( let i = 0; i < settingInputs.length; i++ ) {
        let input = settingInputs[i];
        let settingName = input.id.substring('settings-'.length + pane.length + '-'.length);
        let preview = $(`preview-${pane}-${settingName}`);

        input.value = obj[settingName];

        if ( preview != null ) {
            input.oninput = function(ev) {
                preview.textContent = ev.target.value;
            }
        }

        input.onchange = function(ev) {
            obj[settingName] = Number.parseFloat( ev.target.value );
        }
    }
}

function attachToggleGroupEvents( params ) {
    let checkboxes = document.getElementsByName( params.name );

    for ( let i = 0; i < checkboxes.length; i++ ) {
        let checkbox = checkboxes[i];

        // revert after page soft reload
        if ( params.hasOwnProperty('setInitialValue') ) {
            params.setInitialValue( checkbox );
        }

        checkbox.onchange = function( ev ) {
            let s = ev.target.labels[0].textContent;

            if ( params.hasOwnProperty('parseLabel') ) {
                s = params.parseLabel( s );
            }

            if ( ev.target.checked ) {
                params.array.push( s );
                ev.target.parentNode.classList.add("checked");
            }
            else {
                let i = params.array.indexOf( s );
                params.array.splice( i, 1 );
                ev.target.parentNode.classList.remove("checked");
            }
        }
    }
}

function attachMenuHooks() {
    let menuItems = $("modalMenu").getElementsByTagName("dd");

    for ( let i = 0; i < menuItems.length; i++ ) {
        let menuItem = menuItems[i];

        if ( menuItem.dataset.hasOwnProperty("hook") ) {
            menuItem.onclick = function( ev ) {
                let hook = ev.target.dataset.hook;

                gamePane.switchPane( hook );

                modals.hideCurrent();
            };
        }
    }
}

function attachNumpadEvents() {
    let numkeys = document.getElementsByClassName("numkey");

    for ( let i = 0; i < numkeys.length; i++ ) {
        let numkey = numkeys[i];
        numkey.onclick = function( ev ) {
            numpad.append( ev.target.textContent );
        };
    }

    $("btC").onclick = function() {
        numpad.clear();
    };
    $("btDel").onclick = function() {
        if ( gamePane.currentHook == "blackjack_payout" ) {
            numpad.append(".5");
        }
        else {
            numpad.del();
        }
    };

    let submitButtons = document.getElementsByName("submit");

    for ( let i = 0; i < submitButtons.length; i++ ) {
        submitButtons[i].onclick = function( ev ) {
            gamePane.currentGame.checkAnswer();
        };
    }

    $("btNPSettings").onclick = openSettings;
    $("btNPResult").onclick = function() {
        gamePane.currentGame.showResult();
    };
    $("btNPNext").onclick = function() {
        gamePane.currentGame.refresh();
    };
}


function attachKeyboardShortcuts() {
    window.onkeydown = function(ev) {
        if ( modals.isAnyOpen() ) {
            if ( ev.key == "Escape" ) {
                modals.hideCurrent();
            }
        }
        else {
            switch ( ev.key ) {
                case "Enter":
                    gamePane.currentGame.checkAnswer();
                    break;
                case " ":
                    gamePane.currentGame.refresh();
                    break;
                case "i":
                    modals.show("About");
                    break;
                case "s":
                    openSettings();
                    break;
                case "k":
                    modals.show("Shortcuts");
                    break;
                case "c":
                    gamePane.switchPane("roulette_series");
                    break;
                case "p":
                    gamePane.switchPane("roulette_payout");
                    break;
                case "b":
                    gamePane.switchPane("blackjack_payout");
                    break;
                case "r":
                case "a":
                case "?":
                case "*":
                    gamePane.currentGame.showResult();
                    break;
                case "Delete":
                    numpad.clear();
                    break;
                case "Backspace":
                    numpad.del();
                    break;
                case "ArrowUp":
                    numpad.increment();
                    break;
                case "ArrowRight":
                    numpad.increment(10);
                    break;
                case "ArrowDown":
                    numpad.decrement();
                    break;
                case "ArrowLeft":
                    numpad.decrement(10);
                    break;
                case ".":
                case ",":
                    if ( gamePane.currentHook == "blackjack_payout" ) {
                        numpad.append(".");
                    }
                    break;
                default:
                    if ( !isNaN(Number.parseInt(ev.key)) ) {
                        numpad.append( ev.key );
                    }
            }
        }

        return true;
    }
}

svgTable.doc = document;
svgTable.reset();

attachEvents();
