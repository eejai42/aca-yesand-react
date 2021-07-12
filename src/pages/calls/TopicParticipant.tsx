
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
import { curveNatural } from "d3";
import { BehaviorSubject } from "rxjs";

export default class TopicParticipantComponent extends EffortlessBaseComponent<{ call: any, callparticipant: any, changed : any }, 
                                                                            { call: any, callparticipant: any, changed : any}> {

    constructor(props: any) {
        super(props);

        this.state = {
            call: props.call,
            callparticipant: props.callparticipant,
            changed : props.changed
        };

        this.reloadTopic = this.reloadTopic.bind(this);
        this.onChange = this.onChange.bind(this);
    }


    async onReady() {
        this.reloadTopic();
    }

    async reloadTopic() {
        // do nothing on reload
    }

    async onChange(event: any) {
        this.state.changed(event.target.value);
    }

    
    shouldComponentUpdate() {
        return true;
    }

    render() {
        const { call, callparticipant } = this.state;
        console.error('Rendering Participant', call, callparticipant);
        return (
            <div>
                <div style={{float: 'right', width: '25%'}}>
                    <IonButton size="small" color="secondary" style={{float: 'left'}}>Agree</IonButton>
                    <IonButton size="small" color="danger" style={{float: 'left'}}>Disagree </IonButton>
                </div>
                <div style={{ fontSize: '1.25em', padding: '0.25em'}}>                
                    <label>
                        {(callparticipant?.ParticipantAvatar && callparticipant?.ParticipantAvatar.length) ? 
                        <img style={{width: '2em'}} src={callparticipant?.ParticipantAvatar[0].url} /> :
                        <div style={{width: '2em', float: 'left', backgroundColor: 'red'}}></div>}{callparticipant?.DisplayName}</label>
                </div>
            </div>
        );
    }
}