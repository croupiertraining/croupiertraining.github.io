class ToggleBase {
    constructor( params ) {
        let that = this;

        this.group = params.group;

        this.checkbox = params.ref;
        this.checkbox.checked = params.checked;
        this.checkbox.onchange = ev => {
            that.checked = ev.target.checked;
        };
    }

    get checked() {
        return this.checkbox.checked;
    }

    set checked( checked ) {
        if ( checked ) {
            this.checkbox.checked = 'checked';
            this.markChecked();
        }
        else {
            this.checkbox.checked = '';
            this.markUnchecked();
        }
    }

    set label( label ) {
        this.checkbox.labels[0].textContent = label;
    }

    markChecked() {
        this.checkbox.labels[0].classList.add('checked');
    }

    markUnchecked() {
        this.checkbox.labels[0].classList.remove('checked');
    }
}


class Radio extends ToggleBase {
    constructor( params ) {
        super( params );
        this.gameRef = params.gameRef;
        this.setting = params.setting;

        this.group = this.checkbox.name;
    }

    set checked( checked ) {
        super.checked = checked;
        this.gameRef[ this.setting ] = this.value;

        this.markOthersUnchecked();
    }

    get value() {
        return this.checkbox.value;
    }

    markOthersUnchecked() {
        let radios = document.getElementsByName( this.group );

        for ( let i = 0; i < radios.length; i++ ) {
            let radio = radios[i];

            if ( !radio.checked ) {
                radio.labels[0].classList.remove('checked');
            }
        }
    }

    static attachEventsFor( params ) {
        new Radio( params );
    }
}


class Toggle extends ToggleBase {
    constructor( params ) {
        super( params );

        this.parseLabel = params.parseLabel;
    }

    set checked( checked ) {
        super.checked = checked;

        if ( checked ) {
            this.addToGroup();
        }
        else {
            this.removeFromGroup();
        }
    }

    get label() {
        let label = this.checkbox.labels[0].textContent;

        if ( typeof this.parseLabel == 'function' ) {
            return this.parseLabel( label );
        }

        return label;
    }

    addToGroup() {
        this.group.add( this.label );
    }

    removeFromGroup() {
        this.group.remove( this.label );
    }
}


class ToggleAll extends ToggleBase {
    constructor( params ) {
        super( params );

        if ( params.checked ) {
            this.label = 'select none';
        }
    }

    set checked( checked ) {
        super.checked = checked;

        if ( checked ) {
            this.group.checkAll( true );
        }
        else {
            this.group.checkAll( false );
        }
    }
}


class ToggleGroup {
    constructor( params ) {
        this.array = params.array;
        this.toggles = [];
    }

    static attachEventsFor( params ) {
        new ToggleGroup( params ).attachEvents( params );
    }

    attachEvents( params ) {
        this.fillToggles( params );
        this.fillToggleAll( params );
    }

    fillToggles( params ) {
        let checkboxes = document.getElementsByName( params.name );

        for ( let i = 0; i < checkboxes.length; i++ ) {
            let label = checkboxes[i].labels[0].textContent;
            let checked = false;
            let btParams = params.buttons ? params.buttons : {};

            if ( btParams._default ) {
                checked = btParams._default;
            }

            if ( btParams[label] ) {
                checked = btParams[label].checked;
            }

            this.toggles.push(new Toggle({
                ref: checkboxes[i],
                group: this,
                checked: checked,
                parseLabel: params.parseLabel
            }));
        }
    }

    fillToggleAll ( params ) {
        let name = params.name.replace('toggle-', 'toggle-all-');
        let elems = document.getElementsByName( name );

        if ( elems.length > 0 ) {
            let btParams = params.buttons ? params.buttons : {};
            let checked = btParams.toggleAll ? btParams.toggleAll.checked : false;

            this.toggleAll = new ToggleAll({
                ref: elems[0],
                group: this,
                checked: checked
            });
        }
    }

    add( toggle ) {
        this.array.push( toggle );
    }

    remove( toggle ) {
        let i = this.array.indexOf( toggle );
        this.array.splice( i, 1 );
    }

    checkAll( checked ) {
        if ( checked ) {
            this.array.length = 0;
            this.toggleAll.label = 'select none';
        }
        else {
            this.toggleAll.label = 'select all';
        }

        for ( let toggle of this.toggles ) {
            toggle.checked = checked;
        }
    }
}

export { Radio, ToggleGroup };
