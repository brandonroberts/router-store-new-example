import { Injectable, ModuleWithProviders, NgModule, Optional } from "@angular/core";
import {
  ActivatedRouteSnapshot, CanActivateChild, ExtraOptions, RouterModule, RouterStateSnapshot,
  Routes, Router, NavigationCancel, RoutesRecognized, NavigationError
} from "@angular/router";
import { Store, StoreModule, provideStore } from "@ngrx/store";
import { of } from 'rxjs/observable/of';

/**
 * An action dispatched when the router navigates.
 */
export const ROUTER_NAVIGATION = 'ROUTER_NAVIGATION';

/**
 * Payload of ROUTER_NAVIGATION.
 */
export type RouterNavigationPayload = {
  routerState: RouterStateSnapshot,
  event: RoutesRecognized
}

/**
 * An action dispatched when the router cancels navigation.
 */
export const ROUTER_CANCEL = 'ROUTER_CANCEL';

/**
 * Payload of ROUTER_CANCEL.
 */
export type RouterCancelPayload<T> = {
  routerState: RouterStateSnapshot,
  storeState: T,
  event: NavigationCancel
};

/**
 * An action dispatched when the router errors.
 */
export const ROUTER_ERROR = 'ROUTE_ERROR';

/**
 * Payload of ROUTER_ERROR.
 */
export type RouterErrorPayload<T> = {
  routerState: RouterStateSnapshot,
  storeState: T,
  event: NavigationError
};

export type RouterReducerState = { state: RouterStateSnapshot, navigationId: number };

export function routerReducer(state: RouterReducerState, action: any): RouterReducerState {
  if (action.type === "ROUTER_NAVIGATION" || action.type === "ROUTER_ERROR" || action.type === "ROUTER_CANCEL") {
    return ({ state: action.payload.routerState, navigationId: action.payload.event.id });
  } else {
    return state;
  }
}

/**
 * Connects RouterModule with StoreModule.
 *
 * During the navigation, before any guards or resolvers run, the router will dispatch
 * a ROUTER_NAVIGATION action, which has the following signature:
 *
 * ```
 * export type RouterNavigationPayload = {
 *   routerState: RouterStateSnapshot,
 *   event: RoutesRecognized
 * }
 * ```
 *
 * Either a reducer or an effect can be invoked in response to this action.
 * If the invoked reducer throws, the navigation will be canceled.
 *
 * If navigation gets canceled because of a guard, a ROUTER_CANCEL action will be
 * dispatched. If navigation results in an error, a ROUTER_ERROR action will be dispatched.
 *
 * Both ROUTER_CANCEL and ROUTER_ERROR contain the store state before the navigation
 * which can be used to restore the consistency of the store.
 *
 * Usage:
 *
 * ```typescript
 * @NgModule({
 *   declarations: [AppCmp, SimpleCmp],
 *   imports: [
 *     BrowserModule,
 *     StoreModule.provideStore(mapOfReducers),
 *     RouterModule.forRoot([
 *       { path: '', component: SimpleCmp },
 *       { path: 'next', component: SimpleCmp }
 *     ]),
 *     StoreRouterConnectingModule
 *   ],
 *   bootstrap: [AppCmp]
 * })
 * export class AppModule {
 * }
 * ```
 */
@NgModule({})
export class StoreRouterConnectingModule {
  private routerState: RouterStateSnapshot = null;
  private storeState: any;
  private lastRoutesRecognized: RoutesRecognized;
  private lastNavigationId: number = -1;

  constructor(private store: Store<any>, private router: Router) {
    this.setUpBeforePreactivationHook();
    this.setUpStoreStateListener();
    this.setUpStateRollbackEvents();
  }

  private setUpBeforePreactivationHook(): void {
    (<any>this.router).hooks.beforePreactivation = (routerState: RouterStateSnapshot) => {
      this.routerState = routerState;

      // is false only when navigation is triggered by navigateIfNeeded
      if (!this.rollbackIntoPastState(this.storeState)) {
        const payload = { routerState, event: this.lastRoutesRecognized };
        this.store.dispatch({ type: ROUTER_NAVIGATION, payload });
        this.lastNavigationId = this.lastRoutesRecognized.id;
      }

      return of(true);
    };
  }

  private setUpStoreStateListener(): void {
    this.store.subscribe(s => {
      this.storeState = s;
      this.navigateIfNeeded(s);
    });
  }

  private navigateIfNeeded(storeState: any): void {
    if (this.rollbackIntoPastState(storeState)) {
      this.router.navigateByUrl(storeState['routerReducer'].state.url);
    }
  }

  /**
   * Returns true when the navigationId gets smaller. This can only happen if we reset the state
   * manually via devtools.
   *
   * In production, navigationId grows monotonically.
   */
  private rollbackIntoPastState(storeState: any): boolean {
    return (!!storeState['routerReducer']) && storeState['routerReducer'].navigationId < this.lastNavigationId;
  }

  private setUpStateRollbackEvents(): void {
    this.router.events.subscribe(e => {
      if (e instanceof RoutesRecognized) {
        this.lastRoutesRecognized = e;
      } else if (e instanceof NavigationCancel) {
        this.dispatchRouterCancel(e);
      } else if (e instanceof NavigationError) {
        this.dispatchRouterError(e);
      }
    });
  }

  private dispatchRouterCancel(event: NavigationCancel): void {
    const payload = { routerState: this.routerState, storeState: this.storeState, event };
    this.store.dispatch({ type: ROUTER_CANCEL, payload });
  }

  private dispatchRouterError(event: NavigationError): void {
    const payload = { routerState: this.routerState, storeState: this.storeState, event };
    this.store.dispatch({ type: ROUTER_ERROR, payload });
  }
}
