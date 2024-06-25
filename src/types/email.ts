export interface Email {
    id: string;
    from: string;
    to: string;
    subject: string;
    body: string;
    category: any; // this will be null when we parse emails!
    response: any; // this will be null too
}
