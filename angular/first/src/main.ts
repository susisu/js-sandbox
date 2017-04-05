import { Component, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

@Component({
  selector: 'app',
  template: '<div>{{message}}</div>'
})
class AppComponent {
  message = 'Hello!! Kin-iro Mosaic'
}

@NgModule({
  imports     : [BrowserModule],
  declarations: [AppComponent],
  bootstrap   : [AppComponent]
})
class AppModule {
}

window.addEventListener('load', main);

function main() {
  window.removeEventListener('load', main);
  platformBrowserDynamic().bootstrapModule(AppModule);
}
