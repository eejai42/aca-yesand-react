
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

export default class ShowsComponent extends EffortlessBaseComponent {

    constructor(props: any) {
        super(props);

        this.state = {
            shows: []
        };
    }

    async reloadShows() {
        var reply = await this.context.moderator.GetShows(this.context.createPayload());
        var newState = { shows: reply.Shows, reloadRequested: true }
        this.setState(newState);
    }

    componentDidUpdate() {
        if (this.state.isReady && !this.state.shows?.length) {
            this.reloadShows()
        }
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
                        <IonTitle>{shows?.length ? <span>All {shows?.length} Shows</span> : <span>Loading shows...</span>}</IonTitle>
                    </IonToolbar>
                </IonHeader>

                <IonContent fullscreen>
                    <div>
                        <div>
                            <button onClick={() => this.reloadShows()}>Reload</button>
                        </div>

                        <div>
                            {shows?.sort((a: any, b: any) => a.AutoNumber > b.AutoNumber ? 1 : -1).map((show: any) =>
                                <div key={show.ShowId} style={{ float: 'left', width: '33%', height: '15em', display: 'block', border: 'solid black 1px', 
                                                                padding: '0.5em', margin: '0.5em', borderRadius: '1em' }}>
                                    <img style={{ float: 'left', width: '8em' }} src={show.Attachments[0].url} />
                                    <h3>{show.Name}</h3>
                                    <IonButton routerLink={"/show/" + show.ShowCode} routerDirection="forward">View</IonButton>
                                </div>
                            )}
                        </div>
                    </div>
                </IonContent>
            </IonPage>
        );
    }
}