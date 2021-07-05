import { IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import { useParams } from 'react-router';
import ExploreContainer from '../../components/ExploreContainer';
import './Page2.css';

const Page2: React.FC = () => {

  const { name } = useParams<{ name: string; }>();

  console.error('STARTING PAGE TWO', useParams, name );

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
      </IonContent>
    </IonPage>
  );
};

export default Page2;
