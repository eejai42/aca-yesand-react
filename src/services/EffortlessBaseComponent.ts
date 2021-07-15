import React from 'react';
import { GlobalDataService } from '../GlobalDataService';


export class EffortlessBaseComponent extends React.Component<any, any> {

    constructor(props: any) {
        super(props)
    }
    static contextType = GlobalDataService;
    context!: React.ContextType<typeof GlobalDataService>;

    componentDidMount() {
        var self = this;
        self.context.readiness$.subscribe((ready:any) => {
            if (ready) {
                self.onReady();
                this.setState({isReady:true});
            }
        });
    }

    async onReady() {

    }

    hasNoErrors(payload : any) {
        var hasError = payload && payload.ErrorMessage;
        if (hasError) console.error('ERROR: ', hasError);
        return !hasError; 
    }
}