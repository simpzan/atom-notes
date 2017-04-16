'use babel';

import NotesView from './notes-view';
import { CompositeDisposable } from 'atom';

export default {

  notesView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.notesView = new NotesView(state.notesViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.notesView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'notes:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.notesView.destroy();
  },

  serialize() {
    return {
      notesViewState: this.notesView.serialize()
    };
  },

  toggle() {
    console.log('Notes was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
