import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { InputTextModule } from 'primeng/inputtext';
import { DropdownModule } from 'primeng/dropdown';

import { HttpClient } from '@angular/common/http';

import { Result } from './result.model';
import { PlayerResult } from './playerResult.model';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})

export class HomeComponent implements OnInit {

  champName: string ="";
  playerName: string = "";
  teamName: string = "";
  champTable: any;
  playerTable: any;
  champResults: Result[] = [];
  playerResults: PlayerResult[] = [];
  roles: String [] = ["bruiser", "tank", "sustainDamage", "burstDamage", "healer", "support"];
  selectedOption: String="Bruiser";

  isChampView: boolean = true;

  constructor( private router: Router, private http: HttpClient) {

  }
  ngOnInit(): void {
    let team = "G2 Esports";
    team = team.replace(" ","%20");
    console.log(team);
  }

  view(isChampView:boolean): void{
    this.isChampView = isChampView;
  }

  search(): void {
    if (this.champName==""){
      this.searchRole();
    }
    else{
      this.searchChampName();
    }
  }

  searchPlayer(): void{
    if (this.playerName==""){
      this.searchByTeam();
    }
    else{
      this.searchByName();
    }
  }

  searchChampName(): void {
    let champname = this.champName;
    let query = "PREFIX moba: <http://www.semanticweb.org/turro/ontologies/MOBA#> SELECT ?label ?character ?comment WHERE { ?character rdfs:label ?label; rdfs:label \""+ champname +"\"@en; rdfs:comment ?comment.}";
    this.champResults = [];
    let body = new FormData();
    body.append('query', query);
    body.append('format', 'application/json')
    const headers = { 'format': 'text/html' };
    this.http.post<any>('http://localhost:8890/sparql', body, {headers}).subscribe(data => {
          for (const c of data.results.bindings) {
            var result = new Result(c.character.value, c.label.value, c.comment.value);
            this.champResults.push(result);
          }
      })
  }

  searchRole(): void{
    let kindOfRole = "";
    let query = "";
    if (this.selectedOption == "bruiser" || this.selectedOption == "tank"){
      kindOfRole = "isAFrontLine";
      query = "PREFIX moba: <http://www.semanticweb.org/vincenturro/moba#> SELECT ?label ?character ?comment WHERE { ?character rdfs:label ?label; rdf:type moba:Champion; moba:" + kindOfRole + " moba:" + this.selectedOption + "; rdfs:comment ?comment.}";
    }else if (this.selectedOption == "sustainDamage" || this.selectedOption == "burstDamage"){
      kindOfRole = "isADamageDealer";
      query = "PREFIX moba: <http://www.semanticweb.org/vincenturro/moba#> SELECT ?label ?character ?comment WHERE { ?character rdfs:label ?label; rdf:type moba:Champion; moba:" + kindOfRole + " moba:" + this.selectedOption + "; rdfs:comment ?comment.}";
    }else if (this.selectedOption == "healer" || this.selectedOption == "support"){
      kindOfRole = "isASustainTeam";
      query = "PREFIX moba: <http://www.semanticweb.org/vincenturro/moba#> SELECT ?label ?character ?comment WHERE { ?character rdfs:label ?label; rdf:type moba:Champion; moba:" + kindOfRole + " moba:" + this.selectedOption + "; rdfs:comment ?comment.}";
    }
    this.champResults = [];
    let body = new FormData();
    body.append('query', query);
    body.append('format', 'application/json')
    const headers = { 'format': 'text/html' };
    this.http.post<any>('http://localhost:8890/sparql', body, {headers}).subscribe(data => {
          for (const c of data.results.bindings) {
            var result = new Result(c.character.value, c.label.value, c.comment.value);
            this.champResults.push(result);
          }
      })
  }

  sameRole(): void{
    let champname = this.champName;
    let query = "PREFIX moba: <http://www.semanticweb.org/vincenturro/moba#> SELECT ?label ?character ?comment WHERE { ?character rdfs:label ?label; moba:sameRole ?champ2; rdfs:comment ?comment. ?champ2 rdfs:label \"" + champname + "\"@en.}";
    this.champResults = [];
    let body = new FormData();
    body.append('query', query);
    body.append('format', 'application/json')
    const headers = { 'format': 'text/html' };
    this.http.post<any>('http://localhost:8890/sparql', body, {headers}).subscribe(data => {
          for (const c of data.results.bindings) {
            var result = new Result(c.character.value, c.label.value, c.comment.value);
            this.champResults.push(result);
          }
      })
  }


