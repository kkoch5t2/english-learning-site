from .base import *
import os

ENV_NAME = os.environ.get("ENV_NAME")

if ENV_NAME == 'production':
    from .production import *
else:
    from .development import *