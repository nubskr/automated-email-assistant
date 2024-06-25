export interface Email {
    id: any;
    from: string;
    to: string;
    body: string;
    category: any; // this will be null when we parse emails!
    response: any; // this will be null too
}
