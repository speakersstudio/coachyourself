import { Injectable } from '@angular/core';

import 'rxjs/add/operator/toPromise';

import { RequestOptions, Headers } from '@angular/http';
import { AppHttp } from '../../data/app-http';
import { API } from '../../constants';

import { Package } from '../../model/package';
import { MaterialItem, MaterialItemVersion } from '../../model/material-item';
import { Subscription } from '../../model/subscription';
import { Team } from '../../model/team';

import { User } from '../../model/user';
import { UserService } from '../../service/user.service';

import { Library } from '../../model/library';

@Injectable()
export class LibraryService {

    private subscriptions: Subscription[];
    private packages: Package[];

    constructor(
        private http: AppHttp,
        private userService: UserService
        ) { }

    /**
     * Get the materials that you own
     */
    getOwnedMaterials(): Promise<Library> {
        return this.http.get(API.userMaterials(this.userService.getLoggedInUser()._id))
            .toPromise()
            .then(response => {
                return response.json() as Library;
            });
    }

    /**
     * Get the materials that a team owns (will die )
     */
    getTeamMaterials(teamId: string): Promise<Library> {
        return this.http.get(API.teamMaterials(teamId))
            .toPromise()
            .then(response => {
                return response.json() as Library;
            });
    }

    downloadMaterial(id: string): void {
        this.http.get(API.getMaterial(id))
            .toPromise()
            .then(response => {
                let url = response.json().url;
                window.open(location.origin + url);
            });
    }

    downloadPackage(id: string): void {
        this.http.get(API.getPackage(id))
            .toPromise()
            .then(response => {
                let url = response.json().url;
                window.open(location.origin + url);
            })
    }

    /**
     * Util method to sort a material item's versions
     * @param m the material item to find the latest version for
     */
    getLatestVersionForMaterialItem(m: MaterialItem): MaterialItemVersion {
        m.versions.sort((a, b) => {
            return b.ver - a.ver;
        });
        return m.versions[0];
    }

    // this is for admin - perhaps admin items should live in their own service?
    getAllMaterials(): Promise<MaterialItem[]> {
        return this.http.get(API.getMaterial('all'))
            .toPromise()
            .then(response => {
                return response.json() as MaterialItem[];
            });
    }

    getAllPackages(): Promise<Package[]> {
        return this.http.get(API.getPackage('all'))
            .toPromise()
            .then(response => {
                return response.json() as Package[];
            });
    }

    createMaterial(): Promise<MaterialItem> {
        if (this.userService.can('material_create')) {
            return this.http.post(API.materials, {})
                .toPromise()
                .then(response => {
                    return response.json() as MaterialItem;
                });
        }
    }

    createPackage(): Promise<Package> {
        if (this.userService.can('package_create')) {
            return this.http.post(API.package, {})
                .toPromise()
                .then(response => {
                    return response.json() as Package;
                });
        }
    }

    deleteMaterial(material: MaterialItem): Promise<boolean> {
        if (this.userService.can('material_delete')) {
            return this.http.delete(API.getMaterial(material._id))
                .toPromise()
                .then(response => {
                    return true;
                })
        }
    }

    deletePackage(p: Package): Promise<boolean> {
        if (this.userService.can('package_delete')) {
            return this.http.delete(API.getPackage(p._id))
                .toPromise()
                .then(response => {
                    return true;
                })
        }
    }

    saveMaterial(material: MaterialItem): Promise<MaterialItem> {
        if (!this.userService.isSuperAdmin()) {
            return;
        }
        return this.http.put(API.getMaterial(material._id), material)
            .toPromise()
            .then(response => {
                return response.json() as MaterialItem;
            });
    }

    savePackage(p: Package): Promise<Package> {
        if (this.userService.can('package_edit')) {
            return this.http.put(API.getPackage(p._id), p)
                .toPromise()
                .then(response => {
                    return response.json() as Package;
                })
        }
    }

    postNewVersion(materialItemId: string, version: MaterialItemVersion, file: File): Promise<MaterialItem> {
        if (!this.userService.isSuperAdmin()) {
            return;
        }

        let formData = new FormData();
        formData.append('ver', version.ver + '');
        formData.append('description', version.description);
        formData.append('file', file, file.name);

        return this.http.postFormData(API.materialVersion(materialItemId), formData).toPromise()
            .then(response => {
                return response.json() as MaterialItem;
            });
    }

    deleteVersion(materialItemId: string, version: MaterialItemVersion): Promise<MaterialItem> {
        if (!this.userService.isSuperAdmin()) {
            return;
        }

        return this.http.delete(API.getMaterialVersion(materialItemId, version._id)).toPromise()
            .then(response => {
                return response.json() as MaterialItem;
            });
    }

    savePackagePackages(p: Package): Promise<Package> {
        if (this.userService.can('package_edit')) {
            return this.http.put(API.savePackagePackages(p._id), p)
                .toPromise()
                .then(response => {
                    return response.json() as Package;
                })
        }
    }

    savePackageMaterials(p: Package): Promise<Package> {
        if (this.userService.can('package_edit')) {
            return this.http.put(API.savePackageMaterials(p._id), p)
                .toPromise()
                .then(response => {
                    return response.json() as Package;
                })
        }
    }

    private handleError(error: any): Promise<any> {
        console.error('An error has occurred', error);
        return Promise.reject(error.message || error);
    }
}