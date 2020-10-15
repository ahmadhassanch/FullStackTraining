import { Component, OnInit } from '@angular/core';
import {Person} from '../person';

import {PersonService} from '../person.service'

@Component({
  selector: 'app-user-form',
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {


  person: Person = new Person();

  constructor(private personService: PersonService) { }

  ngOnInit(): void {
  }

  sendData(): void {

    const person = new Person();
    person.username = this.person.username;
    person.password = this.person.password;

    // console.log(person.username, person.password);
    this.personService.sendData(person);
  }

}
