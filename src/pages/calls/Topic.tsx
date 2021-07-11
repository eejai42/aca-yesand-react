
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
import { useHistory, useParams } from "react-router";
import { GlobalDataService } from "../../GlobalDataService";
import { GDS } from "../../services/gds.service";
import { EffortlessBaseComponent } from '../../services/EffortlessBaseComponent'

export default class TopicComponent extends React.Component<{ call: any, topic: any }, { call: any, topic: any, callCode: string }> {

    constructor(props: any) {
        super(props);

        this.state = {
            call: props.call,
            topic: props.topic,
            callCode: props.callCode,
        };

    }

    render() {
        console.error('rendering');
        const { call, topic } = this.state;
        const childTopics = call?.Topics?.filter((childTopic:any) => childTopic.ParentTopic == topic.CallTopicId);
        return (
            <div>
                <h3> - {topic?.Subject} {(childTopics.length > 0) && <span>({childTopics.length})</span>}</h3>
                {(childTopics.length > 0) && <div>
                    <div style={{ marginLeft: "1.5em" }}>
                        {childTopics.map((childTopic: any) => {
                                        return <div key={childTopic.CallTopicId}>
                                            <TopicComponent call={call} topic={childTopic} />
                                        </div>
                        })}
                    </div>
                </div>}

            </div>
        );
    }
}