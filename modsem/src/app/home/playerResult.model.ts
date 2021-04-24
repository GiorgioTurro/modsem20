export class PlayerResult {
    public uri: string;
    public label: string;
    public team: string;
    public teamLabel: string;
    public image: string;
    public preferredChampion: string;
    constructor(uri:string, label:string, team:string, teamLabel:string, image:string, preferredChampion: string){
        this.uri = uri;
        this.label = label;
        this.team = team;
        this.teamLabel = teamLabel;
        this.image = image;
        this.preferredChampion = preferredChampion;
    }
}
