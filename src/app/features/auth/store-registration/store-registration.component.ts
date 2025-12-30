import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';


@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './store-registration.component.html',
  styleUrls: ['./store-registration.component.scss']
})
export class StoreRegistrationComponent {
  // email = '';
  // password = '';
  // role: UserRole = 'StoreAdmin';
  // message = '';

  // constructor(private auth: AuthService, private router: Router) {}

  // register(): void {
  //   this.message = '';
  //   if (!this.email || !this.password) {
  //     this.message = 'Email and password are required.';
  //     return;
  //   }
  //   const user: AppUser = { email: this.email, password: this.password, role: this.role };
  //   const res = this.auth.register(user);
  //   if (!res.success) {
  //     this.message = res.message || 'Registration failed';
  //     return;
  //   }
  //   this.message = 'Registered successfully. Redirecting to login...';
  //   // clear form
  //   this.email = '';
  //   this.password = '';
  //   this.role = 'StoreAdmin';
  //   // navigate to login after a short delay so user sees the message
  //   setTimeout(() => this.router.navigate(['/account/login']), 900);
  // }
}
