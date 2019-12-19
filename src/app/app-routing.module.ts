import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AnnotationComponent} from './annotation/annotation.component';
import {HomePageComponent} from './home-page/home-page.component';
import {DbManagementComponent} from './db-management/db-management.component';
import {DbCreationComponent} from './db-creation/db-creation.component';


const routes: Routes = [
  { path: 'annotation', component: AnnotationComponent },
  { path: 'home', component: HomePageComponent },
  { path: 'dbManagement', component: DbManagementComponent },
  { path: 'dbCreation', component: DbCreationComponent },
  { path: '',    redirectTo: '/home', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
