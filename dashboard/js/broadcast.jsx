const broadcastRep = nodecg.Replicant('broadcast');

const BroadcastPanel = React.createClass({
    loadBroadcastFromServer: function() {
        nodecg.readReplicant('broadcast', function(value) {
            if(!value) {
                return;
            }

            this.setState(value);
        }.bind(this));
    },

    getInitialState() {
        return {
            caster1: {},
            caster2: {},
            lowerthird: {}
        }
    },

	componentDidMount: function() {
		this.loadBroadcastFromServer();

		broadcastRep.on('change', function() {
			this.loadBroadcastFromServer();
		}.bind(this));
	},

    updateBroadcast: function(e) {
        e.preventDefault();
        broadcastRep.value = this.state;
    },
    
    render: function() {
        return (
            <form className='brodcastForm' onSubmit={this.updateBroadcast}>
                <p>Caster 1 (left)</p>
                <CasterForm 
                    caster={this.state.caster1}
                />
                <p>Caster 2 (right)</p>
                <CasterForm 
                    caster={this.state.caster2}
                />
                <hr />
                <LowerThirdForm 
                    lowerthird={this.state.lowerthird}
                />
				<input
					type='submit'
					value='Update'
				/>
                <hr />
                <TimerForm />
                <hr />
                <FlyoutForm />
            </form>
        );
    }
});

const CasterForm = React.createClass({
	handleChange: function(field, e) {
        this.props.caster[field] = e.target.value;
        this.forceUpdate();
	},

    render: function() {
        return (
            <div className='casters'>
                <div className='input-group'>
                    <label>Name</label>
                    <input
                        type="text"
                        value={this.props.caster.name || ''}
                        onChange={this.handleChange.bind(this, 'name')}
                    />
                </div>
                <div className='input-group'>
                    <label>Twitter</label>
                    <input
                        type="text"
                        value={this.props.caster.twitter || ''}
                        onChange={this.handleChange.bind(this, 'twitter')}
                    />
                </div>
            </div>
        );
    }
});

const LowerThirdForm = React.createClass({
	handleChange: function(field, e) {
        this.props.lowerthird[field] = e.target.value;
        this.forceUpdate();
	},

    render: function() {
        return (
            <div className='lowerthird'>
                <p>Lower Third</p>
                <div className='input-group'>
                    <label>Top</label>
                    <input
                        type="text"
                        value={this.props.lowerthird.top || ''}
                        onChange={this.handleChange.bind(this, 'top')}
                    />
                </div>
                <div className='input-group'>
                    <label>Bottom</label>
                    <input
                        type="text"
                        value={this.props.lowerthird.bottom || ''}
                        onChange={this.handleChange.bind(this, 'bottom')}
                    />
                </div>
            </div>
        );
    }
});

const TimerForm = React.createClass({
	getInitialState() {
		return {timerMinutes: 0}
	},

    handleStartTimer: function(e) {
        e.preventDefault();
        console.log('hi');
        nodecg.sendMessage('updateTimer', this.state.timerMinutes);
    },

    handleStopTimer: function(e) {
        e.preventDefault();
        nodecg.sendMessage('stopTimer');
    },

	handleChange: function(e) {
		this.setState({timerMinutes: e.target.value})
	},
    
    render: function() {
        return (
            <div className='timer'>
                <p>Timer</p>
                <label>Timer Length (minutes)</label>
				<input
                    value={this.state.timerMinutes}
                    onChange={this.handleChange}
				/>
                <button onClick={this.handleStartTimer}>Start Timer</button>
                <button onClick={this.handleStopTimer}>Stop Timer</button>
            </div>
        );
    }
});

const FlyoutForm = React.createClass({
	getInitialState() {
		return {
            message: '',
            twitterHandle: ''
        }
	},

    handleStartTwitterFlyout: function(e) {
        e.preventDefault();
        nodecg.sendMessage('startTwitterFlyout', this.state);
    },

    handleStartUpdateFlyout: function(e) {
        e.preventDefault();
        nodecg.sendMessage('startUpdateFlyout', this.state);
    },

    handleHideFlyout: function(e) {
        e.preventDefault();
        nodecg.sendMessage('hideFlyout');
    },

	handleChange: function(field, e) {
		let nextState = {};
		nextState[field] = e.target.value;
		this.setState(nextState);
	},

    render: function() {
        return (
            <div className="flyoutForm">
                <p>Flyouts</p>
                <div className='input-group'>
                    <label>Message</label>
                    <input
                        type="text"
                        value={this.state.message}
                        onChange={this.handleChange.bind(this, 'message')}
                    />
                </div>
                <div className='input-group'>
                    <label>Twitter Handle</label>
                    <input
                        type="text"
                        value={this.state.twitterHandle}
                        onChange={this.handleChange.bind(this, 'twitterHandle')}
                    />
                </div>
                <button onClick={this.handleStartTwitterFlyout}>Start Twitter Flyout</button>
                <button onClick={this.handleStartUpdateFlyout}>Start Update Flyout</button>
                <button onClick={this.handleHideFlyout}>Hide Flyout</button>
            </div>
        );
    }
});

ReactDOM.render(
	<BroadcastPanel />,
	document.getElementById('content')
);