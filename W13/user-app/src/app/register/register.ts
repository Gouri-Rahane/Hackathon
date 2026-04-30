import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule],   // ✅ IMPORTANT
  templateUrl: './register.html'
})
export class RegisterComponent {

  user = {
  name: '',
  email: '',
  password: '',
  mobile: '',
  dob: '',
  city: '',
  address: ''
};

  constructor(private router: Router) {}

  register() {
  let users = JSON.parse(localStorage.getItem("users") || "[]");

  // ❌ Duplicate check
  let exists = users.find((u: any) => u.email === this.user.email);

  if (exists) {
    alert("User already exists!");
    return;
  }

  // ✅ Save user
  users.push({...this.user});
  localStorage.setItem("users", JSON.stringify(users));

  alert("Registered Successfully");
  this.router.navigate(['/login']);
}
}