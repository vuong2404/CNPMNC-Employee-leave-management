# Run backend
1. **Create .env File:**
   - Create a `.env` file in the `backend` directory, using the provided example file.

     ```bash
     cp ./backend/env.example ./backend/.env
     ```

2. **Install Dependencies:**
   - Run the following command to install project dependencies.

     ```bash
     npm install
     ```

3. **Start the Backend Server:**
   - Run the following command to start the backend server.

     ```bash
     npm start
     ```

4. **Create Database:**
   - Run the following commands to create tables in the database and seed demo data.

     - To create tables in the database:

       ```bash
       npm run db:migrate
       ```
       

     - To seed demo data:

       ```bash
       npm run db:seed
       ```
