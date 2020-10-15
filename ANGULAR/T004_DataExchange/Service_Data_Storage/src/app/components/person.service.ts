import { Injectable } from '@angular/core';
import { Person } from './person';

@Injectable({
  providedIn: 'root'
})
export class PersonService {

  private persons: Person[];

  constructor(){
    this.persons = [];
  }

  storeData(person: Person): void{
    this.persons.push(person);
  }

  getData(): any{
    return this.persons;
  }
}
