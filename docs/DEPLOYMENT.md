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
- [AWS SAM CLI](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html) installed and set up with [credentials](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-getting-started-set-up-credentials.html)
- Python 3.11 Installed and in your PATH variable
- Select one of the supported regions:
  - US East (Ohio)
  - US East (Virginia)
  - US West (N. California)
  - US West (Oregon)
  - Canada (Central)
  - Europe (Frankfurt)
  - Europe (Ireland)
  - Europe (London)
  - Europe (Milan)
  - Europe (Paris)
  - Europe (Stockholm)
  - Asia Pacific (Jakarta)
  - Asia Pacific (Mumbai)
  - Asia Pacific (Osaka)
  - Asia Pacific (Seoul)
  - Asia Pacific (Singapore)
  - Asia Pacific (Sydney)
  - Asia Pacific (Tokyo)
  - South America (São Paulo)
  - Middle East (Bahrain)
  - Israel (Tel Aviv)
  - Africa (Cape Town)

## Deployment

For this walkthrough, you must have the following prerequisites:

The AWS SAM CLI is an open-source command line tool used to locally build, test, debug, and deploy serverless applications defined with [AWS SAM templates](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-specification-template-anatomy.html).

[Download](https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository) the source code and extract locally: [AWS Samples - Public File Browser for Amazon S3](https://github.com/aws-samples/public-file-browser-for-amazon-s3)

#### Build and deploy the stack

1. In a terminal, navigate to the ./sam/ directory
2. Run the following command to build and package the project for deployment:\
`sam build`
3. Deploy the SAM template to your account. The wizard will guide you through the process of deploying the SAM CloudFormation stack. Details on this process are found in the [sam build documentation](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/sam-cli-command-reference-sam-build.html).
   1. Run the following command: \
      `sam deploy --guided --capabilities CAPABILITY_NAMED_IAM`
   2. Select the supported AWS Region you chose in the prerequisites section.
   3. The default parameters are suggested.
   4. Choose "Y" for all Yes or No items.
4. Wait for the deployment to complete. This process takes approximately five minutes.
5. Once the build completes, note the entries in the Outputs section. This is the URL for the Public File Browser for Amazon S3 web application.
   1. FileBrowserURL - UI for the file browser
2. IMPORTANT: Complete steps 3 and 4 again, but for the `CrossOriginRestriction` parameter input the value from the `FileBrowserURL` output in Step 5. For example: \
   `Parameter CrossOriginRestriction [*]: https://d111111abcdef8.cloudfront.net`

This concludes the deployment of the Public File Browser for Amazon S3 web application. AWS SAM CLI uses [AWS CloudFormation](https://aws.amazon.com/cloudformation/) to orchestrate the deployment of the front-end static website and public file storage bucket. The entire application is deployed.
