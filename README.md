# ÖBB Bus Tracker

Welcome to ÖBB Bus Tracker, a project aimed at providing real-time information about the nearest buses at predefined stops using the ÖBB API. This project consists of a frontend built with React using Create React App, and a backend powered by AWS Lambda on Node.js.
WIEN MOBILE / REGIO

## Demo

Check out the live demo [here](https://d1vlvmzdvhw8b.cloudfront.net).

## Features

- Real-time information about nearest buses at predefined stops.
- Ability to expand the list of stops.
- Predefined routes for easy access.
- Frontend displays bus name, arrival time, delay time (if any), and difference in minutes.
- Simple deployment process using npm commands for frontend and AWS SAM CLI for backend.

## Prerequisites

Before getting started, ensure you have the following prerequisites installed:

- [Node.js](https://nodejs.org/) (with npm)
- [AWS CLI](https://aws.amazon.com/cli/)
- [AWS SAM CLI](https://aws.amazon.com/serverless/sam/)
- [Docker](https://docs.docker.com/engine/install/)
- AWS account with necessary permissions for Lambda deployment

## Setup

1. **Install dependencies**: 
   ```
   npm install
   ```

2. **Configure AWS CLI**: 
   ```
   aws configure
   ```

3. **Initialize AWS SAM CLI**: 
   ```
   sam init
   ```

4. **Deploy backend**:
   ```
   cd backend && sam build && sam deploy
   ```

5. **Deploy frontend**:
   ```
   cd frontend && npm run build && npm run deploy
   ```

## Usage

To use the ÖBB Bus Tracker:

- Run Lambda locally (need docker) - `cd backend && sam local start-api`
- Run front-end app locally - `cd frontend && npm run start`
- Change lambda-url for `fetch` in `frontend/src/App.js` to `localhost:`
- Access the frontend by navigating to the provided CloudFront URL.
- Use predefined routes or customize your own by specifying 'from' and 'to' in the query string, for example: `/?from=rodaun&to=liesing`.

## Development

- Frontend code resides in the `/frontend` directory.
- Backend code resides in the `/backend` directory.
- Feel free to contribute by expanding the functionality or improving the existing codebase.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

