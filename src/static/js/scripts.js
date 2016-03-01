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

  // csrf for django
  var csrftoken = Cookies.get('csrftoken');
  function csrfSafeMethod(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
  }
  $.ajaxSetup({
    beforeSend: function(xhr, settings) {
      if (!csrfSafeMethod(settings.type) && !this.crossDomain) {
        xhr.setRequestHeader("X-CSRFToken", csrftoken);
      }
    }
  });

  function Machine() {
  };

  function ElektronMD() {
    Machine.call(this); // call super constructor.
  }
  // subclass extends superclass
  ElektronMD.prototype = Object.create(Machine.prototype);
  ElektronMD.prototype.constructor = ElektronMD;

  ElektronMD.prototype.parseSysEx = function(message) {
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

  var ImportSysEx = React.createClass({
    getInitialState: function() {
      return {inputs: [], midi: false, listen: false, patches: [], lastPatchClicked: false};
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
          MachinePatchUploader, {
            machine: this.state.machine,
            patches: this.state.patches,
            onToolbarClick: this.onMachineToolbarClick,
            onPatchClick: this.onPatchClick
          })
          )
      );
    },

    componentDidMount: function() {
      // id
      this.patch_id = 0;

      // request MIDI access
      if (navigator.requestMIDIAccess) {
        navigator.requestMIDIAccess({sysex: true})
          .then(this.onMIDISuccess, this.onMIDIFailure);
      } else {
        alert("No MIDI support in your browser.");
      }
    },

    parseSysEx: function(bytes) {
      var self = this, selected_machine = this.machines.filter(function(m) {
        return bytes.slice(1,m.sysex_header.length+1).equals(m.sysex_header);
      });
      var machine = selected_machine.length ? selected_machine[0] : false;
      if (machine) {
        var parsing_machine = new machine.machine(),
            patches = parsing_machine.parseSysEx(bytes);

        if (patches.length) {
          patches.forEach(function(p) { p.id = self.getPatchID(); p.active = false; }); // get ids

          if (this.state.machine && this.state.machine.machine_name != machine.machine_name) {
            this.setState({machine: machine, patches: patches});
          } else {
            this.setState(function(old_state) {
              return {machine: machine, patches: old_state.patches.concat(patches)};
            });
          };
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

    onMachineToolbarClick: function(action, machine) {
      this.setState(function(old_state) {
        var patches = old_state.patches;
        if (action == "select_all") {
          patches = old_state.patches.map(function(p) { return $.extend(p, {active: true}) });
        } else if (action == "select_none") {
          patches = old_state.patches.map(function(p) { return $.extend(p, {active: false}) });
        } else if (action == "remove_selected") {
          patches = old_state.patches.filter(function(p) { return !p.active; });
        } else if (action == "save_selected") {
          old_state.patches.map(function(p) {
            if (p.active) {
              $.ajax({
                type: "post",
                dataType: "json",
                contentType: "application/json",
                url: "/api/v1/patches/",
                data: JSON.stringify({"name": p.name, "data": p, "machine": machine.machine_name})
              });
            };
          });
          patches = old_state.patches.filter(function(p) { return !p.active })
        }

        return {patches: patches};
      });
    },

    getPatchID: function() {
      var patch_id = this.patch_id;
      this.patch_id += 1;
      return patch_id;
    },

    onPatchClick: function(e, patch_id) {
      var self = this, active_selection = false;
      var patches = this.state.patches.map(function(p) {
        // shift click
        if (e.shiftKey) {
          if (p.id == patch_id || p.id == self.state.lastPatchClicked) active_selection = !active_selection;
        }

        if (patch_id == p.id || (active_selection && p.id != self.state.lastPatchClicked)) {
          return $.extend(p, {active: !p.active});
        } else {
          return p;
        }
      });
      this.setState({patches: patches, lastPatchClicked: patch_id});
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

  var PatchToolbar = React.createClass({
    render: function() {
      return React.createElement(
        'div', {className: 'btn-group'}
        , React.createElement(
          'button', {className: 'btn btn-default',
                     "data-action": "select_all",
                     onClick: this.onToolbarClick}, "Select All")
        , React.createElement(
          'button', {className: 'btn btn-default',
                     "data-action": "select_none",
                     onClick: this.onToolbarClick}, "Select None")
        , React.createElement(
          'button', {className: 'btn btn-danger',
                     "data-action": "remove_selected",
                     onClick: this.onToolbarClick}, "Remove Selected")
        , React.createElement(
          'button', {className: 'btn btn-primary',
                     "data-action": "save_selected",
                     onClick: this.onToolbarClick}, "Save Selected")
      );
    },

    onToolbarClick: function(e) {
      e.preventDefault();
      var action = $(e.target).attr("data-action");
      this.props.onToolbarClick(action, this.props.machine);
    }
  });

  var MachinePatchUploader = React.createClass({
    render: function() {
      var self = this;
      var patches = this.props.patches.map(function(p) {
        return React.createElement(
          Patch, {key: p.id, patch: p, onPatchClick: self.props.onPatchClick});
      });
      return React.createElement(
        'div', {'className': 'machine-patches'}
        , React.createElement('h3', {}, this.props.machine.name)
        , React.createElement(PatchToolbar, {
          onToolbarClick: this.props.onToolbarClick, machine: this.props.machine})
        , React.createElement('div', {className: "gutter-top patches"}, patches)
      );
    }
  });

  var Patch = React.createClass({
    render: function() {
      return React.createElement(
        'div', {className: 'patch checkbox'}
        , React.createElement(
          'label', {onClick: this.onLabelClick}
          , React.createElement(
            'input', {type: "checkbox", checked: this.props.patch.active, onClick: this.onClick})
          , this.props.patch.name)
      );
    },

    onClick: function(e) {
      e.stopPropagation();
      this.props.onPatchClick(e, this.props.patch.id);
    },

    onLabelClick: function(e) {
      e.stopPropagation();
      e.preventDefault();
      // clear selection
      if ( document.selection ) {
        document.selection.empty();
      } else if ( window.getSelection ) {
        window.getSelection().removeAllRanges();
      }
      this.onClick(e);
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

  var MachinePatchManager = React.createClass({
    render: function() {
      var self = this;
      var patches = this.props.machine.patches.map(function(p) {
        return React.createElement(
          Patch, {key: p.id, patch: p, onPatchClick: self.props.onPatchClick});
      });

      return React.createElement(
        'div', {'className': 'machine-patches'}
        , React.createElement('h3', {}, this.props.machine.name)
        , React.createElement(PatchToolbar, {
          onToolbarClick: this.props.onToolbarClick, machine: this.props.machine})
        , React.createElement('div', {className: "gutter-top patches"}, patches)
      );
    }
  });

  var UserPatches = React.createClass({
    getInitialState: function() {
      return {machines: []};
    },

    render: function() {
      var machines = this.state.machines.map(function(m) {
        return React.createElement(
          MachinePatchManager, {machine: m, key: m.machine});
      });
      return React.createElement(
        'div', {}, machines);
    },

    componentDidMount: function() {
      var self = this;
      $.getJSON("/api/v1/users/" + this.props.user_id, function(data) {
        var machines = [];
        for (var machine in data.patches) {
          machines.push({machine: machine, name: data.patches[machine][0].machine_name, patches: data.patches[machine]});
        }
        self.setState({machines: machines});
      });
    }
  });

  $(document).ready(function() {

    if ($(".import-sysex").length) {
      ReactDOM.render(
        React.createElement(ImportSysEx),
        $(".import-sysex")[0]);
    }

    if ($(".user-patches").length) {
      ReactDOM.render(
        React.createElement(UserPatches, {user_id: $(".user-patches").attr("data-user-id")}),
        $(".user-patches")[0]);
    }
  });
})(jQuery);
