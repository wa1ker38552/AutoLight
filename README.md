# AutoLight
Control your lights from the web with Kasa and Python

Credits to the API wrapper used to communicate with Kasa lights. https://python-kasa.readthedocs.io/en/latest/smartdevice.html

**Setup**
On a device which is connected to the same network as your lights, run `client/main.py`. To install Kasa, run `pip install python-kasa` This program will send data to the server so that it can display it as well as recieve events from the server which it will execute.
On a server, run all the code in the `server` directory. This will create a flask application that recieves and sends data between the client. 
