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
  ActionTypes,
  RootState,
  UpdateURLAction,
} from './types';

interface StateProps {
  url: string;
}

type OwnProps = {};

interface DispatchProps {
  dispatch: Dispatch<Action>;
}

type Props = StateProps & DispatchProps & OwnProps;
class UnwrappedInput extends React.Component<Props> {
  private onChange = (e: React.FormEvent<HTMLInputElement>) => {
    const {dispatch} = this.props;
    dispatch<UpdateURLAction>({type: ActionTypes.UPDATE_URL, payload: {url: e.currentTarget.value}});
  }
  render() {
    const {url} = this.props;
    return (
      <div style={{margin: '1rem'}}>
        <label htmlFor='basic-url'>Enter a GitHub URL</label>
        <div className='input-group mb-3'>
          <input type='text' className='form-control' id='basic-url'
            placeholder='https://github.com/ReactiveX/rxjs/blob/master/index.js'
            aria-describedby='basic-addon3' value={url} onChange={this.onChange}/>
        </div>
      </div>
    );
  }
}

const mapStateToProps: MapStateToProps<StateProps, OwnProps, RootState> =
  (state: RootState): StateProps => ({url: state.url});

export const Input = connect<StateProps, {}, OwnProps, RootState>(mapStateToProps)(UnwrappedInput);
