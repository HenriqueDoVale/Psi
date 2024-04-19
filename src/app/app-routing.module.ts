import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { WebsitesComponent } from './websites/websites.component';
import  {WebsiteDetailComponent} from "./website-detail/website-detail.component";
//import { DashboardComponent } from './dashboard/dashboard.component';
//import { HeroDetailComponent } from './hero-detail/hero-detail.component';
//import { PetsComponent } from './pets/pets.component';

const routes: Routes = [
  { path: 'websites', component: WebsitesComponent },
  //{ path: 'dashboard', component: DashboardComponent },
  //{path: 'pets', component: PetsComponent},
  { path: '', redirectTo: '/websites', pathMatch: 'full' },
  { path: 'detail/:id', component: WebsiteDetailComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
