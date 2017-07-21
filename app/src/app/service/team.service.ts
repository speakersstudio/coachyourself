import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';

import { Observable, Subject } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';

import { AppHttp } from '../../data/app-http';
import { API } from '../../constants';

import { UserService } from '../../service/user.service';

import { User } from "../../model/user";
import { Team } from '../../model/team';
import { Purchase } from '../../model/purchase';
import { Invite } from '../../model/invite';
import { Subscription } from '../../model/subscription';

@Injectable()
export class TeamService {

    private teams: Team[] = [];

    constructor(
        private http: AppHttp,
        private userService: UserService
    ) {
    }

    addTeams(teams: Team[]): void {
        teams.forEach(team => {
            this.addTeam(team);
        });
    }

    addTeam(team: Team): void {
        let index = this.teams.findIndex(t => {
            return t._id === team._id;
        });
        
        if (index > -1) {
            this.teams.splice(index, 1);
        }

        this.teams.push(team);
    }

    findTeamById(id: string): Team {
        let selectedTeam = null;
        this.teams.forEach(team => {
            if (team._id == id) {
                selectedTeam = team;
            }
        })
        return selectedTeam;
    }

    getTeam(id: string): Promise<Team> {
        let team = this.findTeamById(id);
        if (team) {
            return new Promise<Team>((res, rej) => {
                res(team);
            });
        } else {
            return this.http.get(API.getTeam(id))
                .toPromise()
                .then(response => {
                    return response.json() as Team;
                });
        }
    }

    saveTeam(team: Team): Promise<Team> {
        return this.http.put(API.getTeam(team._id), team)
            .toPromise()
            .then(response => {
                let team = response.json() as Team;
                this.addTeam(team);
                return team;
            })
    }

    invite(team: Team, email: string): Promise<Invite> {
        return this.http.post(API.teamInvite(team._id), {email: email})
            .toPromise()
            .then(response => {
                let invite = response.json() as Invite;
                let teamToUpdate = this.findTeamById(team._id);
                if (teamToUpdate) {
                    teamToUpdate.subscription.invites.push(invite);
                }
                
                return invite;
            });
    }

    removeUserFromTeam(team: Team, user: User): Promise<Team> {
        return this.http.put(API.removeUser(team._id, user._id), {})
            .toPromise()
            .then(response => {
                let team = response.json() as Team;
                this.addTeam(team);
                return team;
            })
    }

    promoteUser(team: Team, user: User): Promise<Team> {
        return this.http.put(API.promoteUser(team._id, user._id), {})
            .toPromise()
            .then(response => {
                let team = response.json() as Team;
                this.addTeam(team);
                return team;
            })
    }

    demoteUser(team: Team, user: User): Promise<Team> {
        return this.http.put(API.demoteUser(team._id, user._id), {})
            .toPromise()
            .then(response => {
                let team = response.json() as Team;
                this.addTeam(team);
                return team;
            })
    }
    
    fetchPurchases(team: Team): Promise<Purchase[]> {
        return this.http.get(API.teamPurchases(team._id))
            .toPromise()
            .then(response => {
                return response.json() as Purchase[];
            });
    }

    fetchSubscription(team: Team): Promise<Subscription> {
        return this.http.get(API.teamSubscription(team._id))
            .toPromise()
            .then(response => {
                let team = response.json() as Team;
                return team.subscription;
            })
    }

    fetchTeams(user?: User): Promise<User> {
        user = user || this.userService.getLoggedInUser();

        return this.http.get('/api/user/' + user._id + '/teams')
            .toPromise()
            .then(response => {
                let user = response.json() as User;
                    
                this.addTeams(<Team[]> user.adminOfTeams);
                this.addTeams(<Team[]> user.memberOfTeams);

                return user;
            });
    }

    buySubscriptions(teamId: string, count: number, stripeToken: string): Promise<Subscription> {
        return this.http.post(API.teamSubscription(teamId), {count: count, stripeToken: stripeToken}).toPromise()
            .then(response => {
                return response.json() as Subscription;
            })
    }

}