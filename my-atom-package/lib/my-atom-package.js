'use babel';

import MyAtomPackageView from './my-atom-package-view';
import { CompositeDisposable } from 'atom';

export default {

  myAtomPackageView: null,
  modalPanel: null,
  subscriptions: null,

  activate(state) {
    this.myAtomPackageView = new MyAtomPackageView(state.myAtomPackageViewState);
    this.modalPanel = atom.workspace.addModalPanel({
      item: this.myAtomPackageView.getElement(),
      visible: false
    });

    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'my-atom-package:toggle': () => this.toggle()
    }));
  },

  deactivate() {
    this.modalPanel.destroy();
    this.subscriptions.dispose();
    this.myAtomPackageView.destroy();
  },

  serialize() {
    return {
      myAtomPackageViewState: this.myAtomPackageView.serialize()
    };
  },

  toggle() {
    console.log('MyAtomPackage was toggled!');
    return (
      this.modalPanel.isVisible() ?
      this.modalPanel.hide() :
      this.modalPanel.show()
    );
  }

};
