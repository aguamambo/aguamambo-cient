import { ActionReducerMap, MetaReducer } from "@ngrx/store";
import { environment } from "src/environments/environment";
import { authReducer, AuthState } from "./auth.reducers";
import { IReadingState, readingReducer } from "./reading.reducers";
import { IZoneState, zoneReducer } from "./zone.reducers";
import { IUserState, userReducer } from "./user.reducers";
import { ISuspensionState, suspensionReducer } from "./suspension.reducers";
import { IReceiptState, receiptReducer } from "./receipt.reducers";
import { IInvoiceState, invoiceReducer } from "./invoice.reducers";
import { fineConfigurationReducer, IFineConfigurationState } from "./fineConfiguration.reducers";
import { enterpriseReducer, IEnterpriseState } from "./enterprise.reducers";
import { cutReducer, ICutState } from "./cut.reducers";
import { contractTypeReducer, IContractTypeState } from "./contractType.reducers";
import { clientMeterReducer, IClientMeterState } from "./clientMeter.reducers";
import { clientReducer, IClientState } from "./client.reducers";
import { IRubricState, rubricReducer } from "./rubric.reducers";
import { contractReducer, IContractState } from "./contract.reducers";
import { clientRubricReducer, IClientRubricState } from "./clientRubrics.reducers";


export interface IAppState {
    auth?: AuthState, 
    reading?: IReadingState,
    rubric?: IRubricState,
    zone?: IZoneState,
    user?: IUserState,
    suspension?: ISuspensionState,
    receipt?: IReceiptState,
    invoice?: IInvoiceState,
    fineConfiguration?: IFineConfigurationState,
    enterprise?: IEnterpriseState,
    cut?: ICutState,
    contractType?: IContractTypeState,
    contract?: IContractState,
    client?: IClientState,
    clientRubric?: IClientRubricState,
    clientMeter?: IClientMeterState,

}

export const reducers: ActionReducerMap<IAppState> = {
    auth: authReducer,
    reading: readingReducer,
    rubric: rubricReducer,
    zone: zoneReducer,
    user: userReducer,
    suspension: suspensionReducer,
    receipt: receiptReducer,
    invoice: invoiceReducer,
    fineConfiguration: fineConfigurationReducer,
    enterprise: enterpriseReducer,
    cut: cutReducer,
    contractType: contractTypeReducer,
    contract: contractReducer,
    client: clientReducer,
    clientRubric: clientRubricReducer,
    clientMeter: clientMeterReducer,
};
export const metaReducers: MetaReducer<IAppState>[] = !environment.production
    ? []
    : [];
