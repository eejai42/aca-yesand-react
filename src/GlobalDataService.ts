import React from "react";
import { GDS } from "./services/gds.service";

export const GlobalDataService = React.createContext<GDS>(new GDS());
