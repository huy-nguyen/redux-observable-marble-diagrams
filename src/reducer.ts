import {
  Reducer,
} from 'redux';
import {
  Action,
  ActionTypes,
  FetchStatus,
  RootState,
} from './types';

const initialState: RootState = {
  url: '',
  result: {
    status: FetchStatus.Initial,
  },
};

export const reducer: Reducer<RootState, Action> =
  (prevState: RootState = initialState, action: Action): RootState => {

  switch (action.type) {
    case ActionTypes.UPDATE_URL:
      return {
        ...prevState,
        url: action.payload.url,
      };
    case ActionTypes.FETCH_BEGIN:
      return {
        ...prevState,
        result: {
          status: FetchStatus.InProgress,
        },
      };
    case ActionTypes.FETCH_SUCCESS:
      return {
        ...prevState,
        result: {
          status: FetchStatus.Success,
          data: action.payload.data,
        },
      };
    case ActionTypes.FETCH_FAIL:
      return {
        ...prevState,
        result: {
          status: FetchStatus.Failed,
          message: action.payload.message,
        },
      };
    case ActionTypes.FETCH_INITIAL:
      return {
        ...prevState,
        result: {
          status: FetchStatus.Initial,
        },
      };
    default:
      return prevState;
  }
};
