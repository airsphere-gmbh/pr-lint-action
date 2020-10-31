interface AppConfig{
    TitelRegex: string;
    BodyRegex: string;
    OnFailedTitelComment: string;
    OnFailedBodyComment: string;
    FailActionOnFailedRegex: boolean;
    RequestChangesOnFailedRegex: boolean;
    CreateReviewOnFailedRegex: boolean;

}