  //Player Section
  searchByName(): void{
    let playerName = this.playerName;
    playerName = playerName.replace(" ","%20");
    let query = "query=SELECT%20%3Fplayer%20%3FplayerLabel%20%3Fteam%20%3FteamLabel%20%3Fimage%20WHERE%20%7B%0A%20%20%3Fplayer%20wdt%3AP742%20%22"+playerName+"%22%3B%0A%20%20%20%20%20%20%20%20%20%20p%3AP54%20%3FstatementTeam%3B.%0A%20%20%3FstatementTeam%20ps%3AP54%20%3Fteam.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22it%2Cen%22.%20%7D%0A%20%20OPTIONAL%20%7B%20%3FstatementTeam%20pq%3AP582%20%3Fdata_fine.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fplayer%20wdt%3AP18%20%3Fimage.%7D%0A%20%20FILTER%20(!bound(%3Fdata_fine))%0A%20%20%0A%7D%0ALIMIT%201000%0A";
    this.playerResults = [];
    // let body = new FormData();
    // body.append('query', query);
    // body.append('format', 'application/json')
    const headers = { 'Accept': 'application/sparql-results+json' };
    this.http.get<any>('https://query.wikidata.org/sparql?' + query, {headers}).subscribe(data => {
          for (const c of data.results.bindings) {
            let playerName = c.player.value;
            console.log(playerName);
            let query = "PREFIX moba: <http://www.semanticweb.org/vincenturro/moba#> SELECT ?preferredChampion ?preferredChampionLabel WHERE { ?player moba:preferredChampion ?preferredChampion. ?preferredChampion rdfs:label ?preferredChampionLabel. FILTER regex(?player, \"" + playerName + "\")}";
            this.playerResults = [];
            let body = new FormData();
            body.append('query', query);
            body.append('format', 'application/json')
            const headers = { 'format': 'text/html' };
            this.http.post<any>('http://localhost:8890/sparql', body, {headers}).subscribe(nesteData => {
              let image = "None";
              if(c.hasOwnProperty('image')){
                image = c.image.value;
              }
              var result = new PlayerResult(c.player.value, c.playerLabel.value, c.team.value, c.teamLabel.value, image, nesteData.results.bindings[0].preferredChampionLabel.value);
              this.playerResults.push(result);
              })
            }
      })
  }

  searchByTeam(): void{
    let teamName = this.teamName;
    teamName = teamName.replace(" ","%20");
    let query = "query=SELECT%20%3Fplayer%20%3FplayerLabel%20%3Fteam%20%3FteamLabel%20%3Fimage%20WHERE%20%7B%0A%20%20%3Fplayer%20p%3AP54%20%3FstatementTeam%3B%0A%20%20%20%20%20%20%20%20%20%20wdt%3AP2416%20wd%3AQ223341.%0A%20%20%3FstatementTeam%20ps%3AP54%20%3Fteam.%0A%20%20%3Fteam%20rdfs%3Alabel%20%22"+teamName+"%22%40en.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22it%2Cen%22.%20%7D%0A%20%20OPTIONAL%20%7B%20%3FstatementTeam%20pq%3AP582%20%3Fdata_fine.%7D%0A%20%20OPTIONAL%20%7B%20%3Fplayer%20wdt%3AP18%20%3Fimage.%7D%0A%20%20FILTER%20(!bound(%3Fdata_fine))%0A%20%20%0A%7D%0ALIMIT%201000";
    this.playerResults = [];
    // let body = new FormData();
    // body.append('query', query);
    // body.append('format', 'application/json')
    const headers = { 'Accept': 'application/sparql-results+json' };
    this.http.get<any>('https://query.wikidata.org/sparql?' + query, {headers}).subscribe(data => {
          for (const c of data.results.bindings) {
            let playerName = c.player.value;
            console.log(playerName);
            let query = "PREFIX moba: <http://www.semanticweb.org/vincenturro/moba#> SELECT ?preferredChampion ?preferredChampionLabel WHERE { ?player moba:preferredChampion ?preferredChampion. ?preferredChampion rdfs:label ?preferredChampionLabel. FILTER regex(?player, \"" + playerName + "\")}";
            this.playerResults = [];
            let body = new FormData();
            body.append('query', query);
            body.append('format', 'application/json')
            const headers = { 'format': 'text/html' };
            this.http.post<any>('http://localhost:8890/sparql', body, {headers}).subscribe(nesteData => {
              let image = "None";
              if(c.hasOwnProperty('image')){
                image = c.image.value;
              }
              var result = new PlayerResult(c.player.value, c.playerLabel.value, c.team.value, c.teamLabel.value, image, nesteData.results.bindings[0].preferredChampionLabel.value);
              this.playerResults.push(result);
              })
            }
      })
  }

  sameTeam(): void {
    let playerName = this.playerName;
    let query = "PREFIX moba: <http://www.semanticweb.org/vincenturro/moba#> SELECT ?label ?player ?team ?teamLabel ?player2 WHERE { ?player rdfs:label ?label; rdf:type moba:Player; moba:hasTeammate ?player2; moba:isInTheTeam ?team. ?player2 rdfs:label \"" + playerName + "\"@en.  ?team rdfs:label ?teamLabel.}";
    this.playerResults = [];
    let body = new FormData();
    body.append('query', query);
    body.append('format', 'application/json')
    const headers = { 'format': 'text/html' };
    this.http.post<any>('http://localhost:8890/sparql', body, {headers}).subscribe(data => {
          for (const c of data.results.bindings) {
            // var result = new PlayerResult(c.player.value, c.label.value, c.team.value, c.teamLabel.value);
            // this.playerResults.push(result);
          }
      })
  }


}



// var endpointUrl = 'https://query.wikidata.org/sparql',
// 	sparqlQuery = "SELECT ?item ?itemLabel ?developerLabel ?countryLabel ?releaseDate WHERE {\n" +
//         "  ?item wdt:P136 wd:Q1189206.\n" +
//         "  ?item wdt:P178 ?developer.\n" +
//         "  ?item wdt:P495 ?country.\n" +
//         "  ?country wdt:P1705 ?countryLabel.\n" +
//         "  ?item wdt:P577 ?releaseDate.\n" +
//         "  \n" +
//         "  VALUES ?item {\n" +
//         "    wd:Q223341\n" +
//         "  }\n" +
//         "  SERVICE wikibase:label { bd:serviceParam wikibase:language \"[AUTO_LANGUAGE],en\". }\n" +
//         "}\n" +
//         "LIMIT 50";
