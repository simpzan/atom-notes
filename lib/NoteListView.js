'use babel';
const log = console.info.bind(console, "NoteListView");

const {repoPath} = require('./utils');
const DocQuery = require("docquery");
const docQuery = this.docQuery = new DocQuery(repoPath, {recursive: true});

const EventEmitter = require('events').EventEmitter

class NoteListView extends EventEmitter {
    constructor() {
        super();
        this.createView();
        docQuery.on('ready', () => {
            this._reload()
            this.emit('loaded');
        });
        docQuery.on('added', () => this._reload())
        docQuery.on('updated', () => this._reload())
        docQuery.on('removed', () => this._reload())
    }
    createView() {
        const noteListView = this.noteListView = document.createElement('ul');
        noteListView.classList.add('list-group');
        this.noteListView.addEventListener('click', e => {
            let item = e.target;
            if (item.nodeName !== 'LI') item = item.parentElement;
            const path = item.id;
            this.emit('noteClicked', path);
        });
    }

    navigate(direction) {
        const notes = this.notes, selected = this.selected;
        const count = notes.length;
        let index = notes.findIndex(note => note.filePath === selected);
        index = (index + direction + count) % count;
        const newSelectedNote = notes[index];
        const path = newSelectedNote.filePath;
        this.selected = path;
        return path;
    }
    get selected() {
        return this.selectedNote;
    }
    set selected(path) {
        this._selectNote(path);
    }

    _selectNote(path) {
        this.selectedNote = path;
        const items = [].slice.call(this.noteListView.children);
        items.forEach(item => {
            if (item.id === path) item.classList.add('selected');
            else item.classList.remove('selected');
        })
    }

    searchNotes(keyword) {
        this.keyword = keyword;
        return this._reload();
    }

    _reload() {
        const keyword = this.keyword
        const notes = this.notes = keyword ? docQuery.search(keyword) : docQuery.documents
        this._setNotes(notes)
        return notes;
    }
    _setNotes(notes) {
        this.noteListView.innerHTML = notes.map(doc => {
          return `<li class='list-item' id='${doc.filePath}'>
            <span class='icon icon-file-text'>${doc.fileName}</span>
          </li>`
        }).join('\n');
    }


    getElement = () => this.noteListView
    getTitle = () => 'NoteListView'

}

module.exports = NoteListView;
