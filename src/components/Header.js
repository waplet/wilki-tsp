import React, { Component } from 'react';
import { Link } from 'react-router-dom';


class Header extends Component {
    render() {
        return (
            <header className="bg-dark">
                <div className="container">
                    <nav className="navbar navbar-expand-lg navbar-dark">
                        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                            <span className="navbar-toggler-icon"/>
                        </button>
                        <div className="collapse navbar-collapse">
                            <ul className="navbar-nav mr-auto">
                                <li className="nav-item">
                                    <Link to='/' className="nav-link">Home</Link>
                                </li>
                                <li className="nav-item">
                                    <Link to='/distances' className="nav-link">Distances</Link>
                                </li>
                                <li className="nav-item">
                                    <Link to='/tsp' className="nav-link">TSP</Link>
                                </li>
                                <li className="nav-item">
                                    <Link to='/map' className="nav-link">Map</Link>
                                </li>
                            </ul>
                        </div>
                    </nav>
                </div>
            </header>
        )
    }
}

export default Header;