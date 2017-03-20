const broadcastRep = nodecg.Replicant('broadcast');
const playersRep = nodecg.Replicant('players');
const bracketRep = nodecg.Replicant('bracket');

const UpNext = React.createClass({ 
    getInitialState() {
        return {
            broadcast: {
                caster1: {},
                caster2: {},
                lowerthird: {}
            },
            players: [],
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
		this.loadBracketFromServer();

		broadcastRep.on('change', function() {
			this.loadBroadcastFromServer();
            this.forceUpdate();
		}.bind(this));

		playersRep.on('change', function() {
			this.loadPlayersFromServer();
            this.forceUpdate();
		}.bind(this)); 

		bracketRep.on('change', function() {
			this.loadBracketFromServer();
		}.bind(this));
	},

    render: function() {
        return (
            <div className="upNext">
            {/* Standings boxes disabled for top 8
                <AllStandingsBoxes
                    players={this.state.players}
                />
            */}
                <BracketBox 
                    bracket={this.state.bracket}    
                />
                <LowerThird
                    text={this.state.broadcast.lowerthird}
                />
            </div>
        );
    }
});

const LowerThird = React.createClass({
    getInitialState() {
        return {
            top: 'Coming Up Next',
            bottom: ''
        }
    },

    componentWillReceiveProps: function(nextProps) {
        this.setState({
            top: nextProps.text.top,
            bottom: nextProps.text.bottom
        })
    },

    render: function() {
        return (
            <div className="lowerThird">
                <div className="top">{this.state.top}</div>
                <div className="bottom">{this.state.bottom}</div>
                <TimerDisplay />
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

// build the player standings for group play
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

    isEliminated: function(wins) {
        return losses > 4;
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

const TimerDisplay = React.createClass({
	getInitialState() {
		return {
			secondsRemaining: 0
		}
	},
	tick: function() {
		this.setState({
			secondsRemaining: this.state.secondsRemaining - 1,
			formattedSeconds: this.formatSeconds(this.state.secondsRemaining - 1)
		});
		if (this.state.secondsRemaining <= 0) {
			clearInterval(this.interval);
		}
	},
	componentDidMount: function() {
		nodecg.listenFor('updateTimer', this.setTimer);
		nodecg.listenFor('stopTimer', this.stopTimer);
	},
	setTimer: function(time) {
		this.stopTimer();
		this.setState({secondsRemaining: time * 60 });
		this.interval = setInterval(this.tick, 1000);
        console.log('hi');
	},
	componentWillUnmount: function() {
		this.stopTimer();
	},
	stopTimer: function() {
		this.setState({secondsRemaining: 2 });
		clearInterval(this.interval);
	},
	// Shoutout to this guy: http://jsfiddle.net/StevenIseki/apg8yx1s/
	formatSeconds: function(totalSeconds) {
		if (totalSeconds <= 0) {
			return;
		}

		const hours = Math.floor(totalSeconds / 3600);
		const minutes = Math.floor((totalSeconds - (hours * 3600)) / 60);
		const seconds = totalSeconds - (hours * 3600) - (minutes * 60);

		if(seconds <= 9) {
			return minutes + ":0" + seconds;
		}
		else {
			return minutes + ":" + seconds;	
		}
		
	},
	render: function() {
		return (
			<div className="timer">{this.state.formattedSeconds}</div>
		);
	}
});

ReactDOM.render(
	<UpNext />,
	document.getElementById('content')
);