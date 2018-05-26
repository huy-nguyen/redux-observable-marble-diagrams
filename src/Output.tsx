import React from 'react';
import {
  connect,
  MapStateToProps,
} from 'react-redux';
import {
  Dispatch,
} from 'redux';
import {
  Action,
  FetchResult,
  FetchStatus,
  RootState,
} from './types';
import {
  failIfNonExhaustive,
} from './Utils';

interface StateProps {
  result: FetchResult;
}

type OwnProps = {};

interface DispatchProps {
  dispatch: Dispatch<Action>;
}

type Props = StateProps & DispatchProps & OwnProps;

class UnwrappedOutput extends React.Component<Props> {
  render() {
    const statusStyle = {
      margin: '1rem 0',
    };
    const {result} = this.props;
    let content: JSX.Element;
    switch (result.status) {
      case FetchStatus.Initial:
        content = (
          <div style={statusStyle}>Please enter a URL</div>
        );
        break;
      case FetchStatus.Success:
        content = (
          <>
            <div style={statusStyle}>Status: Fetch Success!</div>
            <pre style={{...statusStyle, border: '1px solid black'}}>
              {result.data}
            </pre>
          </>
        );
        break;
      case FetchStatus.InProgress:
        content = (
          <div style={statusStyle}>Fetching...</div>
        );
        break;
      case FetchStatus.Failed:
        content = (
          <>
            <div style={statusStyle}>Status: Fetch Failed!</div>
            <div style={statusStyle}>Reason: {result.message}</div>
          </>
        );
        break;
      default:
        failIfNonExhaustive(result, 'Invalid fetch status');
        // These lines will never be executed:
        content = (<div/>);
    }
    return (
      <div style={{margin: '1rem'}}>
        {content}
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> =
  (state: RootState): StateProps => ({result: state.result});

export const Output = connect<StateProps, {}, OwnProps, RootState>(mapStateToProps)(UnwrappedOutput);
