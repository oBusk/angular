/**
 * @license
 * Copyright Google LLC All Rights Reserved.
 *
 * Use of this source code is governed by an MIT-style license that can be
 * found in the LICENSE file at https://angular.io/license
 */

import {DOCUMENT} from '@angular/common';
import {APP_ID, NgModule, Provider} from '@angular/core';
import {TransferState, ɵescapeHtml as escapeHtml} from '@angular/platform-browser';

import {BEFORE_APP_SERIALIZED} from './tokens';

export const TRANSFER_STATE_SERIALIZATION_PROVIDERS: Provider[] = [{
  provide: BEFORE_APP_SERIALIZED,
  useFactory: serializeTransferStateFactory,
  deps: [DOCUMENT, APP_ID, TransferState],
  multi: true,
}];

export function serializeTransferStateFactory(
    doc: Document, appId: string, transferStore: TransferState) {
  return () => {
    const store = (transferStore as unknown as {store: {}}).store;
    const isStateEmpty = Object.keys(store).length === 0;
    if (isStateEmpty) {
      // The state is empty, nothing to transfer,
      // avoid creating an extra `<script>` tag in this case.
      return;
    }
    const script = doc.createElement('script');
    script.id = appId + '-state';
    script.setAttribute('type', 'application/json');
    script.textContent = escapeHtml(transferStore.toJson());
    doc.body.appendChild(script);
  };
}

/**
 * NgModule to install on the server side while using the `TransferState` to transfer state from
 * server to client.
 *
 * Note: this module is not needed if the `renderApplication` function is used.
 * The `renderApplication` makes all providers from this module available in the application.
 *
 * @publicApi
 */
@NgModule({
  providers: TRANSFER_STATE_SERIALIZATION_PROVIDERS,
})
export class ServerTransferStateModule {
}
