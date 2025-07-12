import { HttpClientModule } from "@angular/common/http";
import { NgModule, isDevMode } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { JwtModule } from "@auth0/angular-jwt";
import { EffectsModule } from "@ngrx/effects";
import { MetaReducer, StoreModule } from "@ngrx/store";
import { StoreDevtoolsModule } from "@ngrx/store-devtools";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { httpInterceptorProviders } from "./core/interceptors";
import { tokenGetter } from "./core/utils";
import { AuthLayoutComponent } from "./layouts/auth-layout/auth-layout.component";
import { ManagerLayoutComponent } from "./layouts/manager-layout/manager-layout.component";
import { AuthModule } from "./pages/auth/auth.module";
import { ManagersModule } from "./pages/managers/managers.module";
import { SharedModule } from "./shared/shared.module";
import { reducers, effects } from "./store"; 
import { localStorageSync } from "ngrx-store-localstorage";

export function localStorageSyncReducer(reducer: any): any {
  return localStorageSync({ keys: ['auth'], rehydrate: true })(reducer);
}

  const metaReducers: MetaReducer<any>[] = [localStorageSyncReducer];
  
@NgModule({
  declarations: [
    AppComponent,
    AuthLayoutComponent,
    ManagerLayoutComponent 
  ],
  imports: [
    BrowserModule,
    SharedModule,
    AuthModule,
    HttpClientModule,
    ManagersModule,
    AppRoutingModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: tokenGetter,
        authScheme: 'Bearer ',
        allowedDomains: ['mambo-water.onrender.com'],
        disallowedRoutes: ['mambo-water.onrender.com/api/v1/auth/login']
      }
    }),
    StoreModule.forRoot(reducers, { metaReducers }),
    EffectsModule.forRoot(effects),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !isDevMode() })
  ],
  providers: [
    httpInterceptorProviders
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }