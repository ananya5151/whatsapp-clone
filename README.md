# WhatsApp Web Clone 💬

A full-stack WhatsApp Web clone built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.IO for real-time chat functionality. This project processes simulated webhook data, displays conversations, and allows sending messages in a responsive interface that mimics WhatsApp Web.

---

## 🌐 Live Demo

* **Frontend (Vercel):** **[LIVE DEMO](https://whatsapp-clone-eight-liart.vercel.app/)**
* **Backend API (Render):** **[BACKEND](https://whatsapp-clone-88mx.onrender.com/)**


<img width="1915" height="998" alt="Screenshot 2025-08-08 022340" src="https://github.com/user-attachments/assets/4de9a07c-f892-4d5b-8806-50b1f8ef84a7" />
<img width="1912" height="1001" alt="Screenshot 2025-08-08 022436" src="https://github.com/user-attachments/assets/887fc321-ed5f-43ec-94f6-324fbdabc100" />
<img width="1919" height="1011" alt="Screenshot 2025-08-08 022353" src="https://github.com/user-attachments/assets/8af6077d-3c63-4891-8411-a088224d00ea" />


---

## ✨ Features

-   **WhatsApp-like UI:** Clean, responsive, and familiar user interface.
-   **Conversation View:** Grouped conversations by user, just like the real app.
-   **Real-Time Chat:** Instant message updates using WebSockets (Socket.IO).
-   **Message Status:** Indicators for 'sent', 'delivered', and 'read' statuses.
-   **Send Messages:** A demo feature to send new messages which are saved to the database.
-   **Full-Stack Architecture:** Built with a Node.js/Express backend and a React frontend.
-   **Database Integration:** Uses MongoDB Atlas for data persistence.

---

## 🛠️ Tech Stack

-   **Frontend:** React.js, Socket.IO Client, Axios
-   **Backend:** Node.js, Express.js, Socket.IO
-   **Database:** MongoDB (with Mongoose)
-   **Deployment:** Vercel (Frontend) & Render (Backend)

---

## 🚀 Getting Started Locally

### Prerequisites

-   Node.js & npm (or yarn)
-   Git
-   A free MongoDB Atlas account

### Setup & Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/ananya5151/whatsapp-clone.git](https://github.com/ananya5151/whatsapp-clone.git)
    cd whatsapp-clone
    ```

2.  **Setup Backend (`/server`):**
    ```bash
    cd server
    npm install
    ```
    - Create a `.env` file in the `/server` directory.
    - Add your MongoDB Atlas connection string to it:
      ```
      MONGO_URI=your_mongodb_connection_string
      ```

3.  **Setup Frontend (`/client`):**
    ```bash
    cd ../client
    npm install
    ```

4.  **Run the application:**
    - **Start the backend server:** In one terminal (from the `/server` folder), run:
      ```bash
      node server.js
      ```
    - **Start the frontend server:** In a second terminal (from the `/client` folder), run:
      ```bash
      npm start
      ```

The application will be available at `http://localhost:3000`.

