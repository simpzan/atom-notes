'use babel';

const EventEmitter = require('events').EventEmitter

class SearchBar extends EventEmitter {
    createView() {
        const input = this.input = document.createElement('input');
        input.classList.add('input-text');
        this.input.addEventListener('keyup', e => {
            this.emit('keyup', e);
            const keyCode = e.keyCode;
            const UP = 38, DOWN = 40, ENTER = 13;
            if (keyCode === UP) {
                this.emit('navigate', -1);
            } else if (keyCode === DOWN) {
                this.emit('navigate', 1);
            } else if (keyCode === ENTER) {
                this.emit('enterPressed', this.value);
            } else {
                this.emit('valueChanged', this.value);
            }
        });
        return input;
    }

    focus() {
        this.input.focus();
        this.input.focus();
    }
    get value() {
        return this.input.value;
    }
    set value(value) {
        this.input.value = value;
    }

    getElement = () => this.input
    getTitle = () => 'SearchBar'

}

module.exports = SearchBar;
