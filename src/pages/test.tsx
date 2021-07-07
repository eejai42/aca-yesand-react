import React from "react";
import {
    IonButton,
    IonContent,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonMenu,
    IonMenuToggle,
    IonNote,
    IonRow,
} from '@ionic/react';
import { useHistory } from "react-router";
import { GlobalDataService } from "../GlobalDataService";
import { GDS } from "../services/gds.service";
import { EffortlessBaseComponent } from '../services/EffortlessBaseComponent'

export default class TestComponent extends EffortlessBaseComponent<{}, { shows: [], reloadRequested: boolean, dataReady: boolean }>  {

    constructor(props: any) {
        super(props);

        this.state = {
            shows: [],
            reloadRequested: true,
            dataReady: false,
        };

        this.reloadShows = this.reloadShows.bind(this);
    }


    async onReady() {
        this.reloadShows();
    }

    async reloadShows() {
        var reply = await this.context.moderator.GetShows(this.context.createPayload());
        var newState = { shows: reply.Shows, reloadRequested: true }
        this.setState(newState);
    }

    shouldComponentUpdate() {
        return this.state.reloadRequested;
    }


    render() {
        console.error('rendering');
        const { shows } = this.state;
        return (
            <div>
                <div>
                    <button onClick={this.reloadShows}>Reload</button>

                </div>

                <div> SHOWS: {shows?.length} {shows?.map((show: any) =>
                    <div key={show.ShowId}>
                        <h3>{show.Name}</h3>
                        <IonButton routerLink={"/page/Shows/" + show.Name} routerDirection="none">View</IonButton>
                     
                    </div>

                )} </div>

            </div>
        );
    }
}