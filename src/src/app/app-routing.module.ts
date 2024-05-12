import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WebsitesComponent } from './websites/websites.component';
import  {WebsiteDetailComponent} from "./website-detail/website-detail.component";

const routes: Routes = [
  { path: '', redirectTo: '/websites', pathMatch: 'full' },
  { path: 'websites', component: WebsitesComponent },
  { path: 'detail/:id', component: WebsiteDetailComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
