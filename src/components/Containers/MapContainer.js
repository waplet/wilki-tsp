import {Map, GoogleApiWrapper, Polyline, Marker, InfoWindow} from 'google-maps-react';
import React, { Component } from 'react';

const GOOGLE_MAPS_API_KEY='AIzaSyDa59Kx9BUyJUKIHYvZVNIsGrA01SNGCVo';

export class MapContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            showingInfoWindow: false,
            activeMarker: {},
            selectedPlace: {},
        };

        this.onMapClick = this.onMapClick.bind(this);
        this.onMarkerClick = this.onMarkerClick.bind(this);
    }

    render() {
        const style = {
            width: '100%',
            height: '100%'
        };

        return (
            <Map
                google={this.props.google}
                onClick={this.onMapClick}
                zoom={8}
                style={style}
                initialCenter={{
                    lat: 56.9714549,
                    lng: 24.0591238
                }}
            >
                {this.props.points.map((point, index) => {
                    return (
                        <Marker
                            position={point}
                            name={'Lat: ' + point.lat + ', Lng: ' + point.lng}
                            key={index}
                            onClick={this.onMarkerClick}
                        />
                    )
                })}
                <Polyline
                    path={this.props.points}
                    strokeColor="#0000FF"
                    strokeOpacity={0.8}
                    strokeWeight={2}
                />
                <InfoWindow
                    marker={this.state.activeMarker}
                    visible={this.state.showingInfoWindow}
                >
                    <div>
                        <h3>{this.state.selectedPlace.name}</h3>
                    </div>
                </InfoWindow>
            </Map>
        )
    }

    onMarkerClick(props, marker, e) {
        this.setState({
            selectedPlace: props,
            activeMarker: marker,
            showingInfoWindow: true
        });
    }

    onMapClick(props) {
        if (this.state.showingInfoWindow) {
            this.setState({
                showingInfoWindow: false,
                activeMarker: null
            });
        }
    }
}

export default GoogleApiWrapper({
    apiKey: GOOGLE_MAPS_API_KEY
})(MapContainer)