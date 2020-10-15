import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import {Person} from '../person';

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {


  person: Person = new Person();
  // MySender is any Variable Name
  @Output() MySender: EventEmitter<Person> = new EventEmitter<Person>();

  constructor() { }

  ngOnInit(): void {
  }

  sendData(): void {

    const person = new Person();
    person.username = this.person.username;
    person.password = this.person.password;

    // console.log(person.username, person.password);
    this.MySender.emit(person);
  }

}
