import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {AnnotationComponent} from './annotation/annotation.component';
import {HomePageComponent} from './home-page/home-page.component';
import {DbManagementComponent} from './db-management/db-management.component';
import {DbCreationComponent} from './db-creation/db-creation.component';
import {StatusResolverService} from './services/data-resolver.service';
import {LoginComponent} from './login/login.component';
import {AuthGuard} from './auth-guard.service';

const routes: Routes = [
  { path: 'login', component: LoginComponent },
  { path: 'home',
    component: HomePageComponent,
    resolve: {
      statusData: StatusResolverService
    },
    canActivate: [AuthGuard]
  },
  { path: 'annotation', component: AnnotationComponent, canActivate: [AuthGuard] },
  { path: 'dbManagement',
    component: DbManagementComponent,
    resolve: { // describes what to do before loading the component
      statusData: StatusResolverService // name of the returned variable: name of the class which provides the service
    }
  },
  { path: 'dbCreation', component: DbCreationComponent },
  { path: '',    redirectTo: '/home', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
