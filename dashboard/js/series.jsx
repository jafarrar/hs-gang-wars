const hsClasses = [{id:0,"value":"Hero"},{id:1,"value":"Druid"},{id:2,"value":"Hunter"},{id:3,"value":"Mage"},{id:4,"value":"Paladin"},{id:5,"value":"Priest"},{id:6,"value":"Rogue"},{id:7,"value":"Shaman"},{id:8,"value":"Warlock"},{id:9,"value":"Warrior"}];

const playersRep = nodecg.Replicant('players');
const seriesRep = nodecg.Replicant('series');

const SeriesPanel = React.createClass({
    loadPlayersFromServer: function() {
		nodecg.readReplicant('players', function(value) {
            if(!value) {
                return {};
            }

            this.setState({players: value});
        }.bind(this));
    },

    loadSeriesFromServer: function() {
		nodecg.readReplicant('series', function(value) {
            if(!value) {
                return {};
            }
            this.setState(value);

        }.bind(this));
    },

    getInitialState() {
        return {
            players: [],
            player1: {
                tag: 'Placeholder',
                id: -1,
                picture: '',
                wins: 0,
                losses: 0,
                decks: [0,0,0,0,0,0]
            },
            player1Id: -1,
            player1Status: [],
            player1Classes: {},
            player1Active: '',
            player2: {
                tag: 'Placeholder',
                id: -1,
                picture: '',
                wins: 0,
                losses: 0,
                decks: [0,0,0,0,0,0]
            },
            player2Id: -1,
            player2Classes: {},
            score: '0-0',
            player2Status: [],
            player2Active: '',
            inGameLabel1: '',
            inGameLabel2: '',
            inGameLabel3: ''
        }
    },

    componentDidMount: function() {
        this.loadSeriesFromServer();
        this.loadPlayersFromServer();

		playersRep.on('change', function() {
			console.log('players replicant change detected by series editor');
			this.loadPlayersFromServer();
		}.bind(this));

		seriesRep.on('change', function() {
			console.log('series replicant change detected by series editor');
			this.loadSeriesFromServer();
            this.loadPlayersFromServer();
		}.bind(this));  
    },

    updatePlayer1: function(e) {
		const playerObj = this.state.players.filter(function(playerObj) {
			return playerObj.id == e.target.value;
		});

		this.setState({
			player1: playerObj[0],
			player1Id: playerObj[0].id
		});
    },

    updatePlayer2: function(e) {
		const playerObj = this.state.players.filter(function(playerObj) {
			return playerObj.id == e.target.value;
		});

		this.setState({
			player2: playerObj[0],
            player2Id: playerObj[0].id
		});
    },

	handleChange: function(field, e) {
		let nextState = {};
		nextState[field] = e.target.value;
		this.setState(nextState);
	},

    buildDeckStatus: function(decks, status) {
        let combined = [];
        
        let deckStatus = {
            'bans': [],
            'picks': []
        }

        decks.forEach(function(deckName, index, array) {
            combined.push({deckName, 'status': '0'});
        });

        status.forEach(function(statusObject,index, array) {
            combined[index].status = statusObject;
        });

        combined.forEach(function(i) {
            if(i.status === '1') {
                deckStatus.picks.push(i.deckName + ' win');
            } else if(i.status === '2') {
                deckStatus.picks.push(i.deckName + ' loss');
            } else {
                deckStatus.picks.push(i.deckName);
            }
                
        });

        console.log(deckStatus);

        return deckStatus;
    },

    resetDeckStatus: function(e) {
        e.preventDefault();

		if(confirm('Reset Picks and Bans for BOTH Players?')) {
			this.setState({
                player1Status: ['0','0','0','0','0','0'],
                player2Status: ['0','0','0','0','0','0']
			});
		}
    },

    updateSeries: function(e) {
        e.preventDefault();
        this.state.player1Classes = this.buildDeckStatus(this.state.player1.decks, this.state.player1Status);
        this.state.player2Classes = this.buildDeckStatus(this.state.player2.decks, this.state.player2Status);
        seriesRep.value = this.state;
    },

    render: function() {
		const MakeItem = function(x) {
			return <option key={x.id} value={x.id}>{x.tag}</option>
		};

		const MakeHSClassItem = function(x) {
			return <option key={x.id} value={x.value}>{x.value}</option>
		};

        return (
            <div className="seriesPanel">
                <p>Players and Score</p>
                <div className="input-group">
                    <label>Player 1</label>
                    <select className="player1Select" 
                        value={this.state.player1Id} 
                        onChange={this.updatePlayer1}>
                            <option key='-1'>Select a player</option>
                            {this.state.players.map(MakeItem)}
                    </select>
                </div>

                <div className="input-group">
                    <label>P1 Class</label>
                    <select className="player1Active" 
                        value={this.state.player1Active} 
                        onChange={this.handleChange.bind(this, 'player1Active')}>
                            {hsClasses.map(MakeHSClassItem)}
                    </select>
                </div>

                <div className="input-group">
                    <label>Player 2</label>
                    <select className="player2Select" 
                        value={this.state.player2Id} 
                        onChange={this.updatePlayer2}>
                            <option key='-1'>Select a player</option>
                            {this.state.players.map(MakeItem)}
                    </select>
                </div>

                <div className="input-group">
                    <label>P2 Class</label>
                    <select className="player2Active" 
                        value={this.state.player2Active} 
                        onChange={this.handleChange.bind(this, 'player2Active')}>
                            {hsClasses.map(MakeHSClassItem)}
                    </select>
                </div>

                <div className="input-group">
                    <label>Score</label>
                    <input
                        type='text'
                        id='score'
                        value={this.state.score}
                        onChange={this.handleChange.bind(this, 'score')}
                    />
                </div>
                <hr />
                <p>In Game Status Text (top right)</p>
                <div className="input-group">
                    <label>Status 1</label>
                    <input
                        type='text'
                        value={this.state.inGameLabel1}
                        onChange={this.handleChange.bind(this, 'inGameLabel1')}
                    />
                </div>
                <div className="input-group">
                    <label>Status 2</label>
                    <input
                        type='text'
                        value={this.state.inGameLabel2}
                        onChange={this.handleChange.bind(this, 'inGameLabel2')}
                    />
                </div>
                <div className="input-group">
                    <label>Status 3</label>
                    <input
                        type='text'
                        value={this.state.inGameLabel3}
                        onChange={this.handleChange.bind(this, 'inGameLabel3')}
                    />
                </div>
                <hr />
                <p>Player 1 ({this.state.player1.tag}) Deck Status</p>
                <DeckStatus
                    player={this.state.player1}
                    status={this.state.player1Status}
                />
                <hr />
                <p>Player 2 ({this.state.player2.tag}) Deck Status</p>
                <DeckStatus
                    player={this.state.player2}
                    status={this.state.player2Status}
                />
                <input
                    type='submit'
                    value='Update Series'
                    onClick={this.updateSeries}
                />
                <button
                    name='button'
                    onClick={this.resetDeckStatus}
                >Reset Picks &amp; Bans</button>
            </div>
        );
    }
});

