import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './app.html',
  styleUrls: ['./app.css']
})
export class AppComponent {

  task = "";
  tasks: string[] = [];
  editIndex: number | null = null;

  addTask() {
    if (this.task.trim() === "") return;

    if (this.editIndex !== null) {
      this.tasks[this.editIndex] = this.task;
      this.editIndex = null;
    } else {
      this.tasks.push(this.task);
    }

    this.task = "";
  }

  editTask(index: number) {
    this.task = this.tasks[index];
    this.editIndex = index;
  }

  deleteTask(index: number) {
    this.tasks.splice(index, 1);
  }
}