import { Package } from '../model/package';
import { MaterialItem } from '../model/material-item';

export class Library {
    packages: Package[] = [];
    materials: MaterialItem[] = [];
}