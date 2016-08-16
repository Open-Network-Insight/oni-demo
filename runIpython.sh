#!/bin/sh
ipython notebook --profile=ia --port=8889 --ip=0.0.0.0 --no-browser '--NotebookApp.extra_static_paths=["ui/ipython/"]'
