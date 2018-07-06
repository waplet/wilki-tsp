import React, { Component } from 'react';
import { Switch, Route } from 'react-router-dom';

import Intro from './pages/Intro';
import Map from './pages/Map';
import Distances from './pages/Distances';
import Tsp from './pages/Tsp';

class Main extends Component {
    state = {
        distances: {
            pointsData: '',
            result: '',
            errorMessage: ''
        },
        tsp: {
            pointDistances: '',
            result: '',
            errorMessage: ''
        },
        map: {
            pointsData: '',
            points: [],
            errorMessage: ''
        }
    };

    render() {
        return (
            <div className="pt-3 full-size">
                <Switch>
                    <Route exact path='/' component={Intro}/>
                    <Route exact path='/map' render={() => (
                        <Map {...this.state.map} onChange={this.handleMapChanges.bind(this)}/>
                    )}/>
                    <Route exact path='/distances' render={() => (
                        <Distances {...this.state.distances} onChange={this.handleDistancesChanges.bind(this)}/>
                    )}/>
                    <Route exact path='/tsp' render={() => (
                        <Tsp {...this.state.tsp}  onChange={this.handleTspChanges.bind(this)}/>
                    )}/>
                </Switch>
            </div>
        )
    }

    handleDistancesChanges(changes) {
        this.setState({ distances: {...this.state.distances, ...changes}});
    }

    handleTspChanges(changes) {
        this.setState({ tsp: {...this.state.tsp, ...changes}});
    }

    handleMapChanges(changes) {
        this.setState({ map: {...this.state.map, ...changes}});
    }
}

export default Main;