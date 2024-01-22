import { GitHubClient } from "./github/github";

// type GitHubClient = InstanceType<typeof GitHub>;
describe("App", () => {
    
    const example: GitHubClient ={
        
    } as any as GitHubClient;
    console.log(example);
//   const mockedClient = jasmine.createSpyObj<GitHubClient>([
//     "createReview",
//     "listReviews",
//     "dismissReview",
//     "debug",
//     "fail",
//     "pullRequest",
//   ]);
  // const mockedContext = jasmine.createSpyObj<Context>([]);

  // const appConfig: AppConfig = {
  //     BodyRegex: "",
  //     TitelRegex: "^\W*(PAX-I\d+)(\W+\w+){2,}",
  //     OnFailedBodyComment: "Your pull request must have a meaningful description.",
  //     OnFailedTitelComment: "Your pull request must have a meaningful title beginning with a ticket number (PAX-I123 or [PAX-I123]).",
  //     CreateReviewOnFailedRegex: true,
  //     FailActionOnFailedRegex: false,
  //     RequestChangesOnFailedRegex: false,
  // };

  // const app = new App(mockedClient, mockedContext, appConfig);
  // app.init();
});
