import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useParams } from 'react-router';
import ExploreContainer from '../../components/ExploreContainer';
import './Page2.css';
import { GDS } from '../../services/gds.service'
import React from 'react';
import { thumbsUpSharp } from 'ionicons/icons';
import { GlobalDataService } from '../../GlobalDataService'

export class Page2 extends React.Component<{}, {name:string, people : any[]}> {

  constructor(props : any) {
    super(props)

    this.state = {
      name : "unnamed",
      people : []
    };
  }

  static contextType = GlobalDataService;
  context!: React.ContextType<typeof GlobalDataService>;

  componentDidMount() {
    console.error('COMPONENT MOUNTED...');
    var self = this;
    self.context.readiness$.subscribe((ready:any) => {
        if (ready) self.loadData(ready);
    });
}
  async loadData(ready: any) {
    var reply = await this.context.moderator.GetPeople(this.context.createPayload());
    if (this.context.hasNoErrors(reply)) {
      this.setState({people: reply.People});
    }
  }


  render() {
    const { name, people } = this.state;
    
    return (
      <IonPage>
        <IonHeader>
          <IonToolbar>
            <IonButtons slot="start">
              <IonMenuButton />
            </IonButtons>
            <IonTitle>PAGE 2 {name} changed</IonTitle>
          </IonToolbar>
        </IonHeader>
  
        <IonContent fullscreen>
          <IonHeader collapse="condense">
            <IonToolbar>
              <IonTitle size="large">{name + '123'}</IonTitle>
            </IonToolbar>
          </IonHeader>
          <ExploreContainer name={name} size={123} />
          <div>
            PEOPLE: {people?.length}
          </div>

        </IonContent>
      </IonPage>
    );
  }


};

export default Page2;
