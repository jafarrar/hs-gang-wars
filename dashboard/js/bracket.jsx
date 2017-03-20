const playersRep = nodecg.Replicant('players');
const bracketRep = nodecg.Replicant('bracket');

const BracketPanel = React.createClass({
    loadPlayersFromServer: function() {
		nodecg.readReplicant('players', function(value) {
            if(!value) {
                return {};
            }

            this.setState({players: value});
        }.bind(this));
    },

    loadBracketFromServer: function() {
		nodecg.readReplicant('bracket', function(value) {
            if(!value) {
                return {};
            }

            this.setState({bracket: value});
        }.bind(this));
    },

    getInitialState() {
        return {
            players: [],
			bracket: []
        }
    },

    componentDidMount: function() {
        this.loadPlayersFromServer();
		this.loadBracketFromServer();

		playersRep.on('change', function() {
			console.log('players replicant change detected by players editor');
			this.loadPlayersFromServer();
		}.bind(this));

		bracketRep.on('change', function() {
			console.log('bracket replicant change detected by bracket editor');
			this.loadBracketFromServer();
		}.bind(this));
    },

    render: function() {
        return (
            <div className="bracketPanel">
				{this.state.bracket.map(function(object, i) {
					return <EditSeriesForm players={this.state.players} series={object} key={i} />;
				}.bind(this))}
				<hr />
				<AddSeriesForm />
            </div>
        );
    }
});

const EditSeriesForm = React.createClass({
	getInitialState() {
		return {
			player1Tag: '',
			player1Score: '0',
			player1Id: -1,
			player2Tag: '',
			player2Score: '0',
			player2Id: -1,
		}
	},

	componentWillReceiveProps: function(nextProps) {
		this.setState({
			player1Tag: nextProps.series.player1.tag,
			player1Score: nextProps.series.player1.score,
			player1Id: nextProps.series.player1.id,
			player2Tag: nextProps.series.player2.tag,
			player2Score: nextProps.series.player2.score,
			player2Id: nextProps.series.player2.id,
		})
	},

	handleChange: function(field, e) {
		let nextState = {};
		nextState[field] = e.target.value;
		this.setState(nextState);
	},

	handleTagChange: function(field, e) {
		let nextState = {};
		nextState[field] = e.target.value;

		console.log(field);
		
		if(field == 'player1Id') {
			nextState.player1Tag = e.target.options[e.target.selectedIndex].text;
		}
		if(field == 'player2Id') {
			nextState.player2Tag = e.target.options[e.target.selectedIndex].text;
		}

		this.setState(nextState);
	},

	findSeries: function(series) {
		return series.id === this.props.series.id;
	},

	findPlayer: function(player) {
		return player.id === this.state.id;
	},

	updateSeries: function(e) {
		e.preventDefault();
		
		const updatedSeries = {
			name: this.props.series.name,
			id: this.props.series.id,
			player1: {
				tag: this.state.player1Tag,
				score: this.state.player1Score,
				id: this.state.player1Id
			},
			player2: {
				tag: this.state.player2Tag,
				score: this.state.player2Score,
				id: this.state.player2Id
			}
		};

		const index = bracketRep.value.findIndex(this.findSeries);

		bracketRep.value[index] = updatedSeries;

		this.setState(updatedSeries);
	},

	render: function() {
		return(
			<div className="series">
				<hr />
				<h3>{this.props.series.name}</h3>
				<p>Player 1</p>
				<PlayerList 
					players={this.props.players}
					playerId={this.state.player1Id}
					onChange={this.handleTagChange.bind(this, 'player1Id')}
				/>
				<div className="input-group">
					<label>Score</label>
					<input 
						type="number"
						value={this.state.player1Score}
						onChange={this.handleChange.bind(this, 'player1Score')}
					/>
				</div>
				<p>Player 2</p>
				<PlayerList 
					players={this.props.players}
					playerId={this.state.player2Id}
					onChange={this.handleTagChange.bind(this, 'player2Id')}
				/>
				<div className="input-group">
					<label>Score</label>
					<input 
						type="number"
						value={this.state.player2Score}
						onChange={this.handleChange.bind(this, 'player2Score')}
					/>
				</div>
                <input
                    type='submit'
                    value='Update Series'
                    onClick={this.updateSeries}
                />
			</div>
		)
	}
});

const PlayerList = React.createClass({
	render: function() {
		const MakeItem = function(x) {
			return <option key={x.id} value={x.id} label={x.tag}>{x.tag}</option>
		};

		return (
			<div className="input-group">
				<label>Player</label>
				<select 
					className="playerSelect" 
					value={this.props.playerId} 
					onChange={this.props.onChange}>
						<option key='-1'>Select a player</option>
						<option key='tbd'>TBD</option>
						<option key='blank'>&nbsp;</option>
						{this.props.players.map(MakeItem)}
						<option key='bye'>Bye</option>
				</select>
			</div>
		);
	}
});

const AddSeriesForm = React.createClass({
	getInitialState() {
		return {
			newSeriesName: ''
		}
	},

	handleNameChange: function(e) {
		this.setState({newSeriesName: e.target.value});
	},

	handleSubmit: function(e) {
		e.preventDefault();

		if(this.state.newSeriesName == '') {
			return;
		}

		// very ugly psuedorandom id generator
		let newSeries = {
			name: this.state.newSeriesName.trim(),
			id: Math.floor(Date.now() * Math.random()),
			player1: {
				tag: '',
				score: '0'
			},
			player2: {
				tag: '',
				score: '0'
			}
		};

		if(!bracketRep.value) {
			bracketRep.value = [newSeries]
		} else {
			bracketRep.value.push(newSeries)
		}

		this.setState({newSeriesName: ''});
	},

	render: function() {
		return (
			<form className="addSeries" onSubmit={this.handleSubmit}>
				<p>Add Series</p>
				<label>New Series Name</label>
				<input
					type="text"
					id="new-series-name"
					value={this.state.newSeriesName}
					onChange={this.handleNameChange}
				/>
				<input
					type="submit"
					value="Add Series"
				/>
			</form>
		);
	}
});


ReactDOM.render(
	<BracketPanel />,
	document.getElementById('content')
);