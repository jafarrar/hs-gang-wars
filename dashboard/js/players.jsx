const hsClasses = [{id:0,"value":"Hero"},{id:1,"value":"Druid"},{id:2,"value":"Hunter"},{id:3,"value":"Mage"},{id:4,"value":"Paladin"},{id:5,"value":"Priest"},{id:6,"value":"Rogue"},{id:7,"value":"Shaman"},{id:8,"value":"Warlock"},{id:9,"value":"Warrior"}];

const playersRep = nodecg.Replicant('players');
const picturesRep = nodecg.Replicant('assets:player-pictures');

const PlayersPanel = React.createClass({
    loadPlayersFromServer: function() {
		nodecg.readReplicant('players', function(value) {
            if(!value) {
                return {};
            }

            this.setState({players: value});
        }.bind(this));
    },

    getInitialState() {
        return {
            players: []
        }
    },

    componentDidMount: function() {
        this.loadPlayersFromServer();

		playersRep.on('change', function() {
			console.log('players replicant change detected by players editor');
			this.loadPlayersFromServer();
			this.forceUpdate();
		}.bind(this));
    },

    render: function() {
        return (
            <div className="playersPanel">
				<PlayerList 
					players={this.state.players} 
				/>
            </div>
        );
    }
});

//Generates the list of players, and serves as the parent for the form to edit players
//Handles the state of player pictures
const PlayerList = React.createClass({
	getInitialState() {
		return {
			players: [],
			playerPictureList: [],
			activePlayer: {
				tag: 'Placeholder',
				id: -1,
				fullname: '',
				twitter: '',
				picture: '',
				wins: 0,
				losses: 0,
				decks: []
			}
		};
	},

	loadPlayerPicturesFromServer: function() {
		nodecg.readReplicant('assets:player-pictures', function(value) {
			if(!value) {
				return;
			}

			this.setState({
				playerPictureList: value
			});
		}.bind(this));
	},

	componentWillReceiveProps: function(nextProps) {
		this.setState({
			players: nextProps.players
		});
	},

	componentDidMount: function() {
		this.loadPlayerPicturesFromServer();

		picturesRep.on('change', function() {
			this.loadPlayerPicturesFromServer();
		}.bind(this));
	},

	handleActiveChange: function(e) {
		const playerObj = this.state.players.filter(function(playerObj) {
			return playerObj.id == e.target.value;
		});

		this.setState({
			activePlayer: playerObj[0],
			activePlayerId: playerObj[0].id
		});

	},

	render: function() {
		const numPlayers = this.props.players.length;

		const MakeItem = function(x) {
			return <option key={x.id} value={x.id}>{x.tag}</option>
		};

		return(
			<div>
				<p>Number of players: {numPlayers}</p>
				<form className="playerPicker">
					<div className="input-group">
						<label>Edit a Player</label>
						<select 
							className="playerSelect" 
							value={this.state.activePlayerId} 
							onChange={this.handleActiveChange}>
								<option key='-1'>Select a player</option>
								{this.props.players.map(MakeItem)}
						</select>
					</div>
				</form>
				<hr />
				<PlayerEditor 
					player={this.state.activePlayer} 
					playerPictureList={this.state.playerPictureList}
				/>
				<hr />
				<AddPlayerForm />
			</div>
		);
	}
});

const AddPlayerForm = React.createClass({
	getInitialState() {
		return {
			newPlayerTag: ''
		};
	},

	handleTagChange: function(e) {
		this.setState({newPlayerTag: e.target.value});
	},

	handleSubmit: function(e) {
		e.preventDefault();

		if(this.state.newPlayerTag == '') {
			console.log('Empty tag');
			return;
		}

		// very ugly psuedorandom id generator
		let newPlayer = {
			tag: this.state.newPlayerTag.trim(),
			id: Math.floor(Date.now() * Math.random()),
			picture: '',
			wins: 0,
			losses: 0,
			decks: ['', '', '', '', '']
		};

		if(!playersRep.value) {
			playersRep.value = [newPlayer]
		} else {
			playersRep.value.push(newPlayer);
		}

		this.setState({newPlayerTag: ''});
	},

	render: function() {
		return (
			<form className="addPlayer" onSubmit={this.handleSubmit}>
				<p>Add Player</p>
				<label>New Player's Tag</label>
				<input
					type="text"
					id="new-player-tag"
					value={this.state.newPlayerTag}
					onChange={this.handleTagChange}
				/>
				<input
					type="submit"
					value="Add Player"
				/>
			</form>
		);
	}
});

