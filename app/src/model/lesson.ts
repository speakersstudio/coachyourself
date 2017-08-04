export class LessonVersion {
    "_id": string;
    "ver": number;
    "description": string;
    "extension": string;
    "dateAdded": Date;
}

export class Lesson {
    _id: string;
    name: string;
    description: string;
    versions: LessonVersion[];
    visible: boolean;
    showOnDashboard: boolean;
}