'use babel';

const log = console.info.bind(console, "NotesView");

import { CompositeDisposable } from 'atom';

const SearchBar = require('./SearchBar');
const NoteListView = require('./NoteListView');
const EditorView = require('./EditorView');
const {repoPath} = require('./utils');
const {writeFileSync} = require('fs')

export default class NotesView {

  createViews() {
    this.element = document.createElement('div');
    this.element.classList.add('notes');
    this.element.classList.add('native-key-bindings');

    const searchBar = this.searchBar = new SearchBar();
    this.element.appendChild(searchBar.createView());

    const noteListView = this.noteListView = new NoteListView();
    this.element.appendChild(noteListView.getElement());

    this.editor = new EditorView();
  }

  handleEvents() {
    const sb = this.searchBar;
    const nl = this.noteListView;

    sb.on('Escape', () => {
      atom.workspace.toggle('atom://note-list');
    });
    sb.on('Enter', () => this.editor.findNext());
    sb.on('Shift+Enter', () => this.editor.findPrevious());

    const navigate = direction => {
      const path = nl.navigate(direction);
      this.openAndSearchNote(path);
    };
    sb.on('ArrowUp', () => navigate(-1));
    sb.on('ArrowDown', () => navigate(1));
    sb.on('valueChanged', value => {
      const notes = this.noteListView.searchNotes(value);
      const note = notes[0];
      if (note) this.selectThenOpenAndSearchNote(note.filePath);
    });

    nl.on('loaded', () => {
      this.searchBar.focus();
    });
    nl.on('noteClicked', path => {
      this.selectThenOpenAndSearchNote(path);
    });

    this.subscriptions = new CompositeDisposable();
    this.subscriptions.add(atom.commands.add(this.element, {
      'notes:newNote': () => this.newNote()
    }));
  }

  selectThenOpenAndSearchNote(path) {
    this.noteListView.selected = path;
    this.openAndSearchNote(path);
  }
  openAndSearchNote(path) {
    const sb = this.searchBar;
    return openNote(path).then(e => {
      this.editor.searchNote(sb.value);
    });
    function openNote(path, pending = true) {
        return atom.workspace.open(path, {pending}).then(e => {
          sb.focus();
        });
    }
  }

  focusSearchBar() {
    this.searchBar.focus();
  }

  newNote() {
    log("newNote");
    const keyword = this.searchBar.value
    if (keyword.length === 0) return

    const filePath = `${repoPath}/${keyword}.md`
    writeFileSync(filePath, '')

    atom.workspace.open(filePath)
  }

  constructor(serializedState) {
    this.createViews();
    this.handleEvents();
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {
    return {deserializer: 'notes/NotesView'};
  }

  destroy() {
    this.element.remove();
    this.subscriptions.dispose();
  }

  getElement = () => this.element
  getTitle = () => 'Notes'
  getURI = () => 'atom://note-list'
  getDefaultLocation = () => 'left'
  getAllowedLocations = () => 'left'
}
