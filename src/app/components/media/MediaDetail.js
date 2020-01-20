import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { injectIntl, intlShape } from 'react-intl';
import { Card } from 'material-ui/Card';
import rtlDetect from 'rtl-detect';
import MediaExpanded from './MediaExpanded';
import MediaCondensed from './MediaCondensed';
import CheckContext from '../../CheckContext';

class MediaDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    if (this.props.parentComponentName === 'MediaRelated') {
      this.subscribe();
    }
  }

  componentWillUnmount() {
    if (this.props.parentComponentName === 'MediaRelated') {
      this.unsubscribe();
    }
  }

  getContext() {
    return new CheckContext(this).getContextStore();
  }

  subscribe() {
    const { pusher } = this.getContext();
    if (pusher) {
      pusher.subscribe(this.props.media.pusher_channel).bind('media_updated', 'MediaDetail', (data, run) => {
        if (this.props.parentComponentName === 'MediaRelated') {
          if (run) {
            this.props.parentComponent.props.relay.forceFetch();
            return true;
          }
          return {
            id: `parent-media-${this.props.parentComponent.props.media.dbid}`,
            callback: this.props.parentComponent.props.relay.forceFetch,
          };
        }
        return false;
      });
    }
  }

  unsubscribe() {
    const { pusher } = this.getContext();
    if (pusher) {
      pusher.unsubscribe(this.props.media.pusher_channel);
    }
  }

  render() {
    const {
      media,
      annotated,
      annotatedType,
      intl: { locale },
    } = this.props;

    const isRtl = rtlDetect.isRtlLang(locale);

    // Build the item URL

    const path = this.props.location
      ? this.props.location.pathname
      : window.location.pathname;
    let projectId = media.project_id;
    if (/project\/([0-9]+)/.test(path)) {
      projectId = path.match(/project\/([0-9]+)/).pop();
    }
    if (!projectId && annotated && annotatedType === 'Project') {
      projectId = annotated.dbid;
    }
    let mediaUrl = projectId && media.team && media.dbid > 0
      ? `/${media.team.slug}/project/${projectId}/media/${media.dbid}`
      : null;
    if (!mediaUrl && media.team && media.dbid > 0) {
      mediaUrl = `/${media.team.slug}/media/${media.dbid}`;
    }

    return (
      <Card className="card media-detail">
        { this.props.condensed ?
          <MediaCondensed
            media={this.props.media}
            mediaUrl={mediaUrl}
            mediaQuery={this.props.query}
            currentRelatedMedia={this.props.currentRelatedMedia}
            isRtl={isRtl}
          /> :
          <MediaExpanded
            media={this.props.media}
            mediaUrl={mediaUrl}
            mediaQuery={this.props.query}
            isRtl={isRtl}
          /> }
      </Card>
    );
  }
}

MediaDetail.propTypes = {
  // https://github.com/yannickcr/eslint-plugin-react/issues/1389
  // eslint-disable-next-line react/no-typos
  intl: intlShape.isRequired,
};

MediaDetail.contextTypes = {
  store: PropTypes.object,
};

export default injectIntl(MediaDetail);
