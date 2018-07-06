import React, { Component } from 'react';

class Intro extends Component {
    state = {
        response: ''
    };

    componentDidMount() {
        this.callApi()
            .then(res => this.setState({ response: res.express }))
            .catch(err => console.log(err));
    }
    render() {
        return (
            <div>
                <p className="app__intro">
                    To get started, edit <code>src/App.js</code> and save to reload.
                </p>
                <p>{this.state.response}</p>
            </div>
        )
    }

    callApi = async () => {
        const response = await fetch('/api/hello');
        const body = await response.json();

        if (response.status !== 200) throw Error(body.message);

        return body;
    }

}

export default Intro;