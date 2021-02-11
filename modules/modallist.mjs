class Modal {
    constructor( htmlElem ) {
        this.ref = htmlElem;
    }

    show() {
        this.ref.style.display = "flex";
    }

    hide() {
        this.ref.style.display = "none";
    }
}

class ModalList {
    constructor() {
        this.current = null;
        this.modals = {};
        let modals = document.getElementsByClassName("modal");
        let that = this;

        for ( let i = 0; i < modals.length; i++ ) {
            let modal = modals[i];

            // ids are `modal${Name}`, eg. "modalAbout"
            let name = modal.id.substr(5);
            this.modals[ name ] = new Modal(modal);

            let btn = document.querySelector(`#bt${name}`);
            let span = document.querySelector(`#btClose${name}`);

            if ( btn !== null ) {
                btn.onclick = function() {
                    that.show( name );
                };
            }

            span.onclick =  function() {
                that.hideCurrent();
            };
        }

        // When the user clicks anywhere outside of the modal, close it
        window.addEventListener('click', function(ev) {
            if ( ev.target.classList.contains("modal") ) {
                that.hideCurrent();
            }
            document.activeElement.blur();
        });
    }

    get( name ) {
        return this.modals[ name ];
    }

    show( name ) {
        this.get( name ).show();
        this.current = name;
    }

    hide( name ) {
        this.get( name ).hide();
    }

    hideCurrent() {
        this.hide( this.current );
        this.current = null;
    }

    isAnyOpen() {
        return this.current !== null;
    }
}

export { ModalList };
