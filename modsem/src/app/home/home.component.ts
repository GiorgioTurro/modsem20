//Import di tutte le librerie e i moduli
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

// Dichiarazione di tutte le variabili necessarie per le varie query
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

  view(isChampView:boolean): void{
    this.isChampView = isChampView;
  }

//Ricerca di un campione specifico, se è inserito un nome sulla casella di
//testo verra eseguita una ricerca per nome altrimenti per il ruolo selezionato
  search(): void {
    if (this.champName==""){
      this.searchRole();
    }
    else{
      this.searchChampName();
    }
  }

// Ricerca di un giocatore o di un team (insieme di giocatori)
  searchPlayer(): void{
    if (this.playerName==""){
      this.searchByTeam();
    }
    else{
      this.searchByName();
    }
  }

//Query che si occupa di cercare i campioni per nome
  searchChampName(): void {
    //variabile che contiene il nome del campione
    let champname = this.champName;
    //query sparql
    let query = "PREFIX moba: <http://www.semanticweb.org/turro/ontologies/MOBA#> SELECT ?label ?character ?comment WHERE { ?character rdfs:label ?label; rdfs:label \""+ champname +"\"@en; rdfs:comment ?comment.}";
    this.champResults = [];
    let body = new FormData();
    body.append('query', query);
    body.append('format', 'application/json')
    const headers = { 'format': 'text/html' };
    //chiamata post a virtuoso per effettuare la ricerca
    this.http.post<any>('http://localhost:8890/sparql', body, {headers}).subscribe(data => {
          for (const c of data.results.bindings) {
            var result = new Result(c.character.value, c.label.value, c.comment.value);
            this.champResults.push(result);
          }
      })
  }

//Query che si occupa di cercare i campioni per ruolo
//Le query sono diverse e variano a seconda del ruolo selezionato nella combo box
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

//Una volta selezionato un campione è possibile cercare tutti i campioni
//con lo stesso ruolo
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

//Da questo punto in poi il codice riguarda la sezione Player

//query che si occupa di cercare un giocatore con il suo nome, la ricerca
//viene effettuata richiamando wikidata
  searchByName(): void{
    let playerName = this.playerName;
    playerName = playerName.replace(" ","%20");
    let query = "query=SELECT%20%3Fplayer%20%3FplayerLabel%20%3Fteam%20%3FteamLabel%20%3Fimage%20WHERE%20%7B%0A%20%20%3Fplayer%20wdt%3AP742%20%22"+playerName+"%22%3B%0A%20%20%20%20%20%20%20%20%20%20p%3AP54%20%3FstatementTeam%3B.%0A%20%20%3FstatementTeam%20ps%3AP54%20%3Fteam.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22it%2Cen%22.%20%7D%0A%20%20OPTIONAL%20%7B%20%3FstatementTeam%20pq%3AP582%20%3Fdata_fine.%20%7D%0A%20%20OPTIONAL%20%7B%20%3Fplayer%20wdt%3AP18%20%3Fimage.%7D%0A%20%20FILTER%20(!bound(%3Fdata_fine))%0A%20%20%0A%7D%0ALIMIT%201000%0A";
    this.playerResults = [];
    const headers = { 'Accept': 'application/sparql-results+json' };
    //chiamata get a wikidata
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

  //query che si occupa di cercare i giocatori di un team, la ricerca
  //viene effettuata richiamando wikidata
  searchByTeam(): void{
    let teamName = this.teamName;
    teamName = teamName.replace(" ","%20");
    let query = "query=SELECT%20%3Fplayer%20%3FplayerLabel%20%3Fteam%20%3FteamLabel%20%3Fimage%20WHERE%20%7B%0A%20%20%3Fplayer%20p%3AP54%20%3FstatementTeam%3B%0A%20%20%20%20%20%20%20%20%20%20wdt%3AP2416%20wd%3AQ223341.%0A%20%20%3FstatementTeam%20ps%3AP54%20%3Fteam.%0A%20%20%3Fteam%20rdfs%3Alabel%20%22"+teamName+"%22%40en.%0A%20%20SERVICE%20wikibase%3Alabel%20%7B%20bd%3AserviceParam%20wikibase%3Alanguage%20%22it%2Cen%22.%20%7D%0A%20%20OPTIONAL%20%7B%20%3FstatementTeam%20pq%3AP582%20%3Fdata_fine.%7D%0A%20%20OPTIONAL%20%7B%20%3Fplayer%20wdt%3AP18%20%3Fimage.%7D%0A%20%20FILTER%20(!bound(%3Fdata_fine))%0A%20%20%0A%7D%0ALIMIT%201000";
    this.playerResults = [];
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
}
