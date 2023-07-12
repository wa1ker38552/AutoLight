from flask import render_template
from flask import request
from flask import Flask
import time
import json
import copy

app = Flask(__name__)
# CLIENT_DEVICES = json.loads(open('data.json', 'r').read())
CLIENT_DEVICES = None
LAST_UPDATED = None
OUTGOING_DATA = []
ACK_COMMANDS = 0

@app.route('/')
def app_index():
  return render_template('index.html')

@app.route('/devices')
def api_devices():
  if CLIENT_DEVICES is None:
    return {'success': False}
  else:
    return {'success': True, 'data': CLIENT_DEVICES}

@app.route('/ack')
def api_ack():
  global ACK_COMMANDS
  ACK_COMMANDS = int(request.args.get('commands'))
  return {'success': True}

@app.route('/command', methods=['POST'])
def api_command():
  data = json.loads(request.data.decode('utf-8'))
  OUTGOING_DATA.append(data['command'])
  return {'success': True}

@app.route('/updated')
def api_updated():
  global ACK_COMMANDS
  try:
    return {'last_updated': round(time.time()-LAST_UPDATED, 2), 'acked': ACK_COMMANDS}
  except TypeError:
    return {'last_updated': None, 'acked': ACK_COMMANDS}

@app.route('/recieve', methods=['POST'])
def api_receieve():
  global CLIENT_DEVICES, LAST_UPDATED, OUTGOING_DATA
  CLIENT_DEVICES = request.json['data']
  LAST_UPDATED = time.time()
  temp_data = copy.copy(OUTGOING_DATA)
  OUTGOING_DATA = []
  return {'outgoing_data': temp_data}

app.run(host='0.0.0.0', port=8080)
