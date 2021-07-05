import React from "react";
import { GDS } from "../services/gds.service";


export default class TestComponent extends React.Component<{}, { shows : [] }>  {
    constructor(props : any) {
        super(props);

        this.state = {
            shows: []
        };

        
        console.error('STARTING PAGE', process.env.SHOWS );
        var self = this;
        var gds = new GDS();
        gds.readiness$.subscribe((ready) => {
            console.error('GOT SHOWS', gds.shows);
            self.setState({shows : gds.shows});
        })
    }

    render() {
        const { shows } = this.state;
        return (
            <div>
                <p> SHOWS: {shows.map((show : any) => <div>{show.Name}</div>)} </p>
            </div>
        );
    }
}