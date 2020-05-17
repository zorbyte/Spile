from time import time


def end_loop(start_time, max_runtime):
    # Maximum runtime should be in seconds.
    return time() - start_time > max_runtime


def can_run_now(start_time, max_runtime):
    return time() - start_time < max_runtime
