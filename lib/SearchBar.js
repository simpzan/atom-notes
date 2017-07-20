'use babel';
const log = console.info.bind(console, "SearchBar");

const EventEmitter = require('events').EventEmitter

class SearchBar extends EventEmitter {
    createView() {
        const input = this.input = document.createElement('input');
        input.classList.add('input-text');

        this.input.addEventListener('keyup', this.handleKeyEvent);
        return input;
    }

    handleKeyEvent = e => {
        const value = this.value;
        const fullKey = getModifier(e) + e.code;
        // log('event', fullKey, value);
        this.emit(fullKey, value);

        if (this._value !== value) {
            this._value = value
            this.emit('valueChanged', value);
        }

        function getModifier(e) {
            if (e.ctrlKey && e.shiftKey) return 'Ctrl+Shift+';
            else if (e.ctrlKey) return 'Ctrl+';
            else if (e.shiftKey) return 'Shift+';
            else return '';
        }
    }

    focus() {
        this.input.focus();
        this.input.focus();
    }
    select() {
        this.input.select();
    }
    get value() {
        return this.input.value;
    }
    set value(value) {
        this.input.value = value;
        this._value = value
    }

    getElement = () => this.input
    getTitle = () => 'SearchBar'

}

module.exports = SearchBar;
