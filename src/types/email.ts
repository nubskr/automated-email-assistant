export interface Email {
    id: any;
    from: string;
    to: string;
    body: string;
    subject: string;
    category: any; // this will be null when we parse emails!
    response: any; // this will be null too
    vendor: string; // gmail / outlook
    accessToken: any; // we need this for outlook reply sending, null for gmail 
}
