from time import time
from utils.ping import StatusPing
from utils.time_util import can_run_now, end_loop

ping = StatusPing()
start_time = time()
# 15 Seconds.
duration = 15

while can_run_now(start_time, duration):
    resp = ping.get_status()
    if resp is not None:
        print("Successfully pinged!")

    if end_loop(start_time, duration):
        break
