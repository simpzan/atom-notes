'use babel';

const DocQuery = require("docquery");
const log = console.info.bind(console, "NotesView");
const markerLayers = new WeakMap;
const docQuery = this.docQuery = new DocQuery('/Users/simpzan/repo/notes.git', {recursive: true});
// const SearchBar = require('./SearchBar');

export default class NotesView {
  getMarkerLayer(editor) {
      let layer = markerLayers.get(editor);
      if (!layer) {
        layer = editor.addMarkerLayer({maintainHistory: false});
        markerLayers.set(editor, layer);

        this.resultsLayerDecoration = editor.decorateMarkerLayer(layer, {type: 'highlight', class: 'find-result'});
      }
      return layer;
  }

  searchInNote() {
    const editor = this.lastEditor
    const layer = this.getMarkerLayer(editor);
    layer.getMarkers().forEach(marker => marker.destroy());
    const ranges = this.ranges = window.ranges = [];
    this.current = 0;
    editor.scan(new RegExp(this.input.value, 'g'), obj => {
      const range = obj.computedRange;
      ranges.push(range);
      layer.markBufferRange(range, {invalidate: 'inside'});
    })
    const range = ranges[0];
    if (range) editor.scrollToBufferPosition(range.start)
  }
  findNext() {
    const ranges = this.ranges, count = ranges.length;
    if (count === 0) {
      return log("not found");
    }
    const index = (this.current + 1 + count) % count;
    this.current = index;
    const range = ranges[index];
    this.lastEditor.scrollToBufferPosition(range.start);
  }

  createViews() {
    this.element = document.createElement('div');
    this.element.classList.add('notes');
    this.element.classList.add('native-key-bindings');

    // const searchBar = this.searchBar = new SearchBar();
    const input = this.input = document.createElement('input');
    input.classList.add('input-text')
    this.element.appendChild(input);

    const noteListView = this.noteListView = document.createElement('ul');
    noteListView.classList.add('list-group');
    this.element.appendChild(noteListView);
    window.noteListView = noteListView;
  }

  reloadNoteList(notes) {
    this.noteListView.innerHTML = notes.map(doc => {
      return `<li class='list-item' id='${doc.filePath}'>
        <span class='icon icon-file-text'>${doc.fileName}</span>
      </li>`
    }).join('\n');
  }

  loadNotes() {
    docQuery.on('ready', () => {
      const notes = this.notes = docQuery.documents;
      this.reloadNoteList(notes);
      this.focusSearchBar();
    });
    this.input.addEventListener('keyup', e => {
      const keyCode = e.keyCode;
      const UP = 38, DOWN = 40, ENTER = 13;
      if (keyCode === UP) {
        this.navigateNoteList(-1);
      } else if (keyCode === DOWN) {
        this.navigateNoteList(1);
      } else if (keyCode === ENTER) {
        this.findNext();
        // this.focusEditor();
      } else {
        this.searchNotes(e.target.value);
      }
    });

    this.noteListView.addEventListener('click', e => {
      let item = e.target;
      if (item.nodeName !== 'LI') item = item.parentElement;
      const path = item.id;
      this.select(path);
    })
  }

  navigateNoteList(direction) {
    const notes = this.notes, selected = this.selectedNote;
    const count = notes.length;
    let index = notes.findIndex(note => note.filePath === selected);
    index = (index + direction + count) % count;
    const newSelectedNote = notes[index];
    this.select(newSelectedNote.filePath);
  }

  searchNotes(value) {
    const notes = this.notes = value ? docQuery.search(value) : docQuery.documents;
    this.reloadNoteList(notes);

    const note = notes[0];
    if (note) {
      this.select(note.filePath);
    }
  }

  select(path) {
    this.selectNote(path);
    return this.openNote(path).then(e => {
      this.focusSearchBar();
      this.searchInNote();
    });
  }
  selectNote(path) {
    this.selectedNote = path;
    const items = [].slice.call(this.noteListView.children);
    items.forEach(item => {
      if (item.id === path) item.classList.add('selected');
      else item.classList.remove('selected');
    })
  }

  openNote(path, pending = true) {
    return atom.workspace.open(path, {pending});
  }
  focusSearchBar() {
    this.input.focus();
    this.input.focus();
  }
  focusEditor() {
    this.openNote(this.selectedNote, false);
  }

  constructor(serializedState) {
    this.createViews();
    this.loadNotes();
    atom.workspace.observeTextEditors(editor => {
      // log("editor", editor);
    });
    this.lastEditor = null;
    atom.workspace.onDidChangeActivePaneItem(item => {
      if (atom.workspace.isTextEditor(item)) this.lastEditor = item;
    })
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {
    return {deserializer: 'notes/NotesView'};
  }

  destroy() {
    this.element.remove();
  }

  getElement = () => this.element
  getTitle = () => 'Notes'
  getURI = () => 'atom://note-list'
  getDefaultLocation = () => 'left'
  getAllowedLocations = () => 'left'
}
