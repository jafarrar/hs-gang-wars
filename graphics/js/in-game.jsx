const seriesRep = nodecg.Replicant('series');

const InGame = React.createClass({ 
    getInitialState() {
        return {
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
                score: '',
                inGameLabel1: '',
                inGameLabel2: '',
                inGameLabel3: ''
            }
        }
    },

    loadSeriesFromServer: function() {
		nodecg.readReplicant('series', function(value) {
            if(!value) {
                return {};
            }
            this.setState({series: value});

        }.bind(this));
    },

	componentDidMount: function() {
        this.loadSeriesFromServer();

		seriesRep.on('change', function() {
			this.loadSeriesFromServer();
		}.bind(this));  
	},

    render: function() {
        const scoreState = this.state.series.score;
        let score1 = '0';
        let score2 = '0';
        let seriesInfo = ['','',''];

        const parseScore = function() {            
            score1 = scoreState.charAt(0);
            score2 = scoreState.charAt(scoreState.length-1);
            console.log(score1, score2);
        }

        seriesInfo = [this.state.series.inGameLabel1, this.state.series.inGameLabel2, this.state.series.inGameLabel3];

        console.log(seriesInfo);

        parseScore();

        return (
            <div className="inGame">
                <LeftPanel
                    player={this.state.series.player1}
                    classes={this.state.series.player1Classes}
                    score={score1}
                    activeClass={this.state.series.player1Active}
                />
                <RightPanel
                    player={this.state.series.player2}
                    classes={this.state.series.player2Classes}
                    score={score2}
                    seriesInfo={seriesInfo}
                    activeClass={this.state.series.player2Active}
                />
                <InGameFlyout />
            </div>
        );
    }
});

const LeftPanel = React.createClass({
    getInitialState() {
        return {
            tag: '',
            classes: {},
            score: '',
            activeClass: ''
        }
    },

    componentWillReceiveProps: function(nextProps) {
        this.setState({
            tag: nextProps.player.tag || props.player.tag,
            classes: nextProps.classes || props.classes,
            score: nextProps.score || '0',
            activeClass: nextProps.activeClass || 'Warrior'
        });
    },

    render: function(){
        return (
            <div className="leftPanel">
                <div className="tag">{this.state.tag}</div>
                <div className="score">{this.state.score}</div>
                <div className="webcam"></div>
                <div id="activeClass" className={this.state.activeClass}></div>
            </div>
        );
    }
});

const RightPanel = React.createClass({
    getInitialState() {
        return {
            tag: '',
            classes: {},
            score: '',
            activeClass: '',
            seriesInfo: ['','','']
        }
    },

    componentWillReceiveProps: function(nextProps) {
        this.setState({
            tag: nextProps.player.tag || props.player.tag,
            classes: nextProps.classes || props.classes,
            score: nextProps.score || '0',
            seriesInfo: nextProps.seriesInfo || props.seriesInfo,
            activeClass: nextProps.activeClass
        });
    },

    render: function(){
        console.log(this.state);
        return (
            <div className="rightPanel">
                <div className="tag">{this.state.tag}</div>
                <div className="score">{this.state.score}</div>
                <div className="seriesInfo">
                    <div id="seriesInfo1">{this.state.seriesInfo[0]}</div>
                    <div id="seriesInfo2">{this.state.seriesInfo[1]}</div>
                    <div id="seriesInfo3">{this.state.seriesInfo[2]}</div>
                </div>
                <div className="webcam"></div>
                <div id="activeClass" className={this.state.activeClass}></div>
            </div>
        );
    }
});

//repeated from caster-cams
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
            deckStatus: nextProps.classes
        });
    },
    
    render: function() {

        return (
            <div className="deckBox">
                <div className="picks">
                    <div className={this.state.deckStatus.picks[0] || 'Warrior'}></div>
                    <div className={this.state.deckStatus.picks[1] || 'Warrior'}></div>
                    <div className={this.state.deckStatus.picks[2] || 'Warrior'}></div>
                </div>
            </div>
        );
    }
});

const InGameFlyout = React.createClass({
    getInitialState() {
        return {
            message: '',
            twitterHandle: '',
            isTwitter: false,
            isActive: false
        }
    },

    startTwitterFlyout: function(signal) {
        this.setState({
            isTwitter: true,
            message: signal.message,
            twitterHandle: signal.twitterHandle,
            isActive: true
        })
    },

    startUpdateFlyout: function(signal) {
        console.log('hi');
        this.setState({
            isTwitter: false,
            message: signal.message,
            twitterHandle: 'Match Update:',
            isActive: true
        })
    },

    hideFlyout: function(signal) {
        this.setState({
            isActive: false
        })
    },

	componentDidMount: function() {
		nodecg.listenFor('startTwitterFlyout', this.startTwitterFlyout);
        nodecg.listenFor('startUpdateFlyout', this.startUpdateFlyout);
		nodecg.listenFor('hideFlyout', this.hideFlyout);
	},

    render: function() {
        const isTwitter = this.state.isTwitter;
        const isActive = this.state.isActive;

        return (
            <div className={isTwitter ? 'flyout twitter' : 'flyout update'} id={isActive ? 'active' : null}>
                <div className='flyoutContent'>
                    <div className='label'>{this.state.twitterHandle} </div>
                    <div className='message'> {this.state.message}</div>
                </div>
            </div>
        );

    }
});

ReactDOM.render(
	<InGame />,
	document.getElementById('content')
);