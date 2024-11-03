import { AuthEffects } from "./auth.effects";
import { ClientEffects } from "./client.effects";
import { ClientMeterEffects } from "./clientMeter.effects";
import { ContractEffects } from "./contract.effects";
import { ContractTypeEffects } from "./contractType.effects";
import { CutEffects } from "./cut.effects";
import { EnterpriseEffects } from "./enterprise.effects";
import { FineConfigurationEffects } from "./fineConfiguration.effects";
import { InvoiceEffects } from "./invoice.effects";
import { ReadingEffects } from "./reading.effects";
import { ReceiptEffects } from "./receipt.effects";
import { RubricEffects } from "./rubric.effects";
import { SuspensionEffects } from "./suspension.effects";
import { UserEffects } from "./user.effects";
import { ZoneEffects } from "./zone.effects";

export const effects = [
    AuthEffects,
    ClientEffects,
    ClientMeterEffects,
    ContractTypeEffects,
    ContractEffects,
    CutEffects,
    EnterpriseEffects,
    FineConfigurationEffects,
    InvoiceEffects,
    ReadingEffects,
    ReceiptEffects,
    SuspensionEffects,
    UserEffects,
    ZoneEffects,
    RubricEffects
];
