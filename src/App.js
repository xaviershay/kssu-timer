import React, { Component } from 'react';

// State enum. Wonder what best practice way to handle this is?
const SPLIT_SELECT = 0
const TIME_ENTER   = 1
const PREGAME      = 2

var INITIAL_DATA = {
  navState: PREGAME,
  mostRecentTimeMs: 0,
  splits: [
    // Be nice if I knew the actual boss names but I've never played this game.
    {label: "Boss 1",  bestTimeMs: null, recentTimeMs: null},
    {label: "Boss 2",  bestTimeMs: null, recentTimeMs: null},
    {label: "Boss 3",  bestTimeMs: null, recentTimeMs: null},
    {label: "Boss 4",  bestTimeMs: null, recentTimeMs: null},
    {label: "Boss 5",  bestTimeMs: null, recentTimeMs: null},
    {label: "Boss 6",  bestTimeMs: null, recentTimeMs: null},
    {label: "Boss 7",  bestTimeMs: null, recentTimeMs: null},
    {label: "Boss 8",  bestTimeMs: null, recentTimeMs: null},
    {label: "Boss 9",  bestTimeMs: null, recentTimeMs: null},
    {label: "Boss 10", bestTimeMs: null, recentTimeMs: null},
  ]
}

// The following time handling functions are left as an exercise to the reader.
function formatDuration(x) {
  if (x === null || x === 0)
    return "";
  return x + "";
}

function formatDelta(x, y) {
  if (!x || !y) {
    return ""
  }
  var diff = x - y;

  if (diff < 0) {
    return diff;
  } else {
    return "+" + diff;
  }
}

function parseInputToMs(input) {
  var asInt = parseInt(input, 10);

  if (isNaN(asInt)) {
    return null;
  } else {
    return asInt;
  }
}



function sumBests(splits) {
  // Don't need to filter out nulls coz thanks javascript
  return splits.map(x => x.bestTimeMs).reduce((x, y) => x + y);
}

class SplitTracker extends React.Component {
  constructor(props) {
    super(props);
    this.state = INITIAL_DATA

    // This is boilerplate, but it's consistent with React tutorial style so
    // not DRYing up for now.
    this.handleReset       = this.handleReset.bind(this);
    this.handleSplit       = this.handleSplit.bind(this);
    this.handleSplitSelect = this.handleSplitSelect.bind(this);
    this.handleStart       = this.handleStart.bind(this);
  }

  handleStart() {
    this.setState({navState: SPLIT_SELECT});
  }

  handleSplit(n, totalTimeInMs) {
    var splitTime = totalTimeInMs - this.state.mostRecentTimeMs;

    if (splitTime < 0) {
      return false
    }

    // Deep copy I guess? Appear to be libraries for handling this for
    // efficiently but not interested in investigating right now.
    var splits = Object.assign({}, this.state).splits;
    splits[n-1].recentTimeMs = splitTime;

    this.setState({
      navState:         SPLIT_SELECT,
      splits:           splits,
      mostRecentTimeMs: totalTimeInMs
    });

    return true;
  }

  handleSplitSelect(n) {
    if (!n)
      return false;

    // One can imagine something here for the "first 6 random" logic.
    var split = this.state.splits[n-1];
    if (split && !split.recentTimeMs) {
      this.setState({navState: TIME_ENTER});
      return true;
    } else {
      return false;
    }
  }

  handleReset(save) {
    var scope = this;
    return function() {
      var splits = Object.assign({}, scope.state).splits;
      splits.forEach(split => {
        if (save && (!split.bestTimeMs || split.recentTimeMs < split.bestTimeMs)) {
          split.bestTimeMs = split.recentTimeMs;
        }
        split.recentTimeMs = null;
      })

      scope.setState({
        splits: splits,
        mostRecentTimeMs: 0,
        navState: PREGAME
      })
    }
  }

