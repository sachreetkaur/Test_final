import { Component, OnInit } from '@angular/core';
import { StudentService } from '../services/student.service';
import { Student } from '../models/student.model';
import { FormControl, NgForm } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog'; // Import MatDialog
import { EditStudentFormComponent } from '../edit-student-form/edit-student-form.component'; 
import { DeleteConfirmationDialogComponent } from '../delete-confirmation-dialog/delete-confirmation-dialog.component';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
@Component({
  selector: 'app-student',
  templateUrl: './student.component.html',
  styleUrls: ['./student.component.css']
})
export class StudentComponent implements OnInit   {
  genderControl!: FormControl;
  ageControl!: FormControl;
  studentForm: FormGroup | undefined;
  students: Student[] = [];
  newStudent: Student = { id: 0, name: '', age: 0, isEnrolled: false, gender: 'male' };
  db: any;
  editingStudent: Student | null = null;
  showAddForm: boolean = false; 
  
  constructor(private studentService: StudentService, private dialog: MatDialog,private fb: FormBuilder) {}
  toggleAddForm() {
    this.genderControl = new FormControl('', Validators.required);
    this.ageControl = new FormControl(0, [Validators.required, Validators.min(0)]);
    this.showAddForm = !this.showAddForm;
    this.newStudent = { id: 0, name: '', age: 0, isEnrolled: false, gender: 'male' }; // Reset form data
  }

  editStudent(student: Student) {
    const dialogRef = this.dialog.open(EditStudentFormComponent, {
      width: '400px',
      data: { student: { ...student } }
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Handle successful dialog close
        this.studentService.updateStudent(result).then(() => {
          this.loadStudents(); // Refresh the student list after edit
        });
      }
    });
  }
   async ngOnInit() {
    this.studentForm = this.fb.group({
      id: [0],
      name: ['', Validators.required],
      age: [0, [Validators.required, Validators.min(0)]],
      isEnrolled: [false],
      gender: ['', Validators.required]
    });
    
    try {
      await this.studentService.openDB();
      this.loadStudents();
    } catch (error) {
      console.error('Error initializing database:', error);
    }
    
  }
  loadStudents() {
    this.studentService.getAllStudents().then((students) => {
      this.students = students;
    });
  }

  validateStudent(): boolean {
    // Create a temporary form group for validation
    const tempStudentForm = this.fb.group({
      id: [0],
      name: ['', Validators.required],
      age: [0, [Validators.required, Validators.min(0)]],
      isEnrolled: [false],
      gender: ['', Validators.required]
    });
  
    // Check if the form is valid
    if (tempStudentForm.valid) {
      // Your additional validation logic
      if (!this.newStudent.name || !this.newStudent.age) {
        console.log('Validation failed. Name and age are required.');
        return false;
      }
  
      // Additional validation logic if needed
      if (this.newStudent.age < 0) {
        tempStudentForm.get('age')?.setErrors({ 'min': true });
        console.log('Validation failed. Age must be a non-negative value.');
        return false;
      }
  
      // If all checks pass, return true
      return true;
    } else {
      console.log('Validation failed. Form is invalid.');
      
      // Loop through the controls to identify invalid ones
      for (const controlName in tempStudentForm.controls) {
        if (tempStudentForm.controls.hasOwnProperty(controlName)) {
          const control = tempStudentForm.get(controlName) as FormControl;
          if (control.invalid) {
            console.log(`Control '${controlName}' is invalid.`);
            tempStudentForm.get('age')?.setErrors({ 'min': true });
            // You can provide specific error messages here based on controlName
          }
        }
      }
      
      
      
      return false;
    }
  }
  
  
  addStudent() {
    if (this.validateStudent()) {
      this.studentService.getNextStudentId().then((nextId) => {
        const newStudentWithId = { ...this.newStudent, id: nextId };
  
        this.studentService.addStudent(newStudentWithId).then(() => {
          this.loadStudents();
          this.newStudent = { id: 0, name: '', age: 0, isEnrolled: false, gender: 'male' };
          this.showAddForm = false;
        });
      });
    }
  }

  cancelEdit() {
    this.editingStudent = null;
  }

  saveEditedStudent() {
    if (this.editingStudent) {
      this.studentService.updateStudent(this.editingStudent).then(() => {
        this.loadStudents();
        this.editingStudent = null;
      });
    }
  }

  openDeleteConfirmation(studentId: number): void {
    const dialogRef = this.dialog.open(DeleteConfirmationDialogComponent, {
      width: '300px',
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result === 'confirm') {
        this.deleteStudent(studentId);
      }
    });
  }

  deleteStudent(studentId: number) {
    this.studentService.deleteStudent(studentId).then(() => {
      this.loadStudents();
    });
  }
}
  // Implement other methods for CRUD operations, form handling, and validation.
