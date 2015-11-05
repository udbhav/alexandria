(function($) {
  "use strict";
  var equals = function (array) {
    // if the other array is a falsy value, return
    if (!array)
      return false;

    // compare lengths - can save a lot of time
    if (this.length != array.length)
      return false;

    for (var i = 0, l=this.length; i < l; i++) {
      // Check if we have nested arrays
      if (this[i] instanceof Array && array[i] instanceof Array) {
        // recurse into the nested arrays
        if (!this[i].equals(array[i]))
          return false;
      }
      else if (this[i] != array[i]) {
        // Warning - two different object instances will never be equal: {x:20} != {x:20}
        return false;
      }
    }
    return true;
  };

  Array.prototype.equals = equals;
  Uint8Array.prototype.equals = equals;
  // Hide method from for-in loops
  Object.defineProperty(Array.prototype, "equals", {enumerable: false});
  Object.defineProperty(Uint8Array.prototype, "equals", {enumerable: false});

  function Machine() {
  };

  function ElektronMD() {
    Machine.call(this); // call super constructor.
  }
  // subclass extends superclass
  ElektronMD.prototype = Object.create(Machine.prototype);
  ElektronMD.prototype.constructor = ElektronMD;

  ElektronMD.prototype.parseSysEx = function(message) {
    if (message.data[6] == 82) this.parseKitSysEx(message);
  };
  ElektronMD.prototype.parseKitSysEx = function(message) {
    console.log(message.data.slice(16,32));
  };

  var Alexandria = React.createClass({
    getInitialState: function() {
      return {inputs: [], midi: false, listen: false};
    },

    render: function() {
      return React.createElement(
        'div', {}
        , React.createElement(
          MIDIDeviceSelector, {
            onChange: this.selectMIDIInput,
            inputs: this.state.inputs
          })
        , React.createElement(
          ReceiveToggle, {onClick: this.toggleMIDIListen})
      );
    },

    componentDidMount: function() {
      // request MIDI access
      if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess({sysex: true})
          .then(this.onMIDISuccess, this.onMIDIFailure);
      } else {
        alert("No MIDI support in your browser.");
      }
    },

    onMIDISuccess: function(midi) {
      this.setState({
        midi: midi,
        inputs: Array.from(midi.inputs.values())
      });
    },

    onMIDIFailure: function(e) {
      alert("No access to MIDI devices or your browser doesn't support WebMIDI API");
    },

    onMIDIMessage: function(message) {
      // only process sysex midi messages
      if (this.state.listen && message.data[0] == 240) {
        var selected_machine = this.machines.filter(function(m) {
          return message.data.slice(1,m.sysex_header.length+1).equals(m.sysex_header);
        });
        if (selected_machine.length) {
          selected_machine = new selected_machine[0].machine();
          selected_machine.parseSysEx(message);
        }
      }
    },

    toggleMIDIListen: function(listen) {
      this.setState({listen: listen});
    },

    selectMIDIInput: function(e) {
      var self = this, input_key = $(e.target).val();
      this.state.inputs.forEach(function(v) {
        if (v.id == input_key) {
          v.onmidimessage = self.onMIDIMessage;
        } else {
          v.onmidimessage = null;
        }
      });
    },

    machines: [
      {name: 'Elektron Machinedrum',
       machine_name: 'elektron_md',
       sysex_header: [0, 32, 60, 2, 0],
       machine: ElektronMD
      }
    ]
  });

  var MIDIDeviceSelector = React.createClass({
    getInitialState: function() {
      return {inputs: [], midi: false};
    },

    render: function() {
      var options = this.props.inputs.map(function(input) {
        return React.createElement(
          'option', {value: input.id, key: input.id}, input.name);
      });
      options.unshift(React.createElement('option', {key: 0, value: ""}, "---"));

      return React.createElement(
        'div', {className: 'form-group'}
        , React.createElement('label', {}, 'MIDI Port')
        , React.createElement('select', {
          className: 'form-control',
          onChange: this.props.onChange}, options)
      );
    }
  });

  var ReceiveToggle = React.createClass({
    getInitialState: function() {
      return {active: false};
    },

    render: function() {
      var class_name = 'btn btn-default',
      text = 'Listen for SysEx';

      if (this.state.active) {
        class_name = 'btn btn-primary';
        text = 'Listening…';
      }

      return React.createElement(
        'a', {className: class_name, onClick: this.handleClick},
        text);
    },

    handleClick: function(event) {
      var new_state = !this.state.active;
      this.props.onClick(new_state);
      this.setState({active: new_state});
    }
  });

  $(document).ready(function() {
    ReactDOM.render(
      React.createElement(Alexandria),
      $(".container-alexandria")[0]);

    // websocket test

  });
})(jQuery);
