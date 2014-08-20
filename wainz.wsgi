from __future__ import unicode_literals

import os, sys

PROJECT_ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.append('/home/wainz/')
sys.path.append(PROJECT_ROOT)
settings_module = "%s.settings" % PROJECT_ROOT.split(os.sep)[-1]
os.environ.setdefault("DJANGO_SETTINGS_MODULE", settings_module)
#os.environ.setdefault('LC_ALL', 'en_US.UTF-8')

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
