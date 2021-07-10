
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
    }

    async reloadShow() {
        let payload = this.context.createPayload()
        payload.AirtableWhere = "ShowCode='" + this.state.showCode + "'";
        var reply = await this.context.moderator.GetShows(payload);
        if (this.hasNoErrors(reply) && reply.Shows && reply.Shows.length) {
            console.error('GOT SHOW: ', reply.Shows[0]);
            var newState = { show: reply.Shows[0], reloadRequested: true }
            this.setState(newState);
        }
    }

    componentDidMount() {
        this.didMount = true;
        this.tryReload();
    }

    tryReload() {
        if ((this.state.show == undefined) && this.context.isReady && this.didMount) this.reloadShow();
    }

    shouldComponentUpdate() {
        var reload = this.props.location.pathname != this.props.match.url;
        if (reload) {
            this.tryReload();
            console.error('RELOADING SHOW', this.state, this.props);
        }
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
                        <IonTitle>All Shows</IonTitle>
                    </IonToolbar>
                </IonHeader>

                <IonContent fullscreen>
                    <IonHeader collapse="condense">
                        <IonToolbar>
                            <IonTitle size="large">Shows</IonTitle>
                        </IonToolbar>
                    </IonHeader>
                    <div>
                        <h1>Show - {this.state.showCode}</h1>
                        <div>
                            <button onClick={this.reloadShow}>Reload</button>
                        </div>
                        <div>
                            SHOW CODE: {this.props.showCode}
                        </div>

                        <div>
                            <h3>{show?.Name}</h3>
                        </div>
                    </div>
                </IonContent>
            </IonPage>
        );
    }
}