//Generates the form for editing an individual player
//Handles the state of an individual player
//TO FIX: Currently, the form updates the db but not the field until you refresh or change active player
const PlayerEditor = React.createClass({
	getInitialState() {
		return {
			tag: '',
			id: -1,
			fullname: '',
			twitter: '',
			picture: '',
			wins: 0,
			losses: 0,
			decks: ['', '', '', '', '','']
		};
	},

	componentWillReceiveProps: function(nextProps) {
		this.setState({
			tag: nextProps.player.tag,
			id: nextProps.player.id,
			fullname: nextProps.player.fullname,
			twitter: nextProps.player.twitter,
			picture: nextProps.player.picture,
			wins: nextProps.player.wins,
			losses: nextProps.player.losses,
			decks: nextProps.player.decks
		});
	},
	
	findPlayer: function(player) {
		return player.id === this.state.id;
	},

	updatePlayer: function(e) {
		e.preventDefault();

		const updatedPlayer = {
			tag: this.state.tag,
			id: this.state.id,
			fullname: this.state.fullname,
			twitter: this.state.twitter,
			picture: this.state.picture,
			wins: this.state.wins,
			losses: this.state.losses,
			decks: this.state.decks			
		};

		const index = playersRep.value.findIndex(this.findPlayer);

		playersRep.value[index] = updatedPlayer;
		this.setState(updatedPlayer);
	},

	removePlayer: function(e) {
		e.preventDefault();

		if(confirm('Delete this player?' + this.state.tag)) {
			this.setState({
				tag: ''
			});
			const index = playersRep.value.findIndex(this.findPlayer);
			playersRep.value.splice(index, 1);
		}
	},

	handleChange: function(field, e) {
		let nextState = {};
		nextState[field] = e.target.value;
		this.setState(nextState);
	},

	handleDeckChange: function(deckNum, e) {
		let nextState = {};
		let decks = this.state.decks;

		decks[deckNum] = e.target.value;
		nextState.decks = decks;
		this.setState(nextState);	
	},

	render: function() {
		//This function generates select option nodes for the list of pictures uploaded to NodeCG's asset system
		//Note: NodeCG replicants do not have indices or unique IDs by default, but React requires them
		//To remedy this, this function uses the indexOf the picture in the asset array as the key
		const pictureNodes = this.props.playerPictureList.map(function(picture) {
			if(picture.name !== '') {
				const index = this.props.playerPictureList.indexOf(picture);

				return (
					<option key={index} value={picture.name}>{picture.name}</option>
				);
			}

		}.bind(this));

		const MakeItem = function(x) {
			return <option key={x.id} value={x.value}>{x.value}</option>
		};

		return (
			<form className='playerEditor' onSubmit={this.updatePlayer}>
				<div className="input-group">
					<label>Tag</label>
					<input 
						type='text'
						id='player-tag'
						value={this.state.tag}
						onChange={this.handleChange.bind(this, 'tag')}
					/>
				</div>

				<div className="input-group">
					<label>Full Name</label>
					<input 
						type='text'
						id='player-fullname'
						value={this.state.fullname}
						onChange={this.handleChange.bind(this, 'fullname')}
					/>
				</div>

				<div className="input-group">
					<label>Twitter</label>
					<input 
						type='text'
						id='player-twitter'
						value={this.state.twitter}
						onChange={this.handleChange.bind(this, 'twitter')}
					/>
				</div>
                
				<div className="input-group">
					<label>Picture</label>
					<select value={this.state.picture} onChange={this.handleChange.bind(this, 'picture')}>
						<option value=''>Select a picture</option>
						{pictureNodes}
					</select>
				</div>

				<p><strong>{this.state.tag}'s Classes</strong></p>
				<div className="deckPicker">
					<div className="input-group">
						<label>Deck 1</label>
						<select className="classSelect" value={this.state.decks[0]} onChange={this.handleDeckChange.bind(this, 0)}>{hsClasses.map(MakeItem)}</select>
					</div>
					<div className="input-group">
						<label>Deck 2</label>
						<select className="classSelect" value={this.state.decks[1]} onChange={this.handleDeckChange.bind(this, 1)}>{hsClasses.map(MakeItem)}</select>
					</div>
					<div className="input-group">
						<label>Deck 3</label>
						<select className="classSelect" value={this.state.decks[2]} onChange={this.handleDeckChange.bind(this, 2)}>{hsClasses.map(MakeItem)}</select>
					</div>
					<div className="input-group">
						<label>Deck 4</label>
						<select className="classSelect" value={this.state.decks[3]} onChange={this.handleDeckChange.bind(this, 3)}>{hsClasses.map(MakeItem)}</select>
					</div>
					<div className="input-group">
						<label>Deck 5</label>
						<select className="classSelect" value={this.state.decks[4]} onChange={this.handleDeckChange.bind(this, 4)}>{hsClasses.map(MakeItem)}</select>
					</div>
					<div className="input-group">
						<label>Deck 6</label>
						<select className="classSelect" value={this.state.decks[5]} onChange={this.handleDeckChange.bind(this, 5)}>{hsClasses.map(MakeItem)}</select>
					</div>
				</div>
				<input
					type='submit'
					value='Update'
					onClick={this.updatePlayer}
				/>
				<input
					type='submit'
					value='Delete Player'
					onClick={this.removePlayer}
				/>

			</form>

		);
	}
});

ReactDOM.render(
	<PlayersPanel />,
	document.getElementById('content')
);