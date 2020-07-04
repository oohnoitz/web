import { configureStore, combineReducers } from '@reduxjs/toolkit'
import appReducer, { appInitialState } from './redux'
import contestReducer, { contestInitialState } from '@app/contest/redux'
import rankingReducer, { rankingInitialState } from '@app/ranking/redux'
import sessionReducer, { sessionInitialState } from '@app/session/redux'

const initialState = {
  app: appInitialState,
  contest: contestInitialState,
  ranking: rankingInitialState,
  session: sessionInitialState,
}

export type RootState = typeof initialState

export const reducer = combineReducers({
  app: appReducer,
  contest: contestReducer,
  ranking: rankingReducer,
  session: sessionReducer,
})

export function initializeStore(state = initialState) {
  return configureStore({
    reducer,
    preloadedState: state,
  })
}

const dispatch = initializeStore().dispatch

export type Dispatch = typeof dispatch