  render() {
    var navState = this.state.navState;
    var splits = this.state.splits.map((data, n) =>
      <Split {...data} navState={navState} key={n} />
    );
    // Could probably extract the table to a component
    return (
      <div className='row'>
        <div className='col-md-3'>
          <table className='table'>
            <thead>
              <tr>
                <th>Total:</th>
                {navState === PREGAME &&
                  <th>{formatDuration(sumBests(this.state.splits))}</th>}
                {navState !== PREGAME &&
                  <th>{formatDuration(this.state.mostRecentTimeMs)}</th>}
                <th></th>
              </tr>
            </thead>
            <tbody>
            {splits}
            </tbody>
          </table>
        </div>
        <div className='col-md-6'>
          {navState === PREGAME &&
            <button onClick={this.handleStart} className='btn btn-success'>Go!</button>
          }
          {navState !== PREGAME &&
            <div>
              <SplitInput
                onSplit={this.handleSplit}
                onSelect={this.handleSplitSelect}
                navState={this.state.navState} />
              <p>
                <button onClick={this.handleReset(true)} type='button' className='btn btn-info'>Reset (Save Bests)</button>
                <button onClick={this.handleReset(false)} type='button' className='btn btn-info'>Reset (Discard Bests)</button>
              </p>
            </div>
          }
        </div>
      </div>
    )
  }
}

function Split(props) {
  if (props.navState === PREGAME) {
    return <tr>
      <td>{props.label}</td>
      <td>{formatDuration(props.bestTimeMs)}</td>
      <td></td>
    </tr>
  } else {
    return <tr>
      <td>{props.label}</td>
      <td>{formatDuration(props.recentTimeMs)}</td>
      <td>{formatDelta(props.recentTimeMs, props.bestTimeMs)}</td>
    </tr>
  }
}

class SplitInput extends React.Component {
  constructor(props) {
    super(props);
    this.state = this.initialState();

    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleReset  = this.handleReset.bind(this);
  }

  initialState() { return {n: null, value: ''}}

  handleReset() {
    this.setState(this.initialState());
  }

  handleChange(event) {
    this.setState({value: event.target.value});
  }

  handleSubmit(event) {
    if (this.props.navState === SPLIT_SELECT) {
      var nInt = parseInputToMs(this.state.value);

      if (this.props.onSelect(nInt)) {
        this.setState({n: nInt, value: ''});
      } else {
        this.setState({n: null, value: ''});
      }
    } else {
      if (this.props.onSplit(this.state.n, this.state.value)) {
        this.setState({n: null, value: ''});
      } else {
        this.setState({value: ''});
      }
    }
    event.preventDefault();
  }

  componentDidMount() {
    this.textInput.focus();
  }

  render() {
    var label;

    if (this.props.navState === SPLIT_SELECT) {
      label = "Select Boss: ";
    } else {
      label = "Enter Time for #" + this.state.n + ": "
    }
    return (
      <form onSubmit={this.handleSubmit}>
        <label>{label}
        <input
          placeholder="Integers only!"
          type="text"
          value={this.state.value}
          ref={(input) => { this.textInput = input; }}
          onChange={this.handleChange} />
        </label>
      </form>
    );
  }
}

class App extends Component {
  render() {
    // This is absolutely NOT the right way to style an inline header image,
    // but I'm not particularly interested in figuring out the proper way right
    // now. Inline styles it is!
    return (
      <div className='container'>
        <div className='page-header' style={{paddingBottom: 0}}>
          <img alt='Kirby' src='kirby.png' width='30' style={{float: 'left', display:'inline', marginRight: 10}}/>
          <h1 style={{marginBottom: 5}}>KSSU Boss Rush Split Timer</h1>
          <p>Noodling around with some React ideas for the <a href="https://gist.github.com/lexi-lambda/701f1f1282401059f13a4220e8178ba4">KSSU Splits Timer GUI Challenge</a>. This is my first React app. <a href="https://github.com/xaviershay/kssu-timer">Source and caveats.</a></p>
        </div>
        <SplitTracker />
      </div>
    );
  }
}

export default App;
