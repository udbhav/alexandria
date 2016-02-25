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

  function YamahaDX7() {
    Machine.call(this); // call super constructor.
  }
  // subclass extends superclass
  YamahaDX7.prototype = Object.create(Machine.prototype);
  YamahaDX7.prototype.constructor = YamahaDX7;

  YamahaDX7.prototype.pad = function(num, size) {
    var s = num+"";
    while (s.length < size) s = "0" + s;
    return s;
  };
  YamahaDX7.prototype.getpartialByte = function(value, start, end) {
    return parseInt(this.pad((value).toString(2), 8).slice(start, end), 2);
  };

  YamahaDX7.prototype.parseSysEx = function(bytes) {
    // parse bank
    var self = this, data = [],
        presets = Array.apply(null, Array(32)).map(function (_, i) {return i;}),
        operators = Array.apply(null, Array(6)).map(function (_, i) {return i;});

    presets.forEach(function(i) {
      var patch_data = bytes.slice(6+i*128,134+i*128);
      var preset = {
        operators: []
      };

      operators.forEach(function(ii) {
        preset.operators.push({
          operator: 6-ii,
          r1: patch_data[0+ii*17], // env rate
          r2: patch_data[1+ii*17],
          r3: patch_data[2+ii*17],
          r4: patch_data[3+ii*17],
          l1: patch_data[4+ii*17], // env level
          l2: patch_data[5+ii*17],
          l3: patch_data[6+ii*17],
          l4: patch_data[7+ii*17],
          bp: patch_data[8+ii*17], // level scale breakpoint
          ld: patch_data[9+ii*17], // left scale depth
          rd: patch_data[10+ii*17], // right scale depth
          rc: self.getpartialByte(patch_data[11+ii*17], 4, 6), // right curve
          lc: self.getpartialByte(patch_data[11+ii*17], 6, 8), // left curve
          det: self.getpartialByte(patch_data[12+ii*17], 1, 5), // detune
          rs: self.getpartialByte(patch_data[12+ii*17], 5, 8), // rate scale
          kvs: self.getpartialByte(patch_data[13+ii*17], 3, 6), // key vel sens
          ams: self.getpartialByte(patch_data[13+ii*17], 6, 8), // amp mod sens
          ol: patch_data[14+ii*17], // output level
          fc: self.getpartialByte(patch_data[15+ii*17], 2, 7), // freq coarse
          mode: self.getpartialByte(patch_data[15+ii*17], 7, 8), // freq coarse
          ff: patch_data[16+ii*17], // freq fine
        });
      });
      preset['pr1'] = patch_data[102]; // pitch eg rate
      preset['pr2'] = patch_data[103];
      preset['pr3'] = patch_data[104];
      preset['pr4'] = patch_data[105];
      preset['pl1'] = patch_data[106]; // pitch eg level
      preset['pl2'] = patch_data[107];
      preset['pl3'] = patch_data[108];
      preset['pl4'] = patch_data[109];
      preset['alg'] = patch_data[110]; // algorithm
      preset['oks'] = self.getpartialByte(patch_data[111], 4, 5); // osc key sync
      preset['fb'] = self.getpartialByte(patch_data[111], 5, 8); // feedback
      preset['lfs'] = patch_data[112]; // lfo speed
      preset['lfd'] = patch_data[113]; // lfo delay
      preset['lpmd'] = patch_data[114]; // lf pt mod depth
      preset['lamd'] = patch_data[115]; // lf at mod depth
      preset['lpms'] = self.getpartialByte(patch_data[116], 1, 3); // lf pt mod sns
      preset['lfw'] = self.getpartialByte(patch_data[116], 3, 7); // wave
      preset['lks'] = self.getpartialByte(patch_data[116], 7, 8); // sync
      preset['transpose'] = patch_data[117];

      var iii = 118, name = "";
      while (iii <= 127) {
        name += String.fromCharCode(patch_data[iii]);
        iii += 1;
      }
      preset['name'] = name;
      data.push(preset);
    });

    return data;
  };
  YamahaDX7.prototype.parseKitSysEx = function(message) {
    // console.log(message.data.slice(16,32));
  };

  var ImportSysEx = React.createClass({
    getInitialState: function() {
      return {inputs: [], midi: false, listen: false, patches: []};
    },

    render: function() {
      var self = this;

      return React.createElement(
        'div', {}
        , React.createElement(
          'div', {className: 'row'}
          , React.createElement(
            'div', {className: 'col-sm-6'}
            , React.createElement(
              'div', {className: 'panel panel-default'}
              , React.createElement(
                'div', {className: 'panel-heading'}
                , React.createElement('h3', {className: 'panel-title'}, 'Capture MIDI')
              )
              , React.createElement(
                'div', {className: 'panel-body'}
                , React.createElement(
                  MIDIDeviceSelector, {
                    onChange: this.selectMIDIInput,
                    inputs: this.state.inputs})
                , React.createElement(
                  ReceiveToggle, {onClick: this.toggleMIDIListen})
              )
            )
          )
          , React.createElement(
            'div', {className: 'col-sm-6'}
            , React.createElement(
              'div', {className: 'panel panel-default'}
              , React.createElement(
                'div', {className: 'panel-heading'}
                , React.createElement('h3', {className: 'panel-title'}, 'Upload SysEx File')
              )
              , React.createElement(
                'div', {className: 'panel-body'}
                , React.createElement(SysExFileReader, {onFileLoad: this.onFileLoad})
              )
            )
          )
        )
        , (this.state.patches.length != 0 && React.createElement(
          MachinePatchManager, {
            machine: this.state.machine,
            patches: this.state.patches,
          }))
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

    parseSysEx: function(bytes) {
      var selected_machine = this.machines.filter(function(m) {
        return bytes.slice(1,m.sysex_header.length+1).equals(m.sysex_header);
      });
      var machine = selected_machine.length ? selected_machine[0] : false;
      if (machine) {
          var parsing_machine = new machine.machine(),
              patches = parsing_machine.parseSysEx(bytes),
              new_patches;

          if (patches.length) {
            if (this.state.machine && this.state.machine.machine_name != machine.machine_name) {
              new_patches = patches;
            } else {
              new_patches = this.state.patches.concat(patches);
            }
            this.setState({machine: machine, patches: new_patches});
          }
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
        this.parseSysEx(message.data);
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

    onFileLoad: function(bytes) {
      if (bytes[0] == 65533) {
        this.parseSysEx(bytes);
      }
    },

    machines: [
      {name: 'Elektron Machinedrum',
       machine_name: 'elektron_md',
       sysex_header: [0, 32, 60, 2, 0],
       machine: ElektronMD
      },
      {name: 'Yamaha DX7',
       machine_name: 'yamaha_dx7',
       sysex_header: [67, 0, 9, 32, 0],
       machine: YamahaDX7
      }
    ]
  });

  var MachinePatchManager = React.createClass({
    render: function() {
      var self = this;
      var patches = this.props.patches.map(function(p) {
        return React.createElement(
          Patch, {patch: p});
      });
      return React.createElement(
        'div', {'className': 'gutter-top machine-patches'}
        , React.createElement('h3', {}, this.props.machine.name)
        , React.createElement('div', {className: 'row'}, patches)
      );
    }
  });

  var Patch = React.createClass({
    getInitialState: function() {
      return {selected: false};
    },

    render: function() {
      return React.createElement(
        'div', {className: 'col-xs-6 col-sm-4 col-md-3 col-lg-2'}
        , React.createElement(
          'div', {className: 'patch', onClick: this.onClick},
          this.props.patch.name)
      );
    },

    onClick: function() {
      this.props.onClick(this.props.patch.pk);
    }
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

  var SysExFileReader = React.createClass({
    render: function() {
      return React.createElement(
        'div', {}
        , React.createElement(
          'input', {type: 'file', ref: 'file_input', onChange: this.onFileInputChange})
      );
    },

    onFileInputChange: function() {
      var self = this, el = ReactDOM.findDOMNode(this.refs.file_input),
          reader = new FileReader();

      reader.onload = function(e) {
        // convert to byte array
        var bytes = [];
        for (var i = 0; i < e.target.result.length; ++i) {
          bytes.push(e.target.result.charCodeAt(i));
        }
        self.props.onFileLoad(bytes);
      };
      reader.readAsText(el.files[0]);
    }
  });

  $(document).ready(function() {
    ReactDOM.render(
      React.createElement(ImportSysEx),
      $(".import-sysex")[0]);
  });
})(jQuery);
