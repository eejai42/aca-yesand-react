
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

export default class EpisodesComponent extends EffortlessBaseComponent {

    constructor(props : any) {
      super(props)
  
      this.state = {
        people : []
      };
    }
  
    async onReady() {
      this.loadData();
    }
  
    async loadData() {
      var payload = this.context.createPayload();
      payload.AirtableWhere = "Roles='Episode'"
      var reply = await this.context.moderator.GetPeople(payload);
      if (this.context.hasNoErrors(reply)) {
        this.setState({people: reply.People});
      }
    }
  
  
    render() {
      const {  people } = this.state;
      
      return (
        <IonPage>
          <IonHeader>
            <IonToolbar>
              <IonButtons slot="start">
                <IonMenuButton />
              </IonButtons>
              <IonTitle>Episodes</IonTitle>
            </IonToolbar>
          </IonHeader>
    
          <IonContent fullscreen>
            <IonHeader collapse="condense">
              <IonToolbar>
                <IonTitle size="large">Episodes</IonTitle>
              </IonToolbar>
            </IonHeader>
            <div>
              PEOPLE: {people?.length}
            </div>
            {people?.map((person:any) => 
              <div key={person.PersonId}>{person.Name}</div>
            )};
          </IonContent>
        </IonPage>
      );
    }  
}