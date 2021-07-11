
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

export default class ParticipantComponent extends EffortlessBaseComponent<{ call: any, participant: any, changed : any }, 
                                                                            { call: any, participant: any, changed : any}> {

    constructor(props: any) {
        super(props);

        this.state = {
            call: props.call,
            participant: props.participant,
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
        const { call, participant } = this.state;
        console.error('Rendering Participant', call, participant);
        return (
            <div>
                {call?.CurrentParticipant != participant?.CallParticipantId ?
                <div style={{ fontSize: '1.25em', padding: '0.25em'}}>                
                            <input type="radio" name="currentParticipant" id={participant.CallParticipantId} value={participant.CallParticipantId} 
                                checked={call.CurrentParticipant == participant.CallParticipantId} onChange={this.onChange} />
                            <label htmlFor={participant.CallParticipantId}>{participant?.DisplayName}</label>
                </div> : 
                <div style={{ fontSize: '1.5em', padding: '0.25em', fontWeight: 'bold'}}>
                    <input type="radio" name="currentParticipant" id={participant.CallParticipantId} value={participant.CallParticipantId} 
                                checked={call.CurrentParticipant == participant.CallParticipantId} onChange={this.onChange} />
                            <label htmlFor={participant.CallParticipantId}>{participant?.DisplayName}</label>
                </div>}
            </div>
        );
    }
}