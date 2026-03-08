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
import { TableModule } from 'primeng/table';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { InputTextarea } from 'primeng/inputtextarea';
import { InputNumberModule } from 'primeng/inputnumber';
import { ConfirmDialogModule } from 'primeng/confirmdialog';



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
    ChartModule,
    TableModule,
    TagModule,
    DialogModule,
    InputTextarea,
    InputNumberModule,
    ConfirmDialogModule
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
    ChartModule,
    TableModule,
    TagModule,
    DialogModule,
    InputTextarea,
    InputNumberModule,
    ConfirmDialogModule
  ]
})
export class PrimematerialModule { }