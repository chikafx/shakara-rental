# Shakara Rentals

A premium car rental web application built with React and Ant Design, offering a modern and responsive user interface for car rental services.

## Features

- 🚗 Browse extensive collection of luxury vehicles
- 🔐 User authentication and profile management
- 📱 Fully responsive design for all devices
- 🎨 Modern UI with Ant Design components
- 🔍 Detailed car information and booking system
- 💳 Secure payment processing
- 🛡️ Protected routes and user authorization

## Tech Stack

- React.js
- Ant Design
- Firebase Authentication
- React Router DOM
- React Toastify
- Tailwind CSS

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- npm or yarn
- Firebase account and configuration

## Installation

1. Clone the repository:

```bash
git clone https://github.com/yourusername/shakara-rentals.git
cd shakara-rentals
```

2. Install dependencies:

```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add your Firebase configuration:

```env
REACT_APP_FIREBASE_API_KEY=your_api_key
REACT_APP_FIREBASE_AUTH_DOMAIN=your_auth_domain
REACT_APP_FIREBASE_PROJECT_ID=your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET=your_storage_bucket
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
REACT_APP_FIREBASE_APP_ID=your_app_id
```

4. Start the development server:

```bash
npm start
# or
yarn start
```

## Project Structure

```
shakara-rentals/
├── public/
├── src/
│   ├── components/
│   │   ├── AddCar.js
│   │   ├── Booking.js
│   │   ├── CarDetails.js
│   │   ├── CarList.js
│   │   ├── Home.js
│   │   ├── Login.js
│   │   ├── Payment.js
│   │   ├── Profile.js
│   │   ├── Signup.js
│   │   └── VerifySignin.js
│   ├── App.js
│   ├── index.js
│   └── firebase.js
├── .gitignore
├── package.json
└── README.md
```

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- [Ant Design](https://ant.design/) for the UI components
- [Firebase](https://firebase.google.com/) for authentication
- [Create React App](https://create-react-app.dev/) for the project setup
