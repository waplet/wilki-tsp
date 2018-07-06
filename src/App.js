import React, {Component} from 'react';
import './assets/css/App.css';
import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import Header from './components/Header';
import Main from './components/Main';

class App extends Component {
    render() {
        return (
            <div className="app full-size">
                <Header/>
                <Main/>
            </div>
        );
    }
}

export default App;
