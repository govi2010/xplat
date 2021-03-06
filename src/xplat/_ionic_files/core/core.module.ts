import { NgModule, Optional, SkipSelf } from '@angular/core';

import { IonicModule } from '@ionic/angular';
import { throwIfAlreadyLoaded } from '@<%= npmScope %>/utils';
import { <%= utils.classify(prefix) %>CoreModule } from '@<%= npmScope %>/web';

@NgModule({
  imports: [
    <%= utils.classify(prefix) %>CoreModule,
    IonicModule.forRoot()
  ]
})
export class <%= utils.classify(prefix) %>IonicCoreModule {
  constructor(
    @Optional()
    @SkipSelf()
    parentModule: <%= utils.classify(prefix) %>IonicCoreModule
  ) {
    throwIfAlreadyLoaded(parentModule, '<%= utils.classify(prefix) %>IonicCoreModule');
  }
}
