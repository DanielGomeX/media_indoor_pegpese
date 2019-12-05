import React from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import "react-loader-spinner/dist/loader/css/react-spinner-loader.css";
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-balham.css';
import 'react-confirm-alert/src/react-confirm-alert.css';
import 'react-notifications/lib/notifications.css';
import { NotificationContainer } from 'react-notifications';

import './styles.css';
import Menu from './components/Menu/';
import Main from './pages/main';

function App() {
  return (
    <div className="App">
      <Menu />
      <Main />
      <NotificationContainer />
    </div>
  );
}

export default App;
