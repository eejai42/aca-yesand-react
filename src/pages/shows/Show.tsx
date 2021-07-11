
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
import { useHistory, useParams } from "react-router";
import { GlobalDataService } from "../../GlobalDataService";
import { GDS } from "../../services/gds.service";
import { EffortlessBaseComponent } from '../../services/EffortlessBaseComponent'

export default class ShowComponent extends EffortlessBaseComponent<{ showCode: string, location: any, match: any }, {
    show: any, reloadRequested: boolean,
    dataReady: boolean, showCode: string
}> {
    didMount: boolean = false;

    constructor(props: any) {
        super(props);

        this.state = {
            show: undefined,
            showCode: props.match.params.showCode,
            reloadRequested: true,
            dataReady: false,
        };

        this.reloadShow = this.reloadShow.bind(this);
    }


    async onReady() {
        this.reloadShow();
    }

    async reloadShow() {
        let payload = this.context.createPayload()
        payload.AirtableWhere = "ShowCode='" + this.state.showCode + "'";
        var reply = await this.context.moderator.GetShows(payload);
        if (this.hasNoErrors(reply) && reply.Shows && reply.Shows.length) {
            var show = reply.Shows[0];
            console.error('GOT SHOW: ', show);
            payload.AirtableWhere = `Show='${show.Name}'`;
            reply = await this.context.moderator.GetShowSeasons(payload);
            if (this.hasNoErrors(reply)) {
                show.ShowSeasons = reply.ShowSeasons;
            }
            var newState = { show: show, reloadRequested: true }
            this.setState(newState);
        }
    }

    shouldComponentUpdate() {
        var reload = this.props.location.pathname != this.props.match.url;
        return this.state.reloadRequested || reload;
    }


    render() {
        console.error('rendering');
        const { show } = this.state;
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonMenuButton />
                        </IonButtons>
                        <div style={{float: 'right'}}>
                            <button onClick={this.reloadShow}>Reload</button>
                        </div>
                        <IonTitle>{show?.Name || 'Loading show...'}</IonTitle>
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
                            {show?.Attachments?.length ? <div><img src={show?.Attachments[0].url} style={{width: '6em', float: 'left'}} /></div> : undefined}
                            <h3>{show?.ShowSeasons?.length} Seasons </h3>
                            <div>
                                <b>Description: </b>
                            </div>
                            <div>
                            {show?.Notes || 'no description yet...'}
                            </div>
                            <div style={{clear: 'both'}}>
                                {show?.ShowSeasons
                                    ?.sort((a: any, b: any) => a.SeasonNumber > b.SeasonNumber ? 1 : -1)
                                    .map((season: any) => {
                                        return <div key={season.Name}>
                                            <IonButton routerLink={"/season/" + season.Name} style={{float:'left'}}> {season?.Name}</IonButton>
                                        </div>
                                    })}
                            </div>
                        </div>
                    </div>
                </IonContent>
            </IonPage>
        );
    }
}