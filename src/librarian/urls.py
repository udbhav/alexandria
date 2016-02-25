from django.conf.urls import patterns, include, url
from django.contrib.auth.decorators import login_required

from librarian import views

urlpatterns = patterns(
    '',
    url(r'^import-sysex/$',
        login_required(views.ImportSysExView.as_view()), {},
        name='librarian_import_sysex'),
)
