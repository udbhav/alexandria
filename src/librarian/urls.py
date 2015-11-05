from django.conf.urls import patterns, include, url
from django.contrib.auth.decorators import login_required

from librarian import views

urlpatterns = patterns(
    '',
    url(r'^upload-sysex/$',
        login_required(views.UploadSysExView.as_view()), {},
        name='librarian_upload_sysex'),
)
