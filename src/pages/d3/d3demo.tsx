import { IonButton, IonButtons, IonContent, IonHeader, IonMenuButton, IonPage, IonTitle, IonToolbar } from '@ionic/react';
import React from 'react';
// import rd3 from 'react-d3-library'
import * as d3 from 'd3'
// import rd3 from 'react-d3-library'
// import * as d3Scale from 'd3-scale';
// import * as d3Array from 'd3-array';
// import * as d3Axis from 'd3-axis';

class D3demo extends React.Component<{}, { data: number[] }> {

    constructor(props: any) {
        super(props);
        this.state = {
            data: [4, 8, 15, 16, 23, 42]
        }
    }

    componentDidMount() {

    }

    bar() {
        const divNode = document.createElement('div')
        const divElement = d3.select(divNode)
            .style("font", "10px sans-serif")
            .style("text-align", "right")
            .style("color", "white");

        divElement.selectAll("div")
            .data(this.state.data).join("div")
            .style("background", "steelblue")
            .style("padding", "3px")
            .style("margin", "1px")
            .style("width", d => `${d * 10}px`)
            .text(d => d);
        console.log("D3 Node:: ", divElement.node())
        return <div> {divElement.node()} </div>;
    }
    render() {
        return (
            <IonPage>
                <IonHeader>
                    <IonToolbar>
                        <IonButtons slot="start">
                            <IonMenuButton />
                        </IonButtons>
                        <IonTitle>d3</IonTitle>
                    </IonToolbar>
                </IonHeader>

                <IonContent fullscreen>
                    <h1>hello world </h1>
                    <span dangerouslySetInnerHTML={{__html: 
                        `<div style="font: 10px sans-serif; text-align: right; color: white;">
                            
                            <div style="background: steelblue; padding: 3px; margin: 1px; width: 40px;">4</div>
                            <div onclick="alert('Test')" style="background: steelblue; padding: 3px; margin: 1px; width: 80px;">8</div>
                            <div style="background: steelblue; padding: 3px; margin: 1px; width: 150px;">15</div>
                            <div style="background: steelblue; padding: 3px; margin: 1px; width: 160px;">16</div>
                            <div style="background: steelblue; padding: 3px; margin: 1px; width: 230px;">23</div>
                            <div style="background: steelblue; padding: 3px; margin: 1px; width: 420px;">42</div></div>`
                    }
                    } />
<IonButton onClick={ this.test}>Btn</IonButton>
                    {/* {this.bar()} */}
                </IonContent>
            </IonPage>
        );
    }
    test(): React.MouseEventHandler<HTMLIonButtonElement> | undefined {
        alert("Controller handler");
        return undefined
    }
};

export default D3demo;