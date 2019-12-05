import React from 'react';
import Routes from './src/routes';

import { YellowBox } from 'react-native'

YellowBox.ignoreWarnings([
  'Unrecognized WebSocket connection',
  'Possible Unhandled Promise Rejection',
  'This is a no-op, but it indicates a memory leak in your application',
])

export default function App() {
  return <Routes />
}