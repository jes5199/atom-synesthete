'use babel';

import { CompositeDisposable } from 'atom';

export default {
  subscriptions: null,

  colors: [
    "#008700", "#00875f", "#008787", "#0087af", "#0087d7", "#0087ff",
    "#00af00", "#00af5f", "#00af87", "#00afaf", "#00afd7", "#00afff",
    "#00d700", "#00d75f", "#00d787", "#00d7af", "#00d7d7", "#00d7ff",
    "#00ff00", "#00ff5f", "#00ff87", "#00ffaf", "#00ffd7", "#00ffff",
    "#5f8700", "#5f875f", "#5f8787", "#5f87af", "#5f87d7", "#5f87ff",
    "#5faf00", "#5faf5f", "#5faf87", "#5fafaf", "#5fafd7", "#5fafff",
    "#5fd700", "#5fd75f", "#5fd787", "#5fd7af", "#5fd7d7", "#5fd7ff",
    "#5fff00", "#5fff5f", "#5fff87", "#5fffaf", "#5fffd7", "#5fffff",
    "#875f00", "#875f5f", "#875f87", "#875faf", "#875fd7", "#875fff",
    "#878700", "#87875f", "#878787", "#8787af", "#8787d7", "#8787ff",
    "#87af00", "#87af5f", "#87af87", "#87afaf", "#87afd7", "#87afff",
    "#87d700", "#87d75f", "#87d787", "#87d7af", "#87d7d7", "#87d7ff",
    "#87ff00", "#87ff5f", "#87ff87", "#87ffaf", "#87ffd7", "#87ffff",
    "#af0000", "#af005f", "#af0087", "#af00af", "#af00d7", "#af00ff",
    "#af5f00", "#af5f5f", "#af5f87", "#af5faf", "#af5fd7", "#af5fff",
    "#af8700", "#af875f", "#af8787", "#af87af", "#af87d7", "#af87ff",
    "#afaf00", "#afaf5f", "#afaf87", "#afafaf", "#afafd7", "#afafff",
    "#afd700", "#afd75f", "#afd787", "#afd7af", "#afd7d7", "#afd7ff",
    "#afff00", "#afff5f", "#afff87", "#afffaf", "#afffd7", "#afffff",
    "#d70000", "#d7005f", "#d70087", "#d700af", "#d700d7", "#d700ff",
    "#d75f00", "#d75f5f", "#d75f87", "#d75faf", "#d75fd7", "#d75fff",
    "#d78700", "#d7875f", "#d78787", "#d787af", "#d787d7", "#d787ff",
    "#d7af00", "#d7af5f", "#d7af87", "#d7afaf", "#d7afd7", "#d7afff",
    "#d7d700", "#d7d75f", "#d7d787", "#d7d7af", "#d7d7d7", "#d7d7ff",
    "#d7ff00", "#d7ff5f", "#d7ff87", "#d7ffaf", "#d7ffd7", "#d7ffff",
    "#ff0000", "#ff005f", "#ff0087", "#ff00af", "#ff00d7", "#ff00ff",
    "#ff5f00", "#ff5f5f", "#ff5f87", "#ff5faf", "#ff5fd7", "#ff5fff",
    "#ff8700", "#ff875f", "#ff8787", "#ff87af", "#ff87d7", "#ff87ff",
    "#ffaf00", "#ffaf5f", "#ffaf87", "#ffafaf", "#ffafd7", "#ffafff",
    "#ffd700", "#ffd75f", "#ffd787", "#ffd7af", "#ffd7d7", "#ffd7ff",
    "#ffff00", "#ffff5f", "#ffff87", "#ffffaf", "#ffffd7",
  ],

  activate(state) {
    // Events subscribed to in atom's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();
    // Register command that toggles this view
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'synesthete:toggle': () => this.toggle()
    }));
  },

  turnOn() {
    this.on = true;

    if(!this.turnOffs) {
      this.turnOffs = [];
    }

    if(!this.stylesheet) {
      this.stylesheet = document.createElement('style');
      this.stylesheet.id = 'synesthete-custom-style';
      this.stylesheet.appendChild(document.createTextNode(''));
      document.head.appendChild(this.stylesheet);
    } else {
      while(this.stylesheet.sheet.rules.length) {
        this.stylesheet.sheet.deleteRule(0);
      }
    }

    this.words = {};

    var synesthete = this;

    this.observer = atom.workspace.observeTextEditors(function(editor){
      if(!synesthete.on){ return; }
      var old_grammar = editor.getGrammar();
      editor.setGrammar(atom.grammars.grammarsByScopeName["synesthete"]);
      synesthete.turnOffs.push(function(){
        editor.setGrammar(old_grammar);
      })
      if(editor.largeFileMode){return;}
      var buffer = editor.getBuffer();
      var matchers = {};
      var makeWords = function(){
        var text = buffer.getText();
        var words = (text.split(/[^0-9a-zA-ZΆΈ-ώ_]+/u));
        words.forEach(function(word){
          if ( word && !synesthete.words[word] ) {
            synesthete.words[word] = true;
            var css;
            var match = word.match(/^([a-f0-9]{2})([a-f0-9]{2})([a-f0-9]{2})$/i);
            if(match){
              var color = "#" + word;
              var background = "black";
              var r = parseInt(match[1], 16);
              var g = parseInt(match[2], 16);
              var b = parseInt(match[3], 16);
              var a = ( 0.299 * r + 0.587 * g + 0.114 * b)/255;
              if(a < 0.5) {
                  background = "white";
              }
              css = ".syntax--synesthete-" + word + " {" +
                "color: " + color + "; " +
                "background-color: " + background +
                ";}";
            } else {
              var color = synesthete.colors[Math.floor(synesthete.colors.length * Math.random())];
              css = ".syntax--synesthete-" + word + " {color: "+ color +";}";
            }
            synesthete.stylesheet.sheet.insertRule(css, 0);
          }
        });
      };
      makeWords();
      buffer.onDidStopChanging(makeWords);
    });
  },

  deactivate() {
    turnOff();
    this.subscriptions.dispose();
  },

  turnOff() {
    this.turnOffs.forEach(function(f){f();});
    this.turnOffs = [];

    this.on = false;
  },

  serialize() {
    return {
    };
  },

  toggle() {
    console.log('Synesthete was toggled!');
    if(!this.on) {
      this.turnOn();
    } else {
      this.turnOff();
    }
    return;
  }

};
