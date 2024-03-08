# Deployment Instructions

The solution is package as an automated deployment via the [AWS Serverless Application Model (SAM)](https://aws.amazon.com/serverless/sam/) CLI.

The following sections guide you through the following process:

- Download the sample code to your local machine
- Deploy the serverless application via the [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html)
- Upload PUBLIC files to the `public-file-browser-files-[...]` Amazon S3 Bucket
- View the public file browser interface via the URL in the SAM/CloudFormation Outputs

## Prerequisites

For this walkthrough, you need to have the following prerequisites:

- An [AWS account](https://portal.aws.amazon.com/billing/signup)
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) installed and configured with [credentials](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-getting-started-set-up-credentials.html)
- Python 3.11 Installed and in your PATH variable
- Select one of the supported AWS regions:
  - US East (N. Virginia)
  - US East (Ohio)
  - US West (N. California)
  - US West (Oregon)
  - Canada (Central)
  - Europe (Frankfurt)
  - Europe (Stockholm)
  - Europe (Ireland)
  - Europe (London)
  - Europe (Paris)
  - Asia Pacific (Tokyo)
  - Asia Pacific (Seoul)
  - Asia Pacific (Osaka)
  - Asia Pacific (Mumbai)
  - Asia Pacific (Singapore)
  - Asia Pacific (Sydney)
  - South America (São Paulo)

## Deployment

For this walkthrough, you must have the following prerequisites:

The AWS SAM CLI is an open-source command line tool used to locally build, test, debug, and deploy serverless
applications defined with [AWS SAM templates](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-template-anatomy.html).

[Download](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository) the source code and extract locally:
[AWS Samples - Public File Browser for Amazon S3](https://github.com/aws-samples/public-file-browser-for-amazon-s3)

#### Build and deploy the stack

1. In a terminal, navigate to the ./sam/ directory within the downloaded code repository
2. Run the following command to build and package the project for deployment:\
`sam build`
3. Deploy the SAM template to your account. The wizard will guide you through the process of deploying the SAM AWS
   CloudFormation stack. Details on this process are found in the [sam build documentation](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-build.html).
   1. Run the following command: \
      `sam deploy --guided --capabilities CAPABILITY_NAMED_IAM`
   2. Enter values for the deployment parameters:
      1. Stack Name - Choose a unique AWS CloudFormation stack name. End users will not see this.
      2. AWS Region - The supported AWS Region you chose in the prerequisites section.
      3. `SiteName` - Publicly visible title for the site, shown on the top of the page and in the title bar.
      4. `FilesOpenTabMode` - How do you want the browser to react when a user clicks a file in the interface? Values
         below. `In New Tab` is recommended.
         1. `In New Tab`
         2. `In Same Tab`
      5. `VisibleStorageClasses` - Comma delimited list of storage classes to show. Recommend keeping this default.
      6. `CrossOriginRestriction` - Browser security setting, set to `*` for first deployment, then see Step 6 below.
   3. Select the default inputs for the remaining items with the last prompt before deployment being: \
      `Deploy this changeset?`
4. Wait for the deployment to complete. This process takes approximately five minutes with a final prompt stating: \
   `Successfully created/updated stack - [STACK-NAME] in [REGION]`
5. Once the deployment completes, note the following entries in the Outputs section.
   1. `FileBrowserURL` - This URL is for the public web interface. Needed in Step 6.
   2. `PublicFilesBucket` - The name of the Amazon S3 Bucket for storing PUBLICLY ACCESSIBLE files which will display in
      the user browser.
   3. `WebInterfaceAppBucket` - The name of the Amazon S3 Bucket which stores the code that runs the file browser web
      interface.
6. IMPORTANT: Complete steps 3 and 4 again, keeping all values the same except for the `CrossOriginRestriction`
   parameter input the value from the FileBrowserURL output in Step 5. For example: \
   `Parameter CrossOriginRestriction [*]: https://d111111abcdef8.cloudfront.net`

This concludes the deployment of the Public File Browser for Amazon S3 web application. AWS SAM CLI uses
[AWS CloudFormation](https://aws.amazon.com/cloudformation/) to orchestrate the deployment of the front-end static website and public file storage bucket.
The entire application is deployed.
