import { Component } from '@angular/core';
import { Person } from './components/person';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'chi-angular-app';
  persons: Person[] = [];

  getPerson(person: Person): void{
    this.persons.push(person);
  }
}
