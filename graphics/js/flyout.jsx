const FlyoutDisplay = React.createClass({
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
	<FlyoutDisplay />,
	document.getElementById('content')
);