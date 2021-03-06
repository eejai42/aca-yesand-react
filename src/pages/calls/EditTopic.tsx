
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

export default class EditTopicComponent extends EffortlessBaseComponent {

    constructor(props: any) {
        super(props);

        this.state = {
            call: props.call,
            topic: props.topic
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
    
    async relatedTopicSubjectChanged(event: any) {
        this.state.topic.relatedTopicSubject = event.target.value;
        this.setState({ topic: this.state.topic });
    }

    onChange(event: any) {
        this.state.topic.Subject = event.target.value;
        this.setState({ topic: this.state.topic });
    }


    render() {
        console.error('rendering');
        const { call, topic } = this.state;
        return (
            <div>
                <div>
                    <label>
                        Subject: 
                    </label>
                    <input value={topic.Subject} onChange={this.onChange} autoFocus />
                </div>

                <div>
                        <div>
                            <label htmlFor="newSubTopic">Related topic</label>
                            <input type="text" name="newSubTopic" value={topic.relatedTopicSubject} 
                            onChange={(event) => this.relatedTopicSubjectChanged(event)} autoFocus />
                        </div>
                    </div>

            </div>
        );
    }
}