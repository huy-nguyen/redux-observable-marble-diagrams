import 'bootstrap/dist/css/bootstrap.css';
import React from 'react';
import ReactDOM from 'react-dom';
import {
  Provider,
} from 'react-redux';
import {
  Store,
} from 'redux';
import {
  getConfiguredStore,
} from './getConfiguredStore';
import {
  Main,
} from './main';
import {
  Action,
  RootState,
} from './types';

const store: Store<RootState, Action> = getConfiguredStore();

const container = document.getElementById('container');

ReactDOM.render(
  // Need `any` typing while type definition problem is being sorted out:
  // https://github.com/DefinitelyTyped/DefinitelyTyped/pull/25709
  <Provider store={store as Store<RootState, any>}>
    <Main/>
  </Provider>,
container);
