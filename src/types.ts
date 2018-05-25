/* Redux state */
export interface RootState {
  url: string;
  result: FetchResult;
}

export enum FetchStatus {
  Initial = 'Initial',
  InProgress = 'InProgress',
  Failed = 'Failed',
  Success = 'Success',
}

export type FetchResult = {
  status: FetchStatus.Initial,
} | {
  status: FetchStatus.InProgress,
} | {
  status: FetchStatus.Failed,
  message: string;
} | {
  status: FetchStatus.Success,
  data: string;
};

/* Actions */
export enum ActionTypes {
  FETCH_BEGIN = 'FETCH_BEGIN',
  FETCH_SUCCESS = 'FETCH_SUCCESS',
  FETCH_FAIL = 'FETCH_FAIL',
  FETCH_INITIAL = 'FETCH_INITIAL',
  UPDATE_URL = 'UPDATE_URL',
}

export interface FetchBeginAction {
  type: ActionTypes.FETCH_BEGIN;
}

export interface FetchSuccessAction {
  type: ActionTypes.FETCH_SUCCESS;
  payload: {
    data: string;
  };
}

export interface FetchFailAction {
  type: ActionTypes.FETCH_FAIL;
  payload: {
    message: string;
  };
}

export interface FetchInitialAction {
  type: ActionTypes.FETCH_INITIAL;
}

export interface UpdateURLAction {
  type: ActionTypes.UPDATE_URL;
  payload: {
    url: string;
  };
}

export type Action =
  FetchBeginAction | FetchSuccessAction | FetchFailAction | FetchInitialAction |
  UpdateURLAction;
