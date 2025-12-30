import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { DropdownModule } from 'primeng/dropdown';
import { InputOtpModule } from 'primeng/inputotp';
import { SidebarModule } from 'primeng/sidebar';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { MenuModule } from 'primeng/menu';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ToastModule } from 'primeng/toast';
import { ToolbarModule } from 'primeng/toolbar';
import { BadgeModule } from 'primeng/badge';
import { ChartModule } from 'primeng/chart';



@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,

    ButtonModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    DropdownModule,
    InputOtpModule,
    SidebarModule,
    BreadcrumbModule,
    MenuModule,
    TooltipModule,
    AvatarModule,
    OverlayPanelModule,
    ToastModule,
    ToolbarModule,
    BadgeModule,
    ChartModule
  ],
  exports: [
    FormsModule,
    ReactiveFormsModule,
    ButtonModule,
    CardModule,
    InputTextModule,
    PasswordModule,
    DropdownModule,
    InputOtpModule,
    SidebarModule,
    BreadcrumbModule,
    MenuModule,
    TooltipModule,
    AvatarModule,
    OverlayPanelModule,
    ToastModule,
    ToolbarModule,
    BadgeModule,
    ChartModule
  ]
})
export class PrimematerialModule { }