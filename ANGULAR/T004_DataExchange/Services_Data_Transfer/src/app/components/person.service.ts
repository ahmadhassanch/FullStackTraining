import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Person } from './person';

@Injectable({
  providedIn: 'root'
})
export class PersonService {

  private subject = new Subject<Person>();

  sendData(data: Person): void{
    this.subject.next(data);
  }

  onData(): Observable<Person> {
    return this.subject.asObservable();
  }

  constructor() { }
}
