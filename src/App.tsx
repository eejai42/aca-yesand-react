import { IonApp, IonRouterOutlet, IonSplitPane } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Redirect, Route, RouteComponentProps, withRouter } from 'react-router-dom';

import { EffortlessBaseComponent } from './services/EffortlessBaseComponent'

import Menu from './components/Menu';
import Shows from './pages/shows/Shows';
import Show from './pages/shows/Show';
import Hosts from './pages/hosts/Hosts';
import Host from './pages/hosts/Host';
import Seasons from './pages/seasons/Seasons';
import Season from './pages/seasons/Season';
import Episodes from './pages/episodes/Episodes';
import Episode from './pages/episodes/Episode';
import AddEpisodeCall from './pages/episodes/AddCall';
import Calls from './pages/calls/Calls';
import Call from './pages/calls/Call';
import Profile from './pages/profile/Profile';

import D3demo from './pages/d3/d3demo'
// import GlobalState from './GlobaleState';


/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';


class App extends EffortlessBaseComponent {
  constructor(props: any) {
    super(props);
    // SOMETHING LIKE THIS: this.state.reloadMatch();
    this.state = {
       fallacies: undefined
    };

    // this.loadFallacies = this.loadFallacies.bind(this);
}


componentDidUpdate(){
  // if(!localStorage.getItem("fallacies") && this.state.isReady){
  //   this.loadFallacies();
  // } else{
  //   console.error("Fallacies Already Exist in LocalStorage")
  // }
}
//   async loadFallacies() {
//     let payload = this.context.createPayload()
//     // payload.AirtableWhere = "Name='" + this.props.match.params.callCode + "'";
//     // if (!this.context.moderator) return;
//     console.error('LOADING FALLACIES NOW');
//     let reply = await this.context.moderator.GetFallacies(payload);
//     if (this.hasNoErrors(reply) && reply.Fallacies && reply.Fallacies.length) {
//         // console.error("Fallacies:: ", reply.Fallacies);
//         localStorage.setItem("fallacies",  JSON.stringify( reply.Fallacies) )
//     } else {
//         console.error('GOT ERROR LOADING FALLACIES NOW!', reply);
//     }
// }

  render(){
    return (
      <IonApp>
  
        <IonReactRouter>
          <IonSplitPane contentId="main">
            <Menu />
            <IonRouterOutlet id="main">
              <Route path="/" exact={true}>
                <Redirect to="/shows" />
              </Route>
              <Route path="/shows" exact={true} component={Shows}  />
              <Route path="/show/:showCode" exact={true} component={Show} />
              <Route path="/hosts" exact={true} component={Hosts} />
              <Route path="/host/:hostCode" exact={true} component={Host} />
              <Route path="/seasons" exact={true} component={Seasons} />
              <Route path="/season/:seasonCode"   exact={true} component={Season} />
              <Route path="/episodes" exact={true}  component={Episodes} />
              <Route path="/episode/:episodeCode"  exact={true}  render={(props) => <Episode {...props} episodeCode={props.match.params.episodeCode} />} />
              <Route path="/episode/:episodeCode/addcall" exact={true} component={AddEpisodeCall} />
              <Route path="/calls" exact={true} component={Calls} />
              <Route path="/call/:callCode" exact={true} component={Call} />
              <Route path="/moderators" exact={true} component={Hosts} />
              <Route path="/account" exact={true} component={Profile} />
  
            
              {/*Note:  Route bellow is for testing ... */}
              <Route path="/d3" exact={true}>
                <D3demo />
              </Route>
            </IonRouterOutlet>
          </IonSplitPane>
        </IonReactRouter>
      </IonApp>
    );
  }
};

export default App;
