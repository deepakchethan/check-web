import React, { Component } from 'react';
import { defineMessages, injectIntl, intlShape } from 'react-intl';
import styled from 'styled-components';
import FaCircle from 'react-icons/lib/fa/circle';
import FaCircleO from 'react-icons/lib/fa/circle-o';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import { can } from '../Can';
import CheckContext from '../../CheckContext';
import { getStatus, getStatusStyle } from '../../helpers';
import { mediaStatuses, mediaLastStatus } from '../../customHelpers';
import {
  units,
  black54,
} from '../../styles/js/variables';


const StyledMenuItem = styled(MenuItem)`
  @include media-status-menu-hover-colors;
  @include media-status-font-colors;
  align-items: center;
  display: flex;
  padding: 0 ${units(1)};

  svg {
    height: ${units(2)};
    margin: 0 ${units(1)};
    width: ${units(2)};
  }
`;

const messages = defineMessages({
  error: {
    id: 'mediaStatus.error',
    defaultMessage: "We're sorry, but we encountered an error trying to update the status.",
  },
});

class MediaStatusCommon extends Component {
  constructor(props) {
    super(props);

    this.state = {
      message: null,
    };
  }

  canUpdate() {
    return !this.props.readonly && can(this.props.media.permissions, 'create Status');
  }

  bemClass(baseClass, modifierBoolean, modifierSuffix) {
    return modifierBoolean ? [baseClass, baseClass + modifierSuffix].join(' ') : baseClass;
  }

  currentStatusToClass(status) {
    if (status === '') {
      return '';
    }
    return ` media-status__current--${status.toLowerCase().replace(/[ _]/g, '-')}`;
  }

  handleStatusClick(clickedStatus) {
    const { media } = this.props;
    const store = new CheckContext(this).getContextStore();

    if (clickedStatus !== mediaLastStatus(media)) {
      this.props.setStatus(this, store, media, clickedStatus, this.props.parentComponent, null);
    }
  }

  fail(transaction) {
    const that = this;
    const error = transaction.getError();
    let message = this.props.intl.formatMessage(messages.error);
    try {
      const json = JSON.parse(error.source);
      if (json.error) {
        message = json.error;
      }
    } catch (e) {}
    that.setState({ message });
  }

  success() {
    // this.setState({ message: 'Status updated.' });
  }

  render() {
    const that = this;
    const { media } = this.props;
    const statuses = JSON.parse(mediaStatuses(media)).statuses;
    const currentStatus = getStatus(mediaStatuses(media), mediaLastStatus(media));

    return (
      <div className={this.bemClass('media-status', this.canUpdate(), '--editable')}>
        <span className="media-status__message">{this.state.message}</span>

        {this.canUpdate()
          ?
            <DropDownMenu
              value={currentStatus.label}
              underlineStyle={{ borderWidth: 0 }}
              iconStyle={{ fill: black54 }}
            >
              {statuses.map(status =>
                <MenuItem
                  key={status.id}
                  className={`${that.bemClass(
                  'media-status__menu-item',
                  mediaLastStatus(media) === status.id,
                  '--current',
                )} media-status__menu-item--${status.id.replace('_', '-')}`}
                  onClick={that.handleStatusClick.bind(that, status.id)}
                  style={{ color: getStatusStyle(status, 'color') }}
                  value={status.label}
                  primaryText={<div>
                    {mediaLastStatus(media) === status.id ?
                      <FaCircle />
                      : <FaCircleO />
                    }
                    <span className="media-status__label">{status.label}</span>
                  </div>
                  }
                />,
            )}
            </DropDownMenu>

          : null}
      </div>
    );
  }
}

MediaStatusCommon.propTypes = {
  intl: intlShape.isRequired,
};

MediaStatusCommon.contextTypes = {
  store: React.PropTypes.object,
};

export default injectIntl(MediaStatusCommon);
