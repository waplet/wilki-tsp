import React, { Component } from 'react';

class Tsp extends Component {
    render() {
        return (
            <div className={'container'}>
                <form className={'col-md-8'} onSubmit={this.getPath}>
                    <div className="form-group">
                        <label>Distance data</label>
                        <small className={'form-text text-muted'}>
                            Please provide distance matrix {"[{\"lat\": Number: \"lng\": Number, \"distance\": Number}]"}
                        </small>
                        <textarea
                            className={'form-control'}
                            onChange={event => this.props.onChange({pointDistances: event.target.value})}
                            value={this.props.pointDistances}/>
                    </div>
                    <div className={"form-group"}>
                        <button type="submit" className="btn btn-primary">Get path</button>
                    </div>
                    {
                        this.props.errorMessage
                            ? <div className={'alert alert-danger'}>
                                {this.props.errorMessage}
                            </div>
                            : ''
                    }
                    {
                        (this.props.result)
                            ? <div className="form-group">
                                <label>Result</label>
                                <textarea className={'form-control'} value={this.props.result} rows="50" readOnly={true}/>
                            </div>
                            : ''
                    }
                </form>
            </div>
        )
    }

    getPath = async (event) => {
        event.preventDefault();
        // Clear errors
        this.props.onChange({errorMessage: ''});

        let pointDistances = [];
        try {
            pointDistances = JSON.parse(this.props.pointDistances);
        } catch (e) {
            this.props.onChange({errorMessage: "Could not parse input"});
            return;
        }

        try {
            const response = await fetch('/api/path', {
                method: "post",
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({
                    pointDistances: pointDistances || []
                })
            });

            let body = await response.text();

            try {
                body = JSON.parse(body);
            } catch (e) {
                console.error("Not a JSON received");
                this.props.onChange({errorMessage: body});
                return;
            }

            if (response.status !== 200) {
                this.props.onChange({errorMessage: body});
                return;
            }

            this.props.onChange({result: JSON.stringify(body, null, 2)});
        } catch (e) {
            console.error(e);
        }
    }
}

export default Tsp;