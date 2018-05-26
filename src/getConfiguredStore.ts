import {
  applyMiddleware,
  createStore,
} from 'redux';
import {
  createEpicMiddleware,
} from 'redux-observable';
import {
  composeWithDevTools,
} from 'remote-redux-devtools';
import {
  getEpic,
} from './epic';
import {
  reducer,
} from './reducer';
import {
  Action,
  RootState,
} from './types';

export const getConfiguredStore = () => {
  const epic = getEpic();
  const epicMiddleware = createEpicMiddleware(epic);

  const composeEnhancers = composeWithDevTools({
    // Disable redux devtools in production:
    realtime: (process.env.NODE_ENV === 'development'),
    // Note: `MAIN_THREAD_REDUX_DEV_TOOLS_PORT` will be replaced with a string
    // value by webpack's `DefinePlugin`:
    port: MAIN_THREAD_REDUX_DEV_TOOLS_PORT,
  });

  const store = createStore<RootState, Action, {}, {}>(
    reducer, composeEnhancers(applyMiddleware(epicMiddleware)),
  );

  return store;
};
