import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule],   // ✅ IMPORTANT
  templateUrl: './login.html'
})
export class LoginComponent {

  constructor(private router: Router) {}

  login(email: string, password: string) {
    let users = JSON.parse(localStorage.getItem("users") || "[]");

    let found = users.find((u: any) => u.email === email && u.password === password);

    if (found) {
      localStorage.setItem("currentUser", JSON.stringify(found));
      alert("Login Successful");
      this.router.navigate(['/profile']);
    } else {
      alert("Invalid Credentials");
    }
  }
}