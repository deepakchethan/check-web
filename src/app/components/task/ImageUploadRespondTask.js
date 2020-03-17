import React from 'react';
import { FormattedMessage } from 'react-intl';
import Button from '@material-ui/core/Button';
import UploadImage from '../UploadImage';
import Message from '../Message';

class ImageUploadRespondTask extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      image: null,
      message: null,
    };
  }

  onImage(image) {
    this.setState({ image });
  }

  onImageError(file, message) {
    this.setState({ message });
  }

  handleSubmit() {
    if (this.state.image) {
      this.props.onSubmit(this.state.image.name, this.state.image);
      this.setState({ message: null, image: null });
    }
  }

  handleCancel() {
    this.setState({ message: null, image: null });
    if (this.props.onDismiss) {
      this.props.onDismiss();
    }
  }

  render() {
    const actionButtons = (
      <p className="task__resolver">
        <Button
          className="task__cancel"
          onClick={this.handleCancel.bind(this)}
        >
          <FormattedMessage id="imageUploadRespondTask.cancelTask" defaultMessage="Cancel" />
        </Button>
        <Button
          className="task__save"
          onClick={this.handleSubmit.bind(this)}
          disabled={!this.state.image}
          color="primary"
        >
          <FormattedMessage id="imageUploadRespondTask.answerTask" defaultMessage="Answer task" />
        </Button>
      </p>
    );

    return (
      <div>
        <Message message={this.state.message} />
        <UploadImage
          type="image"
          onImage={this.onImage.bind(this)}
          onError={this.onImageError.bind(this)}
        />
        {actionButtons}
      </div>
    );
  }
}

export default ImageUploadRespondTask;
