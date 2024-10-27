import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { NgModule, isDevMode } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SharedModule } from './shared/shared.module';
import { AuthModule } from './pages/auth/auth.module';
import { ManagerLayoutComponent } from './layouts/manager-layout/manager-layout.component';
import { ManagersModule } from './pages/managers/managers.module';
import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { effects, reducers } from './store';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { httpInterceptorProviders } from './core/interceptors';
import { JwtInterceptor, JwtModule } from '@auth0/angular-jwt';
import { tokenGetter } from './core/utils';

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
    StoreModule.forRoot(reducers),
    EffectsModule.forRoot(effects),
    StoreDevtoolsModule.instrument({ maxAge: 25, logOnly: !isDevMode() })
  ],
  providers: [
    httpInterceptorProviders
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }