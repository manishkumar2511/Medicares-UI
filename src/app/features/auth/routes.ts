import { Routes } from "@angular/router";
import { LoginComponent } from "./login";
import { redirectIfAuthenticatedGuard } from "../../core/guards";
import { OwnerRegistrationComponent } from "./owner-registration";
import { StoreRegistrationComponent } from "./store-registration";
import { VerifyTwoFACodeComponent } from "./Verify-Two-FA-Code";

export const authRoutes: Routes = [
  {
    path: "login",
    title: "Login",
    component: LoginComponent,
    canActivate: [redirectIfAuthenticatedGuard],
  },
  {path:"verify-code", title:"Verify Two FA Code", component:VerifyTwoFACodeComponent},
  { path: "store-registration", title: "Store Registration", component: StoreRegistrationComponent },
  { path: "owner-registration", title: "Owner Registration", component: OwnerRegistrationComponent }
];
  