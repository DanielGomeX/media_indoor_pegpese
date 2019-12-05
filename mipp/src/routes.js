import { createAppContainer, createSwitchNavigator } from 'react-navigation';

import Menu from './pages/Menu';
import ImageScreen from './pages/ImageScreen';

const Routes = createAppContainer(
    createSwitchNavigator({
        Menu,
        ImageScreen
    })
);

export default Routes;