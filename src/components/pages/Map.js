import React, { Component } from 'react';
import MapContainer from '../Containers/MapContainer';

class Map extends Component {
    constructor(props) {
        super(props);

        props.onChange({points: [{"lat":56.5408573,"lng":20.9090444},{"lat":56.3311733,"lng":23.7517331},{"lat":56.6441733,"lng":23.6417331},{"lat":56.9714549,"lng":24.0591238}]});
    }

    componentDidMount() {
    }

    render() {
        return (
            <div className={'container-fluid full-size'}>
                <div style={{height: '30vh'}}>
                    <form className={'col-md-8'} onSubmit={this.getRoute}>
                        <div className="form-group">
                            <label>Points</label>
                            <small className={'form-text text-muted'}>
                                Please provide points in json {"[{lat: Number: lng: Number}]"}
                            </small>
                            <textarea
                                rows={5}
                                className={'form-control'}
                                onChange={event => this.props.onChange({pointsData: event.target.value})}
                                value={this.props.pointsData}/>
                        </div>
                        <div className={"form-group"}>
                            <button type="submit" className="btn btn-primary">Get distances</button>
                        </div>
                        {
                            this.props.errorMessage
                                ? <div className={'alert alert-danger'}>
                                    {this.props.errorMessage}
                                </div>
                                : ''
                        }
                    </form>
                </div>
                <div className={'full-size'} style={{position: 'relative', height: '65vh'}}>
                    <MapContainer points={this.props.points}/>
                </div>
            </div>
        )
    }

    getRoute = async (event) => {
        event.preventDefault();
        this.props.onChange({errorMessage: ''});

        let points = [];
        try {
            points = JSON.parse(this.props.pointsData);
        } catch (e) {
            this.props.onChange({errorMessage: "Could not parse input"});
            return;
        }

        try {
            const response = await fetch('/api/route', {
                method: "post",
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({
                    points: points || []
                })
            });

            let body;

            try {
                body = await response.json();
            } catch (e) {
                console.error("Not a JSON received");
                this.props.onChange({errorMessage: body});
                return;
            }

            if (response.status !== 200) {
                this.props.onChange({errorMessage: body});
                return;
            }

            this.props.onChange({points: body});
        } catch (e) {
            console.error(e);
        }
    }
}

export default Map;