// Status cheatsheet
// Neutral: 0 
// Won: 1
// Lost: 2
const DeckStatus = React.createClass({
	handleChange: function(field, e) {
        this.props.status[field] = e.target.value;
        this.forceUpdate();
	},

    render: function() {
		const MakeItem = function(x) {
			return <option key={x.key} value={x.key}>{x.label}</option>
		};

        const options = [
            {'key': 0, 'label': 'Neutral'},
            {'key': 1, 'label': 'Won'},
            {'key': 2, 'label': 'Lost'}
        ];

        return (
            <div className="deckStatus">
                <div className="input-group">
                    <label>1. {this.props.player.decks[0]}</label>
                    <select
                        value={this.props.status[0]}
                        onChange={this.handleChange.bind(this, '0')}>
                    {options.map(MakeItem)}
                    </select>
                </div>
                <div className="input-group">
                    <label>2. {this.props.player.decks[1]}</label>
                    <select
                        value={this.props.status[1]}
                        onChange={this.handleChange.bind(this, '1')}>
                    {options.map(MakeItem)}
                    </select>
                </div>
                <div className="input-group">
                    <label>3. {this.props.player.decks[2]}</label>
                    <select
                        value={this.props.status[2]}
                        onChange={this.handleChange.bind(this, '2')}>
                    {options.map(MakeItem)}
                    </select>
                </div>
                <div className="input-group">
                    <label>4. {this.props.player.decks[3]}</label>
                    <select
                        value={this.props.status[3]}
                        onChange={this.handleChange.bind(this, '3')}>
                    {options.map(MakeItem)}
                    </select>
                </div>
                <div className="input-group">
                    <label>5. {this.props.player.decks[4]}</label>
                    <select
                        value={this.props.status[4]}
                        onChange={this.handleChange.bind(this, '4')}>
                    {options.map(MakeItem)}
                    </select>
                </div>
                <div className="input-group">
                    <label>6. {this.props.player.decks[5]}</label>
                    <select
                        value={this.props.status[5]}
                        onChange={this.handleChange.bind(this, '5')}>
                    {options.map(MakeItem)}
                    </select>
                </div>
            </div>
        );
    }
});

ReactDOM.render(
	<SeriesPanel />,
	document.getElementById('content')
);