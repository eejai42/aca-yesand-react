import React from "react";
import { GDS } from "../services/gds.service";


export default class TestComponent extends React.Component<{}, { shows : [], reloadRequested : boolean, dataReady : boolean }>  {
    private gds: GDS;
    constructor(props : any) {
        super(props);

        this.state = {
            shows: [],
            reloadRequested : false,
            dataReady : false,
        };

        this.reloadShows = this.reloadShows.bind(this);

        
        console.error('STARTING PAGE', process.env.SHOWS );
    }
    async onReady(ready: null) {
        console.error('GDS READY: ', ready);
        this.reloadShows();
    }

    async reloadShows() {
        var shows = await this.gds.loadData(this.gds.guest);
        var newState = { shows : shows, reloadRequested : true}
        this.setState(newState);
        console.error('SHOWS RELOADED', newState);

        this.setState({reloadRequested : true, dataReady : false, shows : shows});
    }

    shouldComponentUpdate() {
        if (this.state.reloadRequested) {
            this.setState({shows : this.gds.shows || [], reloadRequested : false, dataReady : false});
            return true;
        } else return false;
    }

    componentDidUpdate() {
        //console.error('COMPONENT UPDATED...');

    }

    componentDidMount() {
        //console.error('COMPONENT MOUNTED...');
        var self = this;
        this.gds = new GDS();
        self.gds.readiness$.subscribe((ready) => {
            if (ready) self.onReady(ready);
        })
    }

    render() {
        const { shows } = this.state;
        return (            
            <div>
                <div>
                    <button onClick={this.reloadShows}>Reload</button>
                </div>
                <div> SHOWS: {shows.map((show : any) => <div key={show.ShowId}>{show.Name}</div>)} </div>
            </div>
        );
    }
}