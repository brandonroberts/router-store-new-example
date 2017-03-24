import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpModule } from '@angular/http';
import { RouterModule } from '@angular/router';
import { StoreModule } from '@ngrx/store';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';

import { AppComponent } from './app.component';
import { HomeComponent } from './home.component';
import { AwayComponent } from './away.component';
import { StoreRouterConnectingModule, routerReducer } from './router-store';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    AwayComponent
  ],
  imports: [
    BrowserModule,
    FormsModule,
    HttpModule,
    RouterModule.forRoot([
      { path: '', component: HomeComponent },
      { path: 'away', component: AwayComponent }
    ]),
    StoreModule.provideStore({ routerReducer: routerReducer }),
    StoreDevtoolsModule.instrumentStore(),
    StoreRouterConnectingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
