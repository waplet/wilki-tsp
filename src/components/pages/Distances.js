import React, {Component} from 'react';

class Distances extends Component {
    render() {
        return (
            <div className={'container'}>
                <form className={'col-md-8'} onSubmit={this.getDistances}>
                    <div className="form-group">
                        <label>Points</label>
                        <small className={'form-text text-muted'}>
                            Please provide points in json {"[{lat: Number: lng: Number}]"}
                        </small>
                        <textarea
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

    getDistances = async (event) => {
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
            const response = await fetch('/api/distances', {
                method: "post",
                headers: {'Content-Type':'application/json'},
                body: JSON.stringify({
                    points: points || []
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

export default Distances;