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
  { path: 'annotation', component: AnnotationComponent, canActivate: [AuthGuard] },
  { path: 'home', component: HomePageComponent, canActivate: [AuthGuard] },
  { path: 'annotation', component: AnnotationComponent },
  { path: 'home',
    component: HomePageComponent,
    resolve: {
      statusData: StatusResolverService
    }
  },
  { path: 'dbManagement',
    component: DbManagementComponent,
    resolve: { // describes what to do before loading the component
      statusData: StatusResolverService // name of the returned variable: name of the class which provides the service
    },
    canActivate: [AuthGuard]
    resolve: {
      statusData: StatusResolverService
    }
  },
  { path: 'dbCreation', component: DbCreationComponent, canActivate: [AuthGuard] },
  { path: '',    redirectTo: '/home', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
