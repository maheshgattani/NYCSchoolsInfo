# Schools Website

This is a Next.js project.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

You need to have Node.js and npm (Node Package Manager) or yarn installed on your machine.

*   [Node.js](https://nodejs.org/en/download/) (which includes npm)
*   [Yarn](https://classic.yarnpkg.com/en/docs/install/) (optional, but used in `package.json`)

### Installation

1.  Navigate to the `schools-website` directory:
    ```bash
    cd schools-website
    ```
2.  Install the dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```

### Running the Development Server

To run the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `pages/index.tsx`. The page auto-updates as you edit the file.

### Building for Production

To build the application for production:

```bash
npm run build
# or
yarn build
```

This command optimizes the application for production.

### Starting the Production Server

To start the production server after building:

```bash
npm run start
# or
yarn start
```

## Deploying to Firebase Hosting

This section outlines the steps to deploy this Next.js application to Firebase Hosting.

### Prerequisites

*   **Firebase CLI**: Ensure you have the Firebase CLI installed globally. If not, install it using `npm install -g firebase-tools`.
*   **Firebase Login**: Log in to your Firebase account using `firebase login`.
*   **Firebase Project Initialization**: The `schools-website` directory should already be initialized for Firebase Hosting. The `firebase.json` within `schools-website/` should be configured to deploy to the `nyc-schools` hosting site.

### Deployment Steps

1.  **Build the Next.js application for static export**:
    ```bash
    npm run build
    # or yarn build
    ```
    This command will create an `out/` directory with the static assets.

2.  **Deploy to Firebase Hosting**:
    ```bash
    firebase deploy --only hosting
    ```
    This will deploy the contents of the `out/` directory to the `nyc-schools` Firebase Hosting site.
