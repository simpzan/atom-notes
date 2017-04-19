'use babel';

const log = console.info.bind(console, "index");

import NotesView from './NotesView';
import { CompositeDisposable } from 'atom';

export default {

  notesView: null,
  modalPanel: null,
  subscriptions: null,

  registerCommands() {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'notes:focusSearchBar': () => this.notesView.focusSearchBar()
    }));
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'notes:toggle': () => this.toggle()
    }));
    this.subscriptions.add(atom.workspace.addOpener(uri => {
      if (uri === 'atom://note-list') {
        return this.notesView;
      }
    }));
  },

  activate(state) {
    log('activate', state)
    this.notesView = new NotesView(state.notesViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.notesView.getElement(),
      visible: false
    });

    if (!this.subscriptions) this.registerCommands();
  },

  deactivate() {
    log('deactivate')
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.notesView.destroy();
  },

  serialize() {
    log('serialize');
    return {
      notesViewState: this.notesView.serialize()
    };
  },

  toggle() {
    log('Notes was toggled!');
    atom.workspace.toggle('atom://note-list');
  },

  deserializeNotesView(serialized) {
    log('deserializeNotesView', serialized);
    if (!this.subscriptions) this.registerCommands();

    if (!this.notesView) {
      this.notesView = new NotesView(serialized);
    }
    return this.notesView;
  }
};

log('loaded')
