
import React from "react";
import {
    IonButton,
    IonButtons,
    IonContent,
    IonHeader,
    IonIcon,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonMenu,
    IonMenuButton,
    IonMenuToggle,
    IonNote,
    IonPage,
    IonRow,
    IonTitle,
    IonToolbar,
} from '@ionic/react';
import { useHistory } from "react-router";
import { GlobalDataService } from "../../GlobalDataService";
import { GDS } from "../../services/gds.service";
import { EffortlessBaseComponent } from '../../services/EffortlessBaseComponent'

export default class ShowsComponent extends EffortlessBaseComponent<{}, { shows: [], reloadRequested: boolean, dataReady: boolean }>  {

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
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonMenuButton />
                        </IonButtons>
                        <IonTitle>All {shows?.length} Shows</IonTitle>
                    </IonToolbar>
                </IonHeader>

                <IonContent fullscreen>
                    <IonHeader collapse="condense">
                        <IonToolbar>
                            <IonTitle size="large">Shows</IonTitle>
                        </IonToolbar>
                    </IonHeader>
                    <div>
                        <div>
                            <button onClick={this.reloadShows}>Reload</button>

                        </div>

                        <div>{shows?.map((show: any) =>
                            <div key={show.ShowId}>
                                <h3>{show.Name}</h3>
                                <IonButton routerLink={"/show/" + show.ShowCode} routerDirection="forward">View</IonButton>
                            </div>
                        )} </div>

                    </div>
                </IonContent>
            </IonPage>
        );
    }
}