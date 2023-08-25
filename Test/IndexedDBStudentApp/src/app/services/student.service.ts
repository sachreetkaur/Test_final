import { Injectable } from '@angular/core';
import { Student } from '../models/student.model';

@Injectable({
  providedIn: 'root',
})
export class StudentService {
  private dbName = 'StudentDB';
  private storeName = 'students';
  private db!: IDBDatabase; // Initialize with "!"

  constructor() {
    this.openDB();
  }

  public openDB(): Promise<void>  {
    return new Promise<void>((resolve, reject) => {
    const request = indexedDB.open(this.dbName, 1);

    request.onupgradeneeded = (event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
      this.db.createObjectStore(this.storeName, { keyPath: 'id', autoIncrement: true });
      
    };

    request.onsuccess = (event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
      if (this.db) {
        resolve(); // Resolve the promise if the database is successfully opened
      } else {
        reject(new Error('Failed to open database')); // Reject the promise if there's an error
      }
    };
   });
  }
  private createTransaction(storeName: string, mode: IDBTransactionMode): IDBTransaction | null {
    console.log(this.db);
    if (!this.db) {
      return null;
    }

    try {
      const transaction = this.db.transaction(storeName, mode);
      transaction.onerror = (event) => {
        console.error('Transaction Error:', event);
      };
      return transaction;
    } catch (error) {
      console.error('Failed to create transaction:', error);
      return null;
    }
  }
  
  getAllStudents(): Promise<Student[]> {
    return new Promise((resolve, reject) => {
        console.log(this.storeName);
      const transaction = this.createTransaction(this.storeName, 'readonly');
      console.log(transaction);
      
      if (!transaction) {
        reject(new Error('Failed to create transaction'));
        return;
      }
  
      const store = transaction.objectStore(this.storeName);
      const request = store.getAll();
  
      request.onsuccess = () => {
        resolve(request.result);
      };
  
      request.onerror = () => {
        reject(new Error('Failed to retrieve students'));
      };
    });
  }
  

  addStudent(student: Student): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.add(student);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  getNextStudentId(): Promise<number> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeName, 'readonly');
      const store = transaction.objectStore(this.storeName);
      const request = store.getAllKeys();
  
      request.onsuccess = () => {
        const keys: number[] = request.result.map((key: IDBValidKey) => parseInt(key as string));
        const nextId = keys.length > 0 ? Math.max(...keys) + 1 : 1;
        resolve(nextId);
      };
  
      request.onerror = () => {
        reject(request.error);
      };
    });
  }
  
  updateStudent(student: Student): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.put(student);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  deleteStudent(studentId: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(this.storeName, 'readwrite');
      const store = transaction.objectStore(this.storeName);
      const request = store.delete(studentId);

      request.onsuccess = () => {
        resolve();
      };

      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  // Implement other CRUD operations (addStudent, updateStudent, deleteStudent) similarly.
}
