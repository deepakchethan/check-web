import React, { Component, PropTypes } from 'react';
import Relay from 'react-relay';
import util from 'util';
import Header from './Header';
import FooterRelay from '../relay/FooterRelay';
import LoginMenu from './LoginMenu';
import Message from './Message';
import { request } from '../actions/actions';
import Colors from 'material-ui/lib/styles/colors';
import getMuiTheme from 'material-ui/lib/styles/getMuiTheme';
import themeDecorator from 'material-ui/lib/styles/theme-decorator';
import AppBar from 'material-ui/lib/app-bar';
import TeamSidebar from './TeamSidebar';

import { Link } from 'react-router';
import FontAwesome from 'react-fontawesome';
import config from 'config';

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: Colors.blueGrey400,
    primary2Color: Colors.blueGrey600,
    primary3Color: Colors.blueGrey800,
    accent1Color: Colors.blue600,
    accent2Color: Colors.blue700,
    accent3Color: Colors.blue800
  }
});

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isSidebarActive: false
    };
  }

  setUpGraphql(token) {
    var headers = config.relayHeaders;
    if (token) {
      headers = {
        'X-Checkdesk-Token': token
      }
    }
    Relay.injectNetworkLayer(new Relay.DefaultNetworkLayer(config.relayPath, { headers: headers }));
  }

  startSession(state) {
    var that = this;
    if (!state.token && !state.error) {
      var token = window.storage.getValue('token');
      if (token) {
        state.token = token;
        that.forceUpdate();
      }
      else {
        var failureCallback = function(message) {
          state.message = message;
          state.error = true;
          that.forceUpdate();
        };
        var successCallback = function(data) {
          if (data) {
            state.token = data.token;
          }
          else {
            state.error = true;
          }
          that.forceUpdate();
        }
        request('get', 'me', failureCallback, successCallback);
      }
    }
  }

  toggleSidebar() {
    this.setState({isSidebarActive: !this.state.isSidebarActive});
  }

  sidebarActiveClass(baseClass) {
    return this.state.isSidebarActive ? [baseClass, baseClass + '--sidebar-active'].join(' ') : baseClass;
  }

  render() {
    const { state } = this.props;

    this.startSession(state.app);

    this.setUpGraphql(state.app.token);

    if (!this.props.children.props.route.public && !state.app.token) {
      if (state.app.error) {
        return (<LoginMenu {...this.props} />);
      }
      return null;
    }

    const routeIsFullscreen = this.props.children.props.route.fullscreen;
    if (routeIsFullscreen) {
      return (<div className='home home--fullscreen'>{this.props.children}</div>);
    }

    var team = {
      name: 'Meedan',
      avatar: 'https://pbs.twimg.com/profile_images/610557679249981440/2ARl7GLu.png',
      projects: [
        {name: 'Project 1', url: '/project/1'},
        {name: 'Project 2', url: '/project/2'},
        {name: 'Project 3', url: '/project/3'}
      ],
      url: '/teams/1',
      membersCount: 14
    };

    return (
      <div className='home'>
        <div className={this.sidebarActiveClass('home__sidebar')}>
          <TeamSidebar team={team} history={this.props.history} />
        </div>
        <main className={this.sidebarActiveClass('home__content')}>
          <div className={this.sidebarActiveClass('home__content-overlay')} onClick={this.toggleSidebar.bind(this)}></div>

          <Header {...this.props} team={team} toggleSidebar={this.toggleSidebar.bind(this)} />
          <div className="global-message"><Message message={state.app.message} /></div>
          <div className='home__content-children'>{this.props.children}</div>

          <FooterRelay {...this.props} />
        </main>
      </div>
    );
  }
}

export default themeDecorator(muiTheme)(Home);
