from django.shortcuts import render
from django.views.generic.base import TemplateView
from django.views.generic.edit import FormView

class AppView(TemplateView):
    template_name = "librarian/app.html"

class UploadSysExView(FormView):
    pass
