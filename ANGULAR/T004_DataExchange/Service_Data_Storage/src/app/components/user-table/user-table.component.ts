import { Component, OnInit } from '@angular/core';
import { Person } from '../person';
import { PersonService } from '../person.service';

@Component({
  selector: 'app-user-table',
  templateUrl: './user-table.component.html',
  styleUrls: ['./user-table.component.scss']
})
export class UserTableComponent implements OnInit {

  persons: Person[];
  constructor(private personService: PersonService) {
  }

  ngOnInit(): void {
  }

  getData(): void{
    this.persons = this.personService.getData();
  }

}
