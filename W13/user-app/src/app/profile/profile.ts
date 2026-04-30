import { Component } from '@angular/core';

@Component({
  selector: 'app-profile',
  standalone: true,
  templateUrl: './profile.html'
})
export class ProfileComponent {

  user: any = {};

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem("currentUser") || "{}");
  }

  logout() {
    localStorage.removeItem("currentUser");
    window.location.href = '/login';
  }
}