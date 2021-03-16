import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';

import { HttpClient } from '@angular/common/http';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

  roleoptions = [];

  constructor( private router: Router, private http: HttpClient) {
    let query = "PREFIX moba: <http://www.semanticweb.org/turro/ontologies/MOBA#> SELECT ?character WHERE { ?character rdf:type moba:Character; rdf:type moba:Marksman. }";
    let body = new FormData();
    body.append('query', query);
    body.append('format', 'text/html')
    this.http.post<any>('http://localhost:8890/sparql', body).subscribe(data => {
          console.log(data);
      })
  }
  ngOnInit(): void {}
}
