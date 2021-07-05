import React from "react";
import { useHistory } from "react-router";
import { GDS } from "../services/gds.service";


export default class TestComponent extends React.Component<{}, { shows : [], reloadRequested : boolean, dataReady : boolean }>  {
    private gds: GDS;
    constructor(props : any) {
        super(props);

        this.state = {
            shows: [],
            reloadRequested : true,
            dataReady : false,
        };

        this.reloadShows = this.reloadShows.bind(this);

        
        console.error('STARTING PAGE', process.env.SHOWS );
    }

    async onReady(ready : null) {
        console.error('GDS READY: ', ready);
        this.reloadShows();
    }

    async reloadShows() {
        var reply = await this.gds.guest.GetShows({});
        console.error('GOT SHOWS: ', reply);
        var newState = { shows : reply.Shows, reloadRequested : true}
        this.setState(newState);
    }

    shouldComponentUpdate() {
        if (this.state.reloadRequested) {
            return true;
        } else return false;
    }

    componentDidUpdate() {
        //console.error('COMPONENT UPDATED...');

    }

    componentDidMount() {
        console.error('COMPONENT MOUNTED...');
        var self = this;
        this.gds = new GDS();
        self.gds.readiness$.subscribe((ready) => {
            if (ready) self.onReady(ready);
        })
    }

    render() {
        console.error('rendering');
        const { shows } = this.state;
        return (            
            <div>
                <div>
                    <button onClick={this.reloadShows}>Reload</button>
                </div>
                <div> SHOWS: {shows.length} {shows.map((show : any) => 
                    <div key={show.ShowId}>
                        <h3>{show.Name}</h3>
                        <a onClick={() => console.error('test')}>View</a>
                    </div>
                )} </div>
                
            </div>
        );
    }
}