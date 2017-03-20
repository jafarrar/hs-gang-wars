const broadcastRep = nodecg.Replicant('broadcast');
const seriesRep = nodecg.Replicant('series');
const playersRep = nodecg.Replicant('players');
const picturesRep = nodecg.Replicant('assets:player-pictures');
const bracketRep = nodecg.Replicant('bracket');

const CasterCams = React.createClass({ 
    getInitialState() {
        return {
            broadcast: {
                caster1: {},
                caster2: {}
            },
            players: [],
            series: {
                player1: {},
                player1Classes: {
                    'picks': {},
                    'bans': {}
                },
                player2: {},
                player2Classes: {
                    'picks': {},
                    'bans': {}
                },
                score: ''
            },
            playerPictureList: {},
            bracket: []
        }
    },

    loadBroadcastFromServer: function() {
        nodecg.readReplicant('broadcast', function(value) {
            if(!value) {
                return;
            }

            this.setState({broadcast: value});
        }.bind(this));
    },

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
            this.setState({series: value});

        }.bind(this));
    },

	loadPlayerPicturesFromServer: function() {
		nodecg.readReplicant('assets:player-pictures', function(value) {
			if(!value) {
				return;
			}

			this.setState({playerPictureList: value});
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

	componentDidMount: function() {
		this.loadBroadcastFromServer();
        this.loadPlayersFromServer();
        this.loadPlayerPicturesFromServer();
        this.loadSeriesFromServer();
        this.loadBracketFromServer();


		broadcastRep.on('change', function() {
			this.loadBroadcastFromServer();
            this.forceUpdate();
		}.bind(this));

		playersRep.on('change', function() {
			this.loadPlayersFromServer();
            this.forceUpdate();
		}.bind(this));

		picturesRep.on('change', function() {
			this.loadPlayerPicturesFromServer();
            this.forceUpdate();
		}.bind(this));

		seriesRep.on('change', function() {
			this.loadSeriesFromServer();
            this.loadPlayersFromServer();
		}.bind(this));  

		bracketRep.on('change', function() {
			this.loadBracketFromServer();
		}.bind(this));
	},

    render: function() {
        const scoreState = this.state.series.score;
        let score1 = '0';
        let score2 = '0';

        const parseScore = function() {            
            score1 = scoreState.charAt(0);
            score2 = scoreState.charAt(scoreState.length-1);
            console.log(score1, score2);
        }

        parseScore();

        console.log("root", this.state.series.player1Classes);

        return (
            <div className="casterCams">
                <div className="casterLabelContainer">
                    <CasterLabel 
                        caster={this.state.broadcast.caster1}
                    />
                    <CasterLabel 
                        caster={this.state.broadcast.caster2}
                    />
                </div>
                <div className="playerBoxContainer">
                    <PlayerBox 
                        player={this.state.series.player1}
                    />
                    
                    <PlayerBox 
                        player={this.state.series.player2}
                    />
                </div>
                <div className="seriesScore leftScore">{score1}</div>
                <div className="seriesScore rightScore">{score2}</div>
                <div className="deckBoxContainer">
                    <DeckBox
                        classes={this.state.series.player1Classes}
                    />
                    <DeckBox
                        classes={this.state.series.player2Classes}
                    />
                </div>
                <BracketBox 
                    bracket={this.state.bracket}    
                />
            </div>
        );
    }
});

// build the brackets for top 8 
const BracketBox = React.createClass({
    render: function() {
        return (
            <div className="bracketsContainer">
				{this.props.bracket.map(function(object, i) {
					return <BracketSeries series={object} key={i} />;
				}.bind(this))}
            </div>
        );
    }
});

const BracketSeries = React.createClass({
    render: function() {
        let isThrough1 = false;
        let isThrough2 = false;

        if(this.props.series.player1.score > 2) {
            isThrough1 = true;
        }

        if(this.props.series.player2.score > 2) {
            isThrough2 = true;
        }

        return (
            <div className="seriesContainer" id={this.props.series.name.trim()}>
                <div className={isThrough1 ? 'player1 through' : 'player1'}>
                    <div className="tag">{this.props.series.player1.tag}</div>
                    <div className="score">{this.props.series.player1.score}</div>
                </div>
                <div className={isThrough2 ? 'player2 through' : 'player2'}>
                    <div className="tag">{this.props.series.player2.tag}</div>
                    <div className="score">{this.props.series.player2.score}</div>
                </div>
            </div>
        );
    }
})

// build the player standings
const StandingsBox = React.createClass({
    getInitialState() {
        return {
            group: []
        }
    },

    componentWillReceiveProps: function(nextProps) {
        this.setState({
            group: nextProps.group        
        });
    },

    isThrough: function(wins) {
        return wins > 3;
    },

    isEliminated: function(wins, losses) {
        return losses > 4 && wins < 1;
    },

    render: function() {
        let playerDivs = [];

        for (var i = 0; i < this.props.group.length; i++) {
            let isThrough = false;
            let isEliminated = false;

            if(this.state.group[i].wins > 3) {
                isThrough = true;
            }

            if(this.state.group[i].losses > 3) {
                isEliminated = true;
            }

            playerDivs.push(<div className={isThrough ? 'standingsPlayer through' : 'standingsPlayer'}><div className={isEliminated ? 'tag eliminated' : 'tag'}>{this.state.group[i].tag}</div><div className={isEliminated ? 'score eliminated' : 'score'}>{this.state.group[i].wins} - {this.state.group[i].losses}</div></div>);
        }
        return (
            <div className="standingsBox">
                {playerDivs}
            </div>
        );
    }
});

// Look upon this and despair
const AllStandingsBoxes = React.createClass({
    getInitialState() {
        return {
            players: [],
            group1: [],
            group2: [],
            group3: [],
            group4: []
        }
    },

    componentWillReceiveProps: function(nextProps) {
        this.setState({
            players: nextProps.players
        });

        this.sortPlayers(this.state.players);
        this.setGroups();

        console.log(nextProps.players);
    },

    sortPlayers: function(group, index, array) {
        group.sort(function(a,b) {
            let n = b.wins - a.wins;

            if (n !== 0) {
                return n;
            }

            return a.losses - b.losses; 
        });
    },

    // credit http://stackoverflow.com/a/11764168
    // distributes players from array into groups of $len 
    chunk: function(arr, len) {
        let chunks = [],
            i = 0,
            n = arr.length;

        while (i < n) {
            chunks.push(arr.slice(i, i += len));
        }

        return chunks;
    },

    // split players into 4 groups, then sort them by wins within the group
    // size of groups is hardcoded to 6
    setGroups: function() {
        let groups = this.chunk(this.state.players, 4);
        //groups.forEach(this.sortPlayers);

        this.setState({
            group1: groups[0],
            group2: groups[1],
            group3: groups[2],
            group4: groups[3]
        })
    },

    render: function() {
        return (
            <div className="standingsBoxContainer">
                <div className="left">
                    <StandingsBox 
                        group={this.state.group1}
                    />
                    <StandingsBox 
                        group={this.state.group2}
                    />
                </div>
                <div className="right">
                    <StandingsBox 
                        group={this.state.group3}
                    />
                    <StandingsBox 
                        group={this.state.group4}
                    />
                </div>
            </div>
        );
    }

});

// build the caster labels
const CasterLabel = React.createClass({
    getInitialState() {
        return {
            caster: {
                name: ''
            }
        }
    },

    componentWillReceiveProps: function(nextProps) {
        this.setState({
            caster: {
                name: nextProps.caster.name
            }
        });
    },
    
    render: function() {
        const splitName = this.state.caster.name.split(' ');

        return (
            <div className="casterLabel">
                <div className="name">
                    {splitName[0]}
                    <strong> {splitName[1]} </strong>
                    {splitName[2]}
                </div>
            </div>
        );
    }
});

// build the player box
const PlayerBox = React.createClass({
    getInitialState() {
        return {
            player: {
                tag: '',
                fullname: '',
                twitter: '',
                picture: ''
            }
        }
    },

    componentWillReceiveProps: function(nextProps) {
        this.setState({
            player: {
                tag: nextProps.player.tag,
                fullname: nextProps.player.fullname,
                twitter: nextProps.player.twitter,
                picture: nextProps.player.picture
            }
        });
    },
    render: function() {
        const splitName = this.state.player.fullname.split(' ');

        return (
            <div className="playerBox">
                <div className="playerPicture">{this.state.player.picture || ''}</div>
                <img className="playerPicture" src={"/assets/hs-gang-wars/player-pictures/" + this.state.player.picture + ".jpg"}/>
                <div className="playerTag">
                    {splitName[0]}
                    <strong> {splitName[1]} </strong>
                    {splitName[2]}
                </div>
                <div className="playerTwitter">{this.state.player.twitter || ''}</div>
            </div>
        );
    }
 });

// build the deck box
const DeckBox = React.createClass({
    getInitialState() {
        return {
            deckStatus: {
                picks: [],
                bans: []
            }
        }
    },

    componentWillReceiveProps: function(nextProps) {
        this.setState({
            deckStatus: this.props.classes
        });
    },
    
    render: function() {
        console.log("picks", this.state.deckStatus.picks);

        return (
            <div className="deckBox">
                <div className="picks">
                    <div className={this.state.deckStatus.picks[0] || 'Warrior'}></div>
                    <div className={this.state.deckStatus.picks[1] || 'Warrior'}></div>
                    <div className={this.state.deckStatus.picks[2] || 'Warrior'}></div>
                    <div className={this.state.deckStatus.picks[3] || 'Warrior'}></div>
                    <div className={this.state.deckStatus.picks[4] || 'Warrior'}></div>
                    <div className={this.state.deckStatus.picks[5] || 'Warrior'}></div>
                </div>
            </div>
        );
    }
});

ReactDOM.render(
	<CasterCams />,
	document.getElementById('content')
);