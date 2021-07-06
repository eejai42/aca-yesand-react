import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useParams } from 'react-router';
import ExploreContainer from '../../components/ExploreContainer';
import './Page2.css';
import { GDS } from '../../services/gds.service'
import React from 'react';
import { person, thumbsUpSharp } from 'ionicons/icons';
import { GlobalDataService } from '../../GlobalDataService'
import { EffortlessBaseComponent } from '../../services/EffortlessBaseComponent';

export class Page2 extends EffortlessBaseComponent<{}, {people : any[]}> {

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
    payload.AirtableWhere = "Roles='Host'"
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
            <IonTitle>Hosts</IonTitle>
          </IonToolbar>
        </IonHeader>
  
        <IonContent fullscreen>
          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">Hosts</IonTitle>
            </IonToolbar>
          </IonHeader>
          <div>
            PEOPLE: {people?.length}
          </div>
          {people?.map(person => 
            <div key={person.PersonId}>{person.Name}</div>
          )};
        </IonContent>
      </IonPage>
    );
  }


};

export default Page2;
