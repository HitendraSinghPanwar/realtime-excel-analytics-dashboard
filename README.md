# realtime-excel-analytics-dashboard
full-stack real-time dashboard built with FastAPI + Socket.IO for the backend and React (Vite) for the frontend. The application reads data from an Excel file and displays it as interactive charts. Whenever the Excel file changes, the dashboard updates in real time.


# Tech Stack

- **Backend**: Python, FastAPI, Uvicorn, python-socketio, watchdog  
- **Frontend**: React (JSX), Vite, Recharts, Tailwind CSS  
- **Realtime Communication**: Socket.IO over WebSocket  
- **Data Source**: Excel (`.xlsx`)  
- **Visualization**: Recharts (Pie, Bar, Line, Composed charts)

---

# Project Structure

├── backend/
│   ├── app/
│   │   ├── data_handler.py      # Logic for reading & processing Excel data
│   │   └── main.py              # FastAPI + Socket.IO + file watcher
│   ├── venv/                   # (optional) Python virtual environment
│   └── requirements.txt        # Python dependencies
├── frontend/
│   ├── src/
│   │   └── components/         # React chart components (BarChart, PieChart, etc.)
│   ├── public/
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
└── README.md

# Prerequisites

- Python 3.11+  
- Node.js 18+ / npm or yarn  
- *Excel file*: Place your own Excel file in the backend (for example, I am using `data.xlsx`) that contains the needed columns.  
  Example: I’m using `data.xlsx`, and inside it has these columns:
  - `Recruiter Name`
  - `Date`
  - `Interview Status`
  - `Requirement Name`
  - `Week Number`
  - `Month Name`

> **Important:** If your sheet name or column names are different, update `EXCEL_FILE_PATH`, `SHEET_NAME`, and the column constants in `backend/app/data_handler.py` accordingly to match your actual file.
- (Optional for GPU) CUDA 11.8 if using the provided `torch` version. Otherwise, install CPU-only Torch.

---

# Backend Setup

1. Go to the backend directory:

   cd backend

2. Create and activate a virtual environment (recommended):
   ```bash
   python -m venv venv
   source venv/bin/activate   # macOS/Linux
   .\venv\Scripts\activate    # Windows
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Place the Excel file in the backend folder or update its path in `app/data_handler.py`:
   ```python
   EXCEL_FILE_PATH = "Data.xlsx"
   ```
5. Run the backend:
   ```bash
   uvicorn app.main:app --reload
   or
   uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
   ```
   - The server will also watch the Excel file for changes and emit updates.

   - Now go to the another Terminal 

⚙️ Frontend Setup

1. Go to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run in development mode:
   ```bash
   npm run dev
   ```
   - Open the browser at the Vite URL (usually `http://localhost:5173`).
4. Build for production:
   ```bash
   npm run build
   ```
   - Serve the build with any static file server or integrate into backend.
