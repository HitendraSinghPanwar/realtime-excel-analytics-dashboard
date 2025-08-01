import asyncio
import os
import socketio
import uvicorn
from fastapi import FastAPI
from app.data_handler import get_data_from_excel, EXCEL_FILE_PATH

app = FastAPI()

sio = socketio.AsyncServer(async_mode='asgi', cors_allowed_origins='*')

socket_app = socketio.ASGIApp(sio)
app.mount('/socket.io', socket_app)



@sio.event
async def connect(sid, environ, auth=None):
    print(f"SUCCESS! Client connected: {sid}")

    await sio.emit('data_updated', get_data_from_excel(), to=sid)

@sio.event
def disconnect(sid):
    print(f"Client disconnected: {sid}")

@sio.event
async def manual_refresh(sid, data=None):
    print("Manual refresh triggered by client")
    await sio.emit('data_updated', get_data_from_excel())

from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

class ExcelChangeHandler(FileSystemEventHandler):
    def __init__(self, sio_server, loop):
        self.sio = sio_server
        self.loop = loop

    def on_modified(self, event):
        if not event.is_directory:

            filename, file_extension = os.path.splitext(event.src_path)
            if file_extension in ['.xlsx', '.xls']:
                print(f"File {event.src_path} has been modified. Emitting update.")
                coro = self.sio.emit('data_updated', get_data_from_excel())
                asyncio.run_coroutine_threadsafe(coro, self.loop)

def start_file_watcher(sio_server, loop):
    event_handler = ExcelChangeHandler(sio_server, loop)
    observer = Observer()
    observer.schedule(event_handler, path=os.path.dirname(os.path.abspath(EXCEL_FILE_PATH)), recursive=False)
    observer.start()
    print(f"Started watching {EXCEL_FILE_PATH} for changes.")
    return observer

@app.on_event("startup")
async def startup_event():
    loop = asyncio.get_running_loop()
    start_file_watcher(sio, loop)

if __name__ == '__main__':
    uvicorn.run(app, host='0.0.0.0', port=8000)
