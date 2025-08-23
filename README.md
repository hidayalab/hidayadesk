# HidayaDesk

HidayaDesk is a simple and elegant dashboard application designed to help you organize your bookmarks, notes, and Islamic resources with ease. It's built with Vue.js and Vite, providing a fast and modern user experience.

## 🚀 Live Demo

Check out the live demo: [https://hidayalab.github.io/hidayadesk](https://hidayalab.github.io/hidayadesk)

## Features

*   **Simple & Clean Interface:** A minimalist design to help you focus on your notes.
*   **Markdown Support:** Write your notes in Markdown for easy formatting.
*   **Fast & Responsive:** Built with Vue.js and Vite for a snappy user experience.

## Installation

To get started with HidayaDesk, follow these simple steps:

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/hidayalab/hidayadesk.git
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd hidayadesk
    ```
3.  **Install the dependencies:**
    ```bash
    npm install
    ```
4.  **Run the development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

## Building for Production

To build the application for production, run the following command:

```bash
npm run build
```

This will create a `dist` directory with the production-ready files.

## Running with Docker

You can also run HidayaDesk using Docker. This is a convenient way to run the application in a containerized environment without needing to install Node.js or other dependencies on your local machine.

1.  **Build the Docker image:**
    ```bash
    docker build -t hidayadesk .
    ```
2.  **Run the Docker container:**
    ```bash
    docker run -p 8080:80 hidayadesk
    ```
    The application will be available at `http://localhost:8080`.

## Contributing

We welcome contributions from the community! If you'd like to contribute to HidayaDesk, please follow these guidelines:

### Bug Reports & Feature Requests

If you encounter a bug or have a feature request, please [open an issue](https://github.com/hidayalab/hidayadesk/issues) on GitHub. Please provide as much detail as possible, including steps to reproduce the bug or a clear description of the requested feature.

### Pull Requests

1.  **Fork the repository** on GitHub.
2.  **Create a new branch** for your feature or bug fix.
3.  **Make your changes** and commit them with a clear and descriptive message.
4.  **Push your changes** to your fork.
5.  **Create a pull request** to the `main` branch of the original repository.

We appreciate your help in making HidayaDesk even better!

### Adding New Themes

We encourage you to contribute new themes to HidayaDesk! To add a new theme, follow these steps:

1.  **Create a new CSS file** in the `src/assets/themes` directory. The filename should be the name of your theme in lowercase (e.g., `my-theme.css`).
2.  **Define your theme's styles** in the new CSS file. You can use the existing themes as a reference. At a minimum, you should define styles for the `.notebook-header` and `.add-page-btn` classes, as well as their hover states.
3.  **Import your new theme** in `src/App.vue`. Add a new import statement at the top of the `<script>` section, like this:
    ```javascript
    import './assets/themes/my-theme.css';
    ```
4.  **Add your theme to the `themes` array** in `src/App.vue`. This will make it available in the theme selector.

That's it! Your new theme will now be available in the application.

## License

This project is licensed under the MIT License.
