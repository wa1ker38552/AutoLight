import requests
import asyncio
import kasa
import time
import os

async def discover_devices():
    data = []
    found = [i for i in await kasa.Discover.discover()]
    devices = [kasa.SmartDevice(host) for host in found]
    for i, dev in enumerate(devices):
        await dev.update()
        sys_info = dev.sys_info
        sys_info['host'] = found[i]
        obj = kasa.SmartDimmer(found[i])
        await obj.update()
        try:
            sys_info['is_on'] = obj.is_on
        except KeyError:
            sys_info['is_on'] = None

        data.append(sys_info)
    return data

async def main():
    int_counter = 0
    while True:
        if int_counter == 0:
            data = await discover_devices()
        request = requests.post('https://YOUR_URL_HERE/recieve', json={'data': data})
        print(f'Sent: {int_counter}')
        if request.json()['outgoing_data']:
            for cmd in request.json()['outgoing_data']:
                os.system(f'kasa {cmd}')
            requests.get(f'https://YOUR_URL_HERE/ack?commands={len(request.json()["outgoing_data"])}')
            print(f'Acked: {len(request.json()["outgoing_data"])}')
        time.sleep(5)
        int_counter += 1
        if int_counter == 6:
            int_counter = 0


asyncio.run(main())
