import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';
import { Component } from '@angular/core';
import { Store } from '@ngrx/store';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  url: Observable<string>;

  constructor(store: Store<any>) {
    this.url = store.select(s => s.routerReducer)
      .filter(Boolean)
      .map(router => router.state.url);
  }
}
