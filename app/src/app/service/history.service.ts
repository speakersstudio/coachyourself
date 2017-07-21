import { Injectable } from '@angular/core';
import { Headers } from '@angular/http';

import { Observable, Subject } from 'rxjs/Rx';
import 'rxjs/add/operator/toPromise';

import { AppHttp } from '../../data/app-http';
import { API } from '../../constants';

import { HistoryModel } from "../../model/history";

@Injectable()
export class HistoryService {

    constructor(
        private http: AppHttp
    ) {
    }

    getAllHistory(): Promise<HistoryModel[]> {
        return this.http.get(API.history)
            .toPromise()
            .then(response => {
                return response.json() as HistoryModel[];
            });
    }
}