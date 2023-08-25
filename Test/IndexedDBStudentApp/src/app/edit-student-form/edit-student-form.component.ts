import { Component, Inject } from '@angular/core';
import { Student } from '../models/student.model';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { StudentService } from '../services/student.service';


@Component({
  selector: 'app-edit-student-form',
  templateUrl: './edit-student-form.component.html',
  styleUrls: ['./edit-student-form.component.css']
})


export class EditStudentFormComponent {
  student: Student;
  constructor(private studentService: StudentService,
    @Inject(MAT_DIALOG_DATA) public data: { student: Student },
    private dialogRef: MatDialogRef<EditStudentFormComponent>
  ) {
    this.student = data.student;
  }
  onCancel() {
    // Reset any changes made to the student object and close the form
    this.dialogRef.close(); 
  }

  onSave() {
    this.studentService.updateStudent(this.student).then(() => {
      this.dialogRef.close(this.student); // Close the dialog and pass back the updated student
    });
  }